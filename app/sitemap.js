import { getProperties } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const properties = await getProperties();
  const baseUrl = 'https://www.bydproperties.rw';
  const now = new Date().toISOString();

  const staticRoutes = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/properties`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const propertyRoutes = properties.map((p) => ({
    url: `${baseUrl}/properties/${p.id}`,
    lastModified: p.updated_at || p.created_at || now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
