import { Request, Response, NextFunction } from 'express';
import { BusinessLocation } from '../businesses/businessLocation.model';
import { Business } from '../businesses/business.model';
import { ALL_GLOBAL_COUNTRIES } from '@bizpockethub/shared';
import { City } from 'country-state-city';

export class LocationController {
  private static countriesCache: { data: any[]; timestamp: number } | null = null;
  private static citiesCache: Map<string, { data: any[]; timestamp: number }> = new Map();
  private static cscCitiesCache: Map<string, { name: string; slug: string; countryCode: string; stateCode?: string }[]> = new Map();
  private static readonly CACHE_TTL = 300_000; // 5 minutes

  private static getCountryAllCities(countryCode: string) {
    const code = countryCode.toUpperCase();
    const normalizedCode = code === 'UK' ? 'GB' : code === 'USA' ? 'US' : code;
    if (LocationController.cscCitiesCache.has(normalizedCode)) {
      return LocationController.cscCitiesCache.get(normalizedCode)!;
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
    LocationController.cscCitiesCache.set(normalizedCode, list);
    return list;
  }

  static async listCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

      const now = Date.now();
      if (
        LocationController.countriesCache &&
        now - LocationController.countriesCache.timestamp < LocationController.CACHE_TTL
      ) {
        res.json({
          success: true,
          data: LocationController.countriesCache.data,
        });
        return;
      }

      // Find published business IDs
      let countMap = new Map<string, { count: number; cities: string[] }>();
      try {
        const published = await Business.find({ listingStatus: 'published' }).select('_id');
        const publishedIds = published.map((p) => p._id);

        const countryCounts = await BusinessLocation.aggregate([
          { $match: { businessId: { $in: publishedIds } } },
          { $group: { _id: '$countryCode', count: { $sum: 1 }, cities: { $addToSet: '$city' } } },
        ]);

        countryCounts.forEach((c) => {
          countMap.set(c._id.toUpperCase(), { count: c.count, cities: c.cities });
        });
      } catch {
        // Fallback if db offline
      }

      const result = ALL_GLOBAL_COUNTRIES.map((country) => {
        const stats = countMap.get(country.code) || { count: 0, cities: [] };
        return {
          ...country,
          businessCount: stats.count,
          count: stats.count,
          activeCities: stats.cities,
        };
      });

      LocationController.countriesCache = {
        data: result,
        timestamp: now,
      };

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static invalidateCache(): void {
    LocationController.countriesCache = null;
    LocationController.citiesCache.clear();
  }

  static async listCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

      const countryQuery = (req.query.country as string)?.trim().toUpperCase();
      const searchQuery = ((req.query.search || req.query.q) as string)?.trim().toLowerCase();
      const limitParam = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const now = Date.now();
      const countryKey =
        countryQuery && countryQuery !== 'ALL'
          ? countryQuery === 'UK'
            ? 'GB'
            : countryQuery === 'USA'
            ? 'US'
            : countryQuery
          : '__DEFAULT_TOP_CITIES__';

      let candidateCities: { name: string; slug: string; countryCode: string; count: number }[];

      // Check if processed cities list with counts is already cached for this country
      const cached = LocationController.citiesCache.get(countryKey);
      if (cached && now - cached.timestamp < LocationController.CACHE_TTL) {
        candidateCities = cached.data;
      } else {
        const builtCities: { name: string; slug: string; countryCode: string; count: number }[] = [];
        const seen = new Set<string>();

        if (countryKey !== '__DEFAULT_TOP_CITIES__') {
          const normalizedCode = countryKey;
          const cscCities = LocationController.getCountryAllCities(normalizedCode);
          for (const city of cscCities) {
            const key = city.name.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              builtCities.push({
                name: city.name,
                slug: city.slug,
                countryCode: normalizedCode,
                count: 0,
              });
            }
          }

          // Query database for matching business counts
          try {
            const cityStats = await BusinessLocation.aggregate([
              { $match: { countryCode: normalizedCode } },
              { $group: { _id: '$city', count: { $sum: 1 } } },
            ]);
            const countMap = new Map<string, number>();
            cityStats.forEach((c) => countMap.set(c._id.toLowerCase(), c.count));

            for (const item of builtCities) {
              item.count = countMap.get(item.name.toLowerCase()) || 0;
            }
          } catch {
            // If database offline, count stays 0
          }
        } else {
          // Return default major cities across top directories
          const defaultCodes = ['PK', 'US', 'GB'];
          for (const code of defaultCodes) {
            const cscCities = LocationController.getCountryAllCities(code).slice(0, 50);
            for (const city of cscCities) {
              const key = city.name.toLowerCase();
              if (!seen.has(key)) {
                seen.add(key);
                builtCities.push({
                  name: city.name,
                  slug: city.slug,
                  countryCode: code,
                  count: 0,
                });
              }
            }
          }
        }

        builtCities.sort((a, b) => a.name.localeCompare(b.name));
        candidateCities = builtCities;

        // Store in memory cache with 5-minute TTL
        LocationController.citiesCache.set(countryKey, {
          data: candidateCities,
          timestamp: now,
        });
      }

      let filtered = candidateCities;
      if (searchQuery) {
        filtered = candidateCities.filter(
          (c) =>
            c.name.toLowerCase().includes(searchQuery) ||
            c.slug.includes(searchQuery)
        );
      }

      const result = limitParam && limitParam > 0 ? filtered.slice(0, limitParam) : filtered;

      res.json({
        success: true,
        total: filtered.length,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

