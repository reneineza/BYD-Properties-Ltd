import HomePageClient from '@/components/HomePageClient';
import { getProperties, getContent } from '@/lib/db';

export const revalidate = 60; // Update page every 60 seconds

export default async function HomePage() {
  const content = await getContent();
  const home = content?.home || {};
  const allProperties = await getProperties();
  const featured = allProperties.filter((p) => p.featured);

  return (
    <HomePageClient home={home} featured={featured} />
  );
}
