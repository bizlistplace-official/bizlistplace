import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { mockCategories, mockBusinesses, mockCountries } from './mockData';
import { City } from 'country-state-city';

import { IBusiness } from '@bizpockethub/shared';

export const mockRouter = Router();

export function normalizeCountryCodes(input?: unknown): string[] {
  if (!input || typeof input !== 'string') return [];
  const raw = input.trim().toUpperCase();
  if (raw === 'PK' || raw === 'PAKISTAN') return ['PK'];
  if (raw === 'US' || raw === 'USA' || raw === 'UNITED-STATES' || raw === 'UNITED STATES') return ['US', 'USA'];
  if (raw === 'UK' || raw === 'GB' || raw === 'UNITED-KINGDOM' || raw === 'UNITED KINGDOM') return ['GB', 'UK'];
  return [raw];
}

export function matchesCountry(b: IBusiness, codes: string[]): boolean {
  if (!codes || codes.length === 0) return true;
  const directCode = (b.countryCode || '').toUpperCase();
  const locCode = (b.primaryLocation?.countryCode || '').toUpperCase();
  const otherLocCodes = (b.locations || []).map((l) => (l.countryCode || '').toUpperCase());
  return codes.includes(directCode) || codes.includes(locCode) || otherLocCodes.some((c) => codes.includes(c));
}

// Auth Endpoints for Mock / Standalone Mode
mockRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been dispatched.',
  });
});

mockRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Password reset successfully. You can now log in with your new password.',
  });
});

mockRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body || {};
  const mockUser = {
    _id: 'mock-user-1',
    name: email ? email.split('@')[0] : 'Demo User',
    email: email || 'demo@bizpockethub.com',
    role: email?.includes('admin') ? 'admin' : (email?.includes('owner') ? 'business_owner' : 'user'),
    accountStatus: 'active',
    emailVerifiedAt: new Date(),
    createdAt: new Date(),
  };

  const token = jwt.sign(
    { userId: mockUser._id, role: mockUser.role },
    config.jwt.secret || 'dev-secret-key',
    { expiresIn: '7d' }
  );

  res.cookie(config.cookie.name || 'bizpockethub_jwt', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.json({
    success: true,
    message: 'Logged in successfully.',
    data: {
      user: mockUser,
      token,
    },
  });
});

mockRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, role } = req.body || {};
  const mockUser = {
    _id: `mock-user-${Date.now()}`,
    name: name || 'Demo User',
    email: email || 'demo@bizpockethub.com',
    role: role === 'business_owner' ? 'business_owner' : 'user',
    accountStatus: 'active',
    emailVerifiedAt: new Date(),
    createdAt: new Date(),
  };

  const token = jwt.sign(
    { userId: mockUser._id, role: mockUser.role },
    config.jwt.secret || 'dev-secret-key',
    { expiresIn: '7d' }
  );

  res.cookie(config.cookie.name || 'bizpockethub_jwt', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.status(201).json({
    success: true,
    message: 'Account registered successfully.',
    data: {
      user: mockUser,
      token,
    },
  });
});

mockRouter.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie(config.cookie.name || 'bizpockethub_jwt', { path: '/' });
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

mockRouter.get('/auth/me', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      user: {
        _id: 'mock-user-1',
        name: 'Demo User',
        email: 'demo@bizpockethub.com',
        role: 'user',
        accountStatus: 'active',
        emailVerifiedAt: new Date(),
        createdAt: new Date(),
      },
    },
  });
});

// Categories
const mockCategoryCache: Record<string, { data: any[]; timestamp: number }> = {};
const MOCK_CAT_CACHE_TTL = 180_000;

mockRouter.get('/categories', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=600');
  const codes = normalizeCountryCodes(req.query.country);
  const cacheKey = codes.slice().sort().join(',') || '__all__';
  const now = Date.now();

  if (mockCategoryCache[cacheKey] && now - mockCategoryCache[cacheKey].timestamp < MOCK_CAT_CACHE_TTL) {
    return res.json({
      success: true,
      data: mockCategoryCache[cacheKey].data,
    });
  }

  const filteredBusinesses = codes.length > 0
    ? mockBusinesses.filter((b) => matchesCountry(b, codes))
    : mockBusinesses;

  const categoriesWithCount = mockCategories.map((cat) => {
    const count = filteredBusinesses.filter((b) =>
      b.categoryIds?.some((id) =>
        typeof id === 'string'
          ? id === cat._id || id === cat.slug
          : id._id === cat._id || id.slug === cat.slug
      ) ||
      b.primaryCategory?.slug === cat.slug ||
      b.primaryCategory?._id === cat._id
    ).length;
    return {
      ...cat,
      businessCount: count,
    };
  });

  mockCategoryCache[cacheKey] = {
    data: categoriesWithCount,
    timestamp: now,
  };

  res.json({
    success: true,
    data: categoriesWithCount,
  });
});

mockRouter.get('/categories/:slug', (req: Request, res: Response) => {
  const cleanSlug = (req.params.slug || '').replace(/[:.,]+$/, '');
  const cat = mockCategories.find((c) => c.slug === cleanSlug);
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }
  const codes = normalizeCountryCodes(req.query.country);
  const filteredBusinesses = codes.length > 0
    ? mockBusinesses.filter((b) => matchesCountry(b, codes))
    : mockBusinesses;

  const count = filteredBusinesses.filter((b) =>
    b.categoryIds?.some((id) =>
      typeof id === 'string'
        ? id === cat._id || id === cat.slug
        : id._id === cat._id || id.slug === cat.slug
    ) ||
    b.primaryCategory?.slug === cat.slug ||
    b.primaryCategory?._id === cat._id
  ).length;
  return res.json({ success: true, data: { ...cat, businessCount: count } });
});

mockRouter.get('/categories/:slug/businesses', (req: Request, res: Response) => {
  const cleanSlug = (req.params.slug || '').replace(/[:.,]+$/, '');
  const cat = mockCategories.find((c) => c.slug === cleanSlug);
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  const { country, page = '1', limit = '12' } = req.query;
  let results = mockBusinesses.filter((b) =>
    b.categoryIds.some(
      (id) =>
        (typeof id === 'string' ? id === cat._id || id === cat.slug : id._id === cat._id || id.slug === cat.slug)
    ) ||
    b.primaryCategory?.slug === cat.slug ||
    b.primaryCategory?._id === cat._id
  );

  const codes = normalizeCountryCodes(country);
  if (codes.length > 0) {
    results = results.filter((b) => matchesCountry(b, codes));
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 12;
  const startIndex = (pageNum - 1) * limitNum;
  const paged = results.slice(startIndex, startIndex + limitNum).map((b) => {
    const seen = new Set<string>();
    return {
      ...b,
      categoryIds: b.categoryIds
        .map((id) =>
          typeof id === 'object' ? id : mockCategories.find((c) => c._id === id || c.slug === id) || cat
        )
        .filter((c: any) => {
          const key = c?._id || c?.slug;
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        }),
    };
  });

  res.json({
    success: true,
    data: paged,
    pagination: {
      total: results.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(Math.ceil(results.length / limitNum), 1),
    },
  });
});

// Locations
mockRouter.get('/locations/countries', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: mockCountries,
  });
});

const cscCitiesCache = new Map<string, { name: string; slug: string; countryCode: string; stateCode?: string }[]>();

function getCountryAllCities(countryCode: string) {
  const code = countryCode.toUpperCase();
  const normalizedCode = code === 'UK' ? 'GB' : code === 'USA' ? 'US' : code;
  if (cscCitiesCache.has(normalizedCode)) {
    return cscCitiesCache.get(normalizedCode)!;
  }
  const raw = City.getCitiesOfCountry(normalizedCode) || [];
  const seen = new Set<string>();
  const list: { name: string; slug: string; countryCode: string; stateCode?: string }[] = [];
  for (const c of raw) {
    const trimmed = c.name.trim();
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      list.push({
        name: trimmed,
        slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        countryCode: normalizedCode,
        stateCode: c.stateCode,
      });
    }
  }
  list.sort((a, b) => a.name.localeCompare(b.name));
  cscCitiesCache.set(normalizedCode, list);
  return list;
}

mockRouter.get('/locations/cities', (req: Request, res: Response) => {
  const countryQuery = req.query.country as string | undefined;
  const searchQuery = ((req.query.search || req.query.q) as string | undefined)?.trim().toLowerCase();
  const limitParam = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

  const countryCodes = normalizeCountryCodes(countryQuery);
  const candidateCities: { name: string; slug: string; countryCode: string; count: number }[] = [];
  const seen = new Set<string>();

  if (countryCodes.length > 0) {
    // When a specific country is requested, ONLY load cities belonging to that country!
    for (const code of countryCodes) {
      const normalizedCode = code === 'UK' ? 'GB' : code === 'USA' ? 'US' : code;
      const cscCities = getCountryAllCities(normalizedCode);
      for (const city of cscCities) {
        const key = city.name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          candidateCities.push({
            name: city.name,
            slug: city.slug,
            countryCode: normalizedCode,
            count: 0,
          });
        }
      }

      // Also merge any business primaryLocation cities matching this country
      mockBusinesses
        .filter((b) => matchesCountry(b, [code]))
        .forEach((b) => {
          if (b.primaryLocation?.city) {
            const cityName = b.primaryLocation.city.trim();
            const key = cityName.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              candidateCities.push({
                name: cityName,
                slug: cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                countryCode: normalizedCode,
                count: 0,
              });
            }
          }
        });
    }
  } else {
    // If no country specified, return cities from popular directories & mock businesses
    const defaultCodes = ['PK', 'US', 'GB'];
    for (const code of defaultCodes) {
      const cscCities = getCountryAllCities(code).slice(0, 50);
      for (const city of cscCities) {
        const key = city.name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          candidateCities.push({
            name: city.name,
            slug: city.slug,
            countryCode: city.countryCode,
            count: 0,
          });
        }
      }
    }
    mockBusinesses.forEach((b) => {
      if (b.primaryLocation?.city) {
        const cityName = b.primaryLocation.city.trim();
        const key = cityName.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          candidateCities.push({
            name: cityName,
            slug: cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            countryCode: b.countryCode || b.primaryLocation.countryCode || 'US',
            count: 0,
          });
        }
      }
    });
  }

  // Calculate actual business counts efficiently using Map
  const cityCountMap = new Map<string, number>();
  for (const b of mockBusinesses) {
    if (matchesCountry(b, countryCodes)) {
      if (b.primaryLocation?.city) {
        const k = b.primaryLocation.city.trim().toLowerCase();
        cityCountMap.set(k, (cityCountMap.get(k) || 0) + 1);
      }
      for (const loc of b.locations || []) {
        if (loc.city) {
          const k = loc.city.trim().toLowerCase();
          cityCountMap.set(k, (cityCountMap.get(k) || 0) + 1);
        }
      }
    }
  }

  for (const item of candidateCities) {
    item.count = cityCountMap.get(item.name.toLowerCase()) || 0;
  }

  // Filter by search query if provided
  let filtered = candidateCities;
  if (searchQuery) {
    filtered = candidateCities.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery) ||
        c.slug.includes(searchQuery)
    );
  }

  // Sort alphabetically
  filtered.sort((a, b) => a.name.localeCompare(b.name));

  // If a limit is explicitly requested, slice
  const result = limitParam && limitParam > 0 ? filtered.slice(0, limitParam) : filtered;

  res.json({
    success: true,
    total: filtered.length,
    data: result,
  });
});

// Businesses
mockRouter.get('/businesses/featured', (req: Request, res: Response) => {
  const countryCodes = normalizeCountryCodes(req.query.country);

  // Sort: more reviews preferred, latest listing preferred
  const sorted = [...mockBusinesses]
    .filter((b) => matchesCountry(b, countryCodes))
    .filter((b) => b.isFeatured || (b.reviewCount && b.reviewCount > 0))
    .sort((a, b) => {
      // Prioritize more reviews, then latest creation date
      const revA = a.reviewCount || 0;
      const revB = b.reviewCount || 0;
      if (revB !== revA) return revB - revA;

      const timeA = new Date(a.createdAt || a.publishedAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.publishedAt || 0).getTime();
      return timeB - timeA;
    });

  res.json({
    success: true,
    data: sorted,
  });
});

// Create business listing
mockRouter.post('/businesses', (req: Request, res: Response) => {
  const body = req.body || {};
  const rawName = body.name || 'New Business Listing';
  const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const derivedCountryCode = (body.countryCode || body.primaryLocation?.countryCode || 'PK').toUpperCase();
  const currentUserId = (req as any).user?.id || (req as any).user?._id || mockCurrentUser?._id || 'mock-user-1';
  const userRole = (req as any).user?.role || mockCurrentUser?.role || 'user';
  const listingStatus = userRole === 'admin' ? 'published' : 'pending';

  const newBiz: any = {
    _id: `biz_${Date.now()}`,
    ownerId: currentUserId,
    name: rawName,
    slug: slug,
    description: body.description || '',
    shortDescription: body.shortDescription || (body.description ? body.description.slice(0, 120) : ''),
    website: body.website || '',
    contactEmail: body.contactEmail || '',
    phone: body.phone || '+1 (555) 000-0000',
    businessType: body.businessType || 'physical',
    listingStatus: listingStatus,
    verificationStatus: 'unverified',
    countryCode: derivedCountryCode,
    isFeatured: false,
    ratingAverage: 0,
    reviewCount: 0,
    categoryIds: body.categoryIds || ['education'],
    primaryCategory: mockCategories.find((c) => c._id === body.primaryCategoryId || c.slug === body.primaryCategoryId) || mockCategories[0],
    publishedAt: listingStatus === 'published' ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    primaryLocation: body.primaryLocation || {
      city: body.city || (derivedCountryCode === 'PK' ? 'Lahore' : derivedCountryCode === 'GB' ? 'London' : 'New York'),
      countryName: body.countryName || (derivedCountryCode === 'PK' ? 'Pakistan' : derivedCountryCode === 'GB' ? 'United Kingdom' : 'United States'),
      countryCode: derivedCountryCode,
    },
    locations: body.primaryLocation ? [body.primaryLocation] : [],
  };

  mockBusinesses.unshift(newBiz);

  res.status(201).json({
    success: true,
    data: {
      business: newBiz,
      location: newBiz.primaryLocation,
      ...newBiz,
    },
    message:
      listingStatus === 'published'
        ? 'Listing created and published.'
        : 'Your business has been submitted successfully for review.',
  });
});

mockRouter.get('/businesses/recent', (req: Request, res: Response) => {
  const countryCodes = normalizeCountryCodes(req.query.country);
  const filtered = mockBusinesses
    .filter((b) => matchesCountry(b, countryCodes))
    .slice(0, 8);

  res.json({
    success: true,
    data: filtered,
  });
});

mockRouter.get('/businesses', (req: Request, res: Response) => {
  const { q, category, country, city, isFeatured, sort, page = '1', limit = '12' } = req.query;
  let results = [...mockBusinesses];

  const countryCodes = normalizeCountryCodes(country);
  if (countryCodes.length > 0) {
    results = results.filter((b) => matchesCountry(b, countryCodes));
  }

  if (isFeatured === 'true') {
    results = results.filter((b) => b.isFeatured);
  }

  if (q && typeof q === 'string') {
    const term = q.toLowerCase();
    results = results.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.description.toLowerCase().includes(term) ||
        b.shortDescription?.toLowerCase().includes(term) ||
        b.primaryCategory?.name.toLowerCase().includes(term) ||
        b.primaryCategory?.slug.toLowerCase().includes(term) ||
        (b as any).tags?.some((t: string) => t.toLowerCase().includes(term)) ||
        (term.includes('restaurant') && ((b as any).tags?.includes('bistro') || (b as any).tags?.includes('food') || b.primaryCategory?.slug.includes('hospitality'))) ||
        (term.includes('retail') && ((b as any).tags?.includes('ecommerce') || b.primaryCategory?.slug.includes('retail'))) ||
        (term.includes('it') && ((b as any).tags?.includes('cloud') || (b as any).tags?.includes('software') || (b as any).tags?.includes('digital') || b.primaryCategory?.slug.includes('technology'))) ||
        (term.includes('hospital') && ((b as any).tags?.includes('clinic') || (b as any).tags?.includes('medical') || b.primaryCategory?.slug.includes('healthcare')))
    );
  }

  if (category && typeof category === 'string') {
    results = results.filter((b) =>
      b.categoryIds.some((id) => (typeof id === 'string' ? id === category : id.slug === category || id._id === category)) ||
      b.primaryCategory?.slug === category ||
      b.primaryCategory?._id === category
    );
  }

  if (city && typeof city === 'string') {
    results = results.filter(
      (b) => b.primaryLocation?.city.toLowerCase() === city.toLowerCase()
    );
  }

  if (sort === 'rating') {
    results.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
  } else if (sort === 'reviews') {
    results.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 12;
  const startIndex = (pageNum - 1) * limitNum;
  const paged = results.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    data: paged,
    total: results.length,
    page: pageNum,
    totalPages: Math.ceil(results.length / limitNum),
  });
});

mockRouter.get('/businesses/:slug', (req: Request, res: Response) => {
  const cleanSlug = (req.params.slug || '').replace(/[:.,]+$/, '');
  const business = mockBusinesses.find((b) => b.slug === cleanSlug);
  if (!business) {
    return res.status(404).json({ success: false, message: 'Business listing not found.' });
  }

  // Populate categoryIds with full unique category objects
  const seenCatIds = new Set<string>();
  const populatedCategories = business.categoryIds
    .map((idOrCat) => {
      if (typeof idOrCat === 'object' && idOrCat !== null) return idOrCat;
      return (
        mockCategories.find((c) => c._id === idOrCat || c.slug === idOrCat) || {
          _id: String(idOrCat),
          name: business.primaryCategory?.name || 'General Business',
          slug: business.primaryCategory?.slug || 'technology-software',
        }
      );
    })
    .filter((cat) => {
      const key = (cat as any)?._id || (cat as any)?.slug;
      if (!key || seenCatIds.has(key)) return false;
      seenCatIds.add(key);
      return true;
    });

  const bizCountryCodes = normalizeCountryCodes(business.countryCode || business.primaryLocation?.countryCode);
  const related = mockBusinesses
    .filter((b) => b.slug !== business.slug && matchesCountry(b, bizCountryCodes))
    .slice(0, 3)
    .map((b) => {
      const seenRel = new Set<string>();
      return {
        ...b,
        categoryIds: b.categoryIds
          .map((catId) =>
            typeof catId === 'object' ? catId : mockCategories.find((c) => c._id === catId || c.slug === catId)
          )
          .filter((cat: any) => {
            const key = cat?._id || cat?.slug;
            if (!key || seenRel.has(key)) return false;
            seenRel.add(key);
            return true;
          }),
      };
    });

  const bizReviews = getMockReviews(business._id);

  return res.json({
    success: true,
    data: {
      ...business,
      categoryIds: populatedCategories,
      reviews: bizReviews,
      related,
    },
  });
});

const inMemoryMockReviews: Record<string, any[]> = {};

function getMockReviews(bizIdOrSlug: string): any[] {
  if (!inMemoryMockReviews[bizIdOrSlug]) {
    inMemoryMockReviews[bizIdOrSlug] = [];
  }
  return inMemoryMockReviews[bizIdOrSlug];
}

mockRouter.get('/businesses/:id/reviews', (req: Request, res: Response) => {
  const bizId = req.params.id;
  const biz = mockBusinesses.find((b) => b._id === bizId || b.slug === bizId);
  const targetId = biz ? biz._id : bizId;
  res.json({
    success: true,
    data: getMockReviews(targetId),
  });
});

mockRouter.post('/businesses/:id/reviews', (req: Request, res: Response) => {
  const bizId = req.params.id;
  const biz = mockBusinesses.find((b) => b._id === bizId || b.slug === bizId);
  const targetId = biz ? biz._id : bizId;
  const { rating = 5, title = '', content = '', authorName = '' } = req.body || {};

  const token = req.cookies?.[config.cookie.name || 'bizpockethub_jwt'] || req.cookies?.bizpockethub_token;
  let decodedUser: any = null;
  if (token) {
    try {
      decodedUser = jwt.verify(token, config.jwt.secret || 'dev-secret-key');
    } catch {
      // unauthenticated / guest
    }
  }

  const reviewAuthor = (authorName && String(authorName).trim()) || (decodedUser?.name) || 'Customer';

  const newReview = {
    _id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    businessId: targetId,
    userId: decodedUser ? { _id: decodedUser.userId || 'u_demo', name: reviewAuthor } : null,
    authorName: reviewAuthor,
    rating: Math.max(1, Math.min(5, Number(rating) || 5)),
    title: String(title || 'Helpful Customer Experience').trim(),
    content: String(content || 'Prompt response and pleasant experience working with them.').trim(),
    moderationStatus: 'approved',
    createdAt: new Date().toISOString(),
  };

  const list = getMockReviews(targetId);
  list.unshift(newReview);

  if (biz) {
    const validRatings = list.map((r) => r.rating || 5);
    const sum = validRatings.reduce((acc, curr) => acc + curr, 0);
    biz.reviewCount = validRatings.length;
    biz.ratingAverage = Math.round((sum / validRatings.length) * 10) / 10;
  }

  res.status(201).json({
    success: true,
    message: 'Your review has been published. Thank you for your feedback!',
    data: newReview,
  });
});

// In-memory current user for demo session
let mockCurrentUser: any = null;

// Auth endpoints
mockRouter.get('/auth/me', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      user: mockCurrentUser,
    },
  });
});

mockRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = {
    _id: 'user_demo_1',
    name: 'Demo Directory User',
    email: email || 'user@bizpockethub.com',
    role: email?.includes('admin') ? 'admin' : 'business_owner',
  };
  mockCurrentUser = user;
  res.cookie('bizpockethub_token', 'demo-token-active', { httpOnly: true, sameSite: 'lax' });
  res.json({
    success: true,
    message: 'Logged in successfully.',
    data: {
      token: 'demo-jwt-token-active',
      user,
    },
  });
});

mockRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, role } = req.body;
  const user = {
    _id: `user_demo_${Date.now()}`,
    name: name || 'New User',
    email: email || 'user@bizpockethub.com',
    role: role || 'business_owner',
  };
  mockCurrentUser = user;
  res.cookie('bizpockethub_token', 'demo-token-active', { httpOnly: true, sameSite: 'lax' });
  res.json({
    success: true,
    message: 'Registered successfully.',
    data: {
      token: 'demo-jwt-token-active',
      user,
    },
  });
});

mockRouter.post('/auth/logout', (req: Request, res: Response) => {
  mockCurrentUser = null;
  res.clearCookie('bizpockethub_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Owner dashboard endpoints
mockRouter.get('/owner/businesses', (req: Request, res: Response) => {
  const currentUserId = (req as any).user?.id || (req as any).user?._id || mockCurrentUser?._id || 'mock-user-1';
  const userBiz = mockBusinesses.filter((b) => b.ownerId === currentUserId);
  const others = mockBusinesses.filter((b) => b.ownerId !== currentUserId);
  const data = userBiz.length > 0
    ? [...userBiz, ...others.slice(0, Math.max(0, 3 - userBiz.length))]
    : mockBusinesses.slice(0, 3);

  res.json({
    success: true,
    data,
    pagination: {
      total: data.length,
      page: 1,
      limit: 12,
      totalPages: 1,
    },
  });
});

mockRouter.get('/owner/claims', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
    },
  });
});

// Branch & Locations
mockRouter.post('/businesses/:id/locations', (req: Request, res: Response) => {
  const biz = mockBusinesses.find((b) => b._id === req.params.id);
  if (biz) {
    biz.locations = biz.locations || [];
    biz.locations.push({
      businessId: biz._id,
      ...req.body,
      isPrimary: false,
    });
  }
  res.json({
    success: true,
    message: 'Location branch added successfully.',
  });
});

// Admin endpoints
mockRouter.get('/admin/stats', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalBusinesses: mockBusinesses.length,
      pendingBusinesses: 0,
      totalUsers: 1420,
      pendingClaims: 0,
      openReports: 0,
    },
  });
});

mockRouter.get('/admin/businesses/pending', (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

mockRouter.get('/admin/claims/pending', (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

mockRouter.get('/admin/reports', (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

