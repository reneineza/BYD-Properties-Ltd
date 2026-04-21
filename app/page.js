import HomePageClient from '@/components/HomePageClient';
import { getProperties, getContent } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const content = getContent();
  const home = content.home || {};
  const allProperties = getProperties();
  const featured = allProperties.filter((p) => p.featured);

  return (
    <HomePageClient home={home} featured={featured} />
  );
}
