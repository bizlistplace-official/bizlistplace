import { MetadataRoute } from 'next';
import { fetchApi } from '@/lib/api';
import { IBusiness, ICategory, POPULAR_COUNTRIES } from '@bizpockethub/shared';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bizlistplace.com';

  // 1. Static Core Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/countries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/add-business`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/claim-business`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/sitemap`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];

  // 2. Dynamic Categories
  const categoriesRes = await fetchApi<ICategory[]>('/categories');
  const categoryUrls: MetadataRoute.Sitemap = (categoriesRes.data || []).map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Dynamic Countries & Cities
  const countryUrls: MetadataRoute.Sitemap = [];
  POPULAR_COUNTRIES.forEach((country) => {
    countryUrls.push({
      url: `${baseUrl}/countries/${country.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });

    country.popularCities.forEach((city) => {
      countryUrls.push({
        url: `${baseUrl}/${country.slug}/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  });

  // 4. Dynamic Published Businesses
  const businessesRes = await fetchApi<IBusiness[]>('/businesses?limit=100');
  const businessList: IBusiness[] = Array.isArray(businessesRes.data)
    ? businessesRes.data
    : (businessesRes.data as any)?.data || [];
  const businessUrls: MetadataRoute.Sitemap = businessList.map((biz) => ({
    url: `${baseUrl}/business/${biz.slug}`,
    lastModified: new Date(biz.updatedAt || biz.createdAt),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryUrls, ...countryUrls, ...businessUrls];
}
