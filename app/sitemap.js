import { getProperties } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function sitemap() {
  const properties = getProperties();
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
    lastModified: p.updatedAt || p.createdAt || now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
