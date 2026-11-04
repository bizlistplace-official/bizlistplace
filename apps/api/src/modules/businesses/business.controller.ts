import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import { Business } from './business.model';
import { BusinessLocation } from './businessLocation.model';
import { Review } from '../reviews/review.model';
import { Category } from '../categories/category.model';
import { CategoryController } from '../categories/category.controller';
import { SearchService } from '../../services/search.service';
import { AuditService } from '../../services/audit.service';
import { EmailService } from '../../services/email.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { POPULAR_COUNTRIES } from '@bizpockethub/shared';

export class BusinessController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const results = await SearchService.search(req.query as any);
      res.json({
        success: true,
        ...results,
      });
    } catch (err) {
      next(err);
    }
  }

  // In-memory cache for featured businesses (5-minute TTL keyed by country)
  private static featuredCache: Record<string, { data: any[]; timestamp: number }> = {};
  private static readonly FEATURED_CACHE_TTL = 300_000;

  static async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

      const country = (req.query.country as string)?.trim()?.toUpperCase();
      const cacheKey = country || '__global__';
      const now = Date.now();

      if (
        BusinessController.featuredCache[cacheKey] &&
        now - BusinessController.featuredCache[cacheKey].timestamp < BusinessController.FEATURED_CACHE_TTL
      ) {
        res.json({
          success: true,
          data: BusinessController.featuredCache[cacheKey].data,
        });
        return;
      }

      const query: any = {
        listingStatus: 'published',
        isFeatured: true,
      };

      if (country) {
        const countryCodes =
          country === 'UK' || country === 'GB' || country === 'UNITED-KINGDOM'
            ? ['GB', 'UK']
            : country === 'US' || country === 'USA' || country === 'UNITED-STATES'
            ? ['US', 'USA']
            : country === 'PK' || country === 'PAKISTAN'
            ? ['PK']
            : [country];

        const matchingLocs = await BusinessLocation.find({
          countryCode: { $in: countryCodes },
        }).select('businessId').lean();
        const locBizIds = matchingLocs.map((l) => l.businessId);

        if (locBizIds.length > 0) {
          query.$or = [
            { countryCode: { $in: countryCodes } },
            { _id: { $in: locBizIds } },
          ];
        } else {
          query.countryCode = { $in: countryCodes };
        }
      }

      const featured = await Business.find(query)
        .select(
          '_id name slug shortDescription description categoryIds primaryCategory ratingAverage reviewCount isFeatured verificationStatus listingStatus businessType coverImageUrl logoUrl phone contactEmail website countryCode ownerId createdAt updatedAt publishedAt'
        )
        .limit(36)
        .populate('categoryIds')
        .lean();

      const bIds = featured.map((b) => b._id);
      const locations =
        bIds.length > 0
          ? await BusinessLocation.find({ businessId: { $in: bIds } })
              .select('businessId branchSlug branchName countryCode countryName region city postalCode addressLine1 addressLine2 isPrimary phone email coordinates')
              .lean()
          : [];

      const enriched = featured.map((b) => {
        const bLocs = locations.filter((l) => l.businessId.toString() === b._id.toString());
        return {
          ...b,
          locations: bLocs,
          primaryLocation: bLocs.find((l) => l.isPrimary) || bLocs[0] || null,
        };
      });

      BusinessController.featuredCache[cacheKey] = {
        data: enriched,
        timestamp: now,
      };

      res.json({
        success: true,
        data: enriched,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getRecent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const country = (req.query.country as string)?.trim()?.toUpperCase();
      const query: any = {
        listingStatus: 'published',
      };

      if (country) {
        const countryCodes =
          country === 'UK' || country === 'GB' || country === 'UNITED-KINGDOM'
            ? ['GB', 'UK']
            : country === 'US' || country === 'USA' || country === 'UNITED-STATES'
            ? ['US', 'USA']
            : country === 'PK' || country === 'PAKISTAN'
            ? ['PK']
            : [country];

        const matchingLocs = await BusinessLocation.find({
          countryCode: { $in: countryCodes },
        }).select('businessId').lean();
        const locBizIds = matchingLocs.map((l) => l.businessId);

        if (locBizIds.length > 0) {
          query.$or = [
            { countryCode: { $in: countryCodes } },
            { _id: { $in: locBizIds } },
          ];
        } else {
          query.countryCode = { $in: countryCodes };
        }
      }

      const recent = await Business.find(query)
        .select(
          '_id name slug shortDescription description categoryIds primaryCategory ratingAverage reviewCount isFeatured verificationStatus listingStatus businessType coverImageUrl logoUrl phone contactEmail website countryCode ownerId createdAt updatedAt publishedAt'
        )
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(12)
        .populate('categoryIds')
        .lean();

      const bIds = recent.map((b) => b._id);
      const locations =
        bIds.length > 0
          ? await BusinessLocation.find({ businessId: { $in: bIds } })
              .select('businessId branchSlug branchName countryCode countryName region city postalCode addressLine1 addressLine2 isPrimary phone email coordinates')
              .lean()
          : [];

      const enriched = recent.map((b) => {
        const bLocs = locations.filter((l) => l.businessId.toString() === b._id.toString());
        return {
          ...b,
          locations: bLocs,
          primaryLocation: bLocs.find((l) => l.isPrimary) || bLocs[0] || null,
        };
      });

      res.json({
        success: true,
        data: enriched,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const business = await Business.findOne({ slug })
        .populate('categoryIds')
        .populate('ownerId', 'name email role')
        .lean();

      if (!business) {
        res.status(404).json({
          success: false,
          message: 'Business not found.',
        });
        return;
      }

      // Check if not published: only owner or admin can view
      const user = (req as AuthenticatedRequest).user;
      const isOwner = user && business.ownerId && (business.ownerId as any)._id?.toString() === user._id.toString();
      const isAdmin = user && user.role === 'admin';

      if (business.listingStatus !== 'published' && !isOwner && !isAdmin) {
        res.status(404).json({
          success: false,
          message: 'Business listing is under review or not publicly available.',
        });
        return;
      }

      // Execute independent queries in parallel using Promise.all()
      const firstCatId = business.categoryIds[0] ? (business.categoryIds[0] as any)._id : null;
      const relatedQuery = firstCatId
        ? Business.find({
            _id: { $ne: business._id },
            categoryIds: firstCatId,
            listingStatus: 'published',
          })
            .select(
              '_id name slug shortDescription description categoryIds primaryCategory ratingAverage reviewCount isFeatured verificationStatus listingStatus businessType coverImageUrl logoUrl countryCode primaryLocation'
            )
            .limit(3)
            .populate('categoryIds')
            .lean()
        : Promise.resolve([]);

      const [locations, reviews, related] = await Promise.all([
        BusinessLocation.find({ businessId: business._id }).lean(),
        Review.find({
          businessId: business._id,
          moderationStatus: 'approved',
        })
          .populate('userId', 'name')
          .sort({ createdAt: -1 })
          .lean(),
        relatedQuery,
      ]);

      const primaryLocation = locations.find((l) => l.isPrimary) || locations[0] || null;

      res.json({
        success: true,
        data: {
          ...business,
          locations,
          primaryLocation,
          reviews,
          related,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const {
        name,
        description,
        shortDescription,
        website,
        contactEmail,
        phone,
        logoUrl,
        coverImageUrl,
        categoryIds,
        businessType,
        serviceAreas,
        socialLinks,
        primaryLocation,
      } = req.body;

      // Generate unique slug
      let baseSlug = slugify(name, { lower: true, strict: true });
      if (!baseSlug) baseSlug = 'business-' + Date.now();
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await Business.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      // Admins auto-approve; regular users start as pending
      const listingStatus = user.role === 'admin' ? 'published' : 'pending';
      const publishedAt = listingStatus === 'published' ? new Date() : null;

      const business = await Business.create({
        name,
        slug: uniqueSlug,
        ownerId: user._id,
        description,
        shortDescription: shortDescription || description.slice(0, 160) + '...',
        website: website || '',
        contactEmail: contactEmail || user.email,
        phone: phone || '',
        logoUrl: logoUrl || '',
        coverImageUrl: coverImageUrl || '',
        categoryIds,
        businessType: businessType || 'physical',
        countryCode: (primaryLocation?.countryCode || req.body.countryCode || 'PK').toUpperCase(),
        serviceAreas: serviceAreas || [],
        socialLinks: socialLinks || {},
        listingStatus,
        verificationStatus: 'unverified',
        publishedAt,
      });

      // If user is regular 'user', upgrade role to 'business_owner'
      if (user.role === 'user') {
        user.role = 'business_owner';
        await user.save();
      }

      // Create primary location if provided
      let createdLocation = null;
      if (primaryLocation) {
        const countryInfo = POPULAR_COUNTRIES.find(
          (c) => c.code === primaryLocation.countryCode?.toUpperCase()
        );

        createdLocation = await BusinessLocation.create({
          businessId: business._id,
          branchSlug: 'primary',
          branchName: primaryLocation.branchName || 'Headquarters',
          countryCode: primaryLocation.countryCode.toUpperCase(),
          countryName: countryInfo?.name || primaryLocation.countryCode,
          region: primaryLocation.region,
          city: primaryLocation.city,
          postalCode: primaryLocation.postalCode || '',
          addressLine1: primaryLocation.addressLine1,
          addressLine2: primaryLocation.addressLine2 || '',
          isPrimary: true,
          phone: primaryLocation.phone || phone || '',
          email: primaryLocation.email || contactEmail || '',
          openingHours: primaryLocation.openingHours || {},
          timezone: primaryLocation.timezone || 'UTC',
          coordinates:
            primaryLocation.latitude && primaryLocation.longitude
              ? {
                  type: 'Point',
                  coordinates: [primaryLocation.longitude, primaryLocation.latitude],
                }
              : undefined,
        });
      }

      await AuditService.log('business_created', 'business', business._id.toString(), {
        status: listingStatus,
      }, user._id, req.ip);

      // 1. Dispatch confirmation email to submitter
      EmailService.sendListingSubmissionConfirmation(
        business.contactEmail || user.email,
        business.name,
        user.name
      ).catch((err) => console.error('[SUBMISSION CONFIRMATION EMAIL ERROR]:', err?.message || err));

      // 2. Dispatch alert email to administrator
      EmailService.sendNewBusinessAdminAlert({
        name: business.name,
        slug: business.slug,
        contactEmail: business.contactEmail || user.email,
        city: createdLocation?.city,
        countryCode: business.countryCode,
      }).catch((err) => console.error('[NEW BUSINESS ADMIN EMAIL ERROR]:', err?.message || err));

      res.status(201).json({
        success: true,
        message:
          listingStatus === 'published'
            ? 'Listing created and published.'
            : 'Your business has been submitted successfully for review.',
        data: {
          business,
          location: createdLocation,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({
          success: false,
          message: 'Business not found.',
        });
        return;
      }

      // Check ownership or admin
      const isOwner = business.ownerId && business.ownerId.toString() === user._id.toString();
      const isAdmin = user.role === 'admin';

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'You are not authorized to update this listing.',
        });
        return;
      }

      // Fields to update
      const allowedFields = [
        'name',
        'description',
        'shortDescription',
        'website',
        'contactEmail',
        'phone',
        'logoUrl',
        'coverImageUrl',
        'categoryIds',
        'businessType',
        'serviceAreas',
        'socialLinks',
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          (business as any)[field] = req.body[field];
        }
      });

      // If regular user edits name, optionally update slug if desired or keep stable for SEO
      await business.save();

      await AuditService.log('business_updated', 'business', business._id.toString(), {}, user._id, req.ip);

      res.json({
        success: true,
        message: 'Listing updated successfully.',
        data: business,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      const isOwner = business.ownerId && business.ownerId.toString() === user._id.toString();
      const isAdmin = user.role === 'admin';

      if (!isOwner && !isAdmin) {
        res.status(403).json({ success: false, message: 'Permission denied.' });
        return;
      }

      await Business.findByIdAndDelete(id);
      await BusinessLocation.deleteMany({ businessId: id });
      await Review.deleteMany({ businessId: id });

      CategoryController.invalidateCache();

      await AuditService.log('business_deleted', 'business', id, {}, user._id, req.ip);

      res.json({
        success: true,
        message: 'Business listing and associated data removed.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const locations = await BusinessLocation.find({ businessId: id }).lean();
      res.json({
        success: true,
        data: locations,
      });
    } catch (err) {
      next(err);
    }
  }

  static async addLocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const business = await Business.findById(id);

      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      const isOwner = business.ownerId && business.ownerId.toString() === user._id.toString();
      const isAdmin = user.role === 'admin';

      if (!isOwner && !isAdmin) {
        res.status(403).json({ success: false, message: 'Permission denied.' });
        return;
      }

      const {
        branchName,
        countryCode,
        region,
        city,
        postalCode,
        addressLine1,
        addressLine2,
        isPrimary,
        phone,
        email,
        latitude,
        longitude,
        openingHours,
        timezone,
      } = req.body;

      let branchSlug = slugify(branchName, { lower: true, strict: true });
      let uniqueSlug = branchSlug;
      let counter = 1;
      while (await BusinessLocation.findOne({ businessId: id, branchSlug: uniqueSlug })) {
        uniqueSlug = `${branchSlug}-${counter++}`;
      }

      if (isPrimary) {
        await BusinessLocation.updateMany({ businessId: id }, { isPrimary: false });
      }

      const countryInfo = POPULAR_COUNTRIES.find((c) => c.code === countryCode.toUpperCase());

      const location = await BusinessLocation.create({
        businessId: id,
        branchSlug: uniqueSlug,
        branchName,
        countryCode: countryCode.toUpperCase(),
        countryName: countryInfo?.name || countryCode,
        region,
        city,
        postalCode: postalCode || '',
        addressLine1,
        addressLine2: addressLine2 || '',
        isPrimary: !!isPrimary,
        phone: phone || '',
        email: email || '',
        openingHours: openingHours || {},
        timezone: timezone || 'UTC',
        coordinates:
          latitude && longitude
            ? {
                type: 'Point',
                coordinates: [longitude, latitude],
              }
            : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Branch location added.',
        data: location,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getOwnerBusinesses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const businesses = await Business.find({ ownerId: user._id })
        .sort({ updatedAt: -1 })
        .populate('categoryIds')
        .lean();

      const bIds = businesses.map((b) => b._id);
      const locations = await BusinessLocation.find({ businessId: { $in: bIds } }).lean();

      const enriched = businesses.map((b) => ({
        ...b,
        locations: locations.filter((l) => l.businessId.toString() === b._id.toString()),
      }));

      res.json({
        success: true,
        data: enriched,
      });
    } catch (err) {
      next(err);
    }
  }
}
