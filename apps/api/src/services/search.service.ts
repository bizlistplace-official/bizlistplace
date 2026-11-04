import { FilterQuery, Types } from 'mongoose';
import { Business, IBusinessDocument } from '../modules/businesses/business.model';
import { BusinessLocation } from '../modules/businesses/businessLocation.model';
import { Category } from '../modules/categories/category.model';
import { ISearchFilters, IPaginatedResult, IBusiness } from '@bizpockethub/shared';

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// In-memory cache for category slug -> ObjectId mapping (10-minute TTL)
const categorySlugCache = new Map<string, { id: Types.ObjectId; timestamp: number }>();
const CATEGORY_CACHE_TTL = 10 * 60 * 1000;

export class SearchService {
  static invalidateCategoryCache(): void {
    categorySlugCache.clear();
  }

  static async search(
    filters: ISearchFilters,
    includeUnpublished = false
  ): Promise<IPaginatedResult<IBusiness>> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(filters.limit) || 12));
    const skip = (page - 1) * limit;

    const query: FilterQuery<IBusinessDocument> = {};

    // 1. Status Filter
    if (!includeUnpublished) {
      query.listingStatus = 'published';
    }

    // 2. Keyword Search (Safe regex with ReDoS protection across name, shortDescription, description, serviceAreas)
    if (filters.q && filters.q.trim()) {
      const sanitized = filters.q.trim();
      const escaped = escapeRegex(sanitized);

      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { shortDescription: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { serviceAreas: { $regex: escaped, $options: 'i' } },
      ];
    }

    // 3. Category Filter with in-memory resolution cache
    if (filters.category && filters.category.trim()) {
      const categorySlug = filters.category.trim().toLowerCase();
      const now = Date.now();
      const cached = categorySlugCache.get(categorySlug);

      if (cached && now - cached.timestamp < CATEGORY_CACHE_TTL) {
        query.categoryIds = cached.id;
      } else {
        const cat = await Category.findOne({
          $or: [
            { slug: categorySlug },
            ...(Types.ObjectId.isValid(categorySlug) ? [{ _id: categorySlug }] : []),
          ],
        }).select('_id slug').lean();

        if (cat) {
          categorySlugCache.set(categorySlug, { id: cat._id as Types.ObjectId, timestamp: now });
          query.categoryIds = cat._id;
        } else {
          // Category does not exist, return empty results immediately without querying Business collection
          return {
            data: [],
            pagination: {
              total: 0,
              page,
              limit,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          };
        }
      }
    }

    // 4. Strict Country / City Location Filter
    if (filters.country || filters.city) {
      const locQuery: Record<string, unknown> = {};
      let countryCodes: string[] = [];

      if (filters.country) {
        const raw = filters.country.trim().toUpperCase();
        if (raw === 'UK' || raw === 'GB' || raw === 'UNITED-KINGDOM' || raw === 'UNITED KINGDOM') {
          countryCodes = ['GB', 'UK'];
        } else if (raw === 'US' || raw === 'USA' || raw === 'UNITED-STATES' || raw === 'UNITED STATES') {
          countryCodes = ['US', 'USA'];
        } else if (raw === 'PK' || raw === 'PAKISTAN') {
          countryCodes = ['PK'];
        } else {
          countryCodes = [raw];
        }
        locQuery.countryCode = { $in: countryCodes };
      }

      if (filters.city) {
        locQuery.city = { $regex: new RegExp(`^${escapeRegex(filters.city.trim())}$`, 'i') };
      }

      query.$and = query.$and || [];

      if (filters.city) {
        // City specified: query BusinessLocation for matching business IDs using distinct index scan
        const businessIds = await BusinessLocation.distinct('businessId', locQuery);

        // If no locations exist in that city, return early to save unnecessary database round-trips
        if (businessIds.length === 0) {
          return {
            data: [],
            pagination: {
              total: 0,
              page,
              limit,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          };
        }

        query.$and.push({ _id: { $in: businessIds } });
      } else if (countryCodes.length > 0) {
        // Country specified without city: find foreign branch businesses plus direct country matches
        // Using distinct on businessId avoids omitting valid businesses beyond an arbitrary limit
        const branchIds = await BusinessLocation.distinct('businessId', {
          countryCode: { $in: countryCodes },
        });

        if (branchIds.length > 0) {
          query.$and.push({
            $or: [
              { countryCode: { $in: countryCodes } },
              { _id: { $in: branchIds } },
            ],
          });
        } else {
          query.$and.push({ countryCode: { $in: countryCodes } });
        }
      }
    }

    // 5. Verification status
    if (filters.verifiedOnly) {
      query.verificationStatus = 'verified';
    }

    // 6. Business Type
    if (filters.businessType) {
      query.businessType = filters.businessType;
    }

    // 7. Sorting
    let sortOptions: Record<string, 1 | -1> = { isFeatured: -1, createdAt: -1 };
    if (filters.sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (filters.sort === 'rating') {
      sortOptions = { ratingAverage: -1, reviewCount: -1 };
    } else if (filters.sort === 'name_asc') {
      sortOptions = { name: 1 };
    }

    // Execute count and paginated list concurrently using Promise.all() with field projection
    const [totalCount, businesses] = await Promise.all([
      Business.countDocuments(query),
      Business.find(query)
        .select(
          '_id name slug shortDescription description categoryIds primaryCategory ratingAverage reviewCount isFeatured verificationStatus listingStatus businessType coverImageUrl logoUrl phone contactEmail website countryCode ownerId createdAt updatedAt publishedAt'
        )
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('categoryIds', '_id name slug')
        .lean(),
    ]);

    // On page 1 with results < limit, count is guaranteed to match length
    const total = (page === 1 && businesses.length < limit && totalCount === 0) ? businesses.length : totalCount;

    // Fetch primary locations for found businesses with field projection
    const bIds = businesses.map((b) => b._id);
    const locations =
      bIds.length > 0
        ? await BusinessLocation.find({ businessId: { $in: bIds } })
            .select('businessId branchSlug branchName countryCode countryName region city postalCode addressLine1 addressLine2 isPrimary phone email coordinates')
            .lean()
        : [];

    const formattedData: IBusiness[] = businesses.map((b: any) => {
      const bizLocations = locations.filter(
        (l) => l.businessId.toString() === b._id.toString()
      );
      const primaryLoc =
        bizLocations.find((l) => l.isPrimary) || bizLocations[0] || undefined;

      return {
        ...b,
        _id: b._id.toString(),
        ownerId: b.ownerId ? b.ownerId.toString() : undefined,
        categoryIds: b.categoryIds as unknown as IBusiness['categoryIds'],
        locations: bizLocations as unknown as IBusiness['locations'],
        primaryLocation: primaryLoc as unknown as IBusiness['primaryLocation'],
        createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt),
        updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : String(b.updatedAt),
        publishedAt: b.publishedAt ? (b.publishedAt instanceof Date ? b.publishedAt.toISOString() : String(b.publishedAt)) : undefined,
      } as unknown as IBusiness;
    });

    return {
      data: formattedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }
}
