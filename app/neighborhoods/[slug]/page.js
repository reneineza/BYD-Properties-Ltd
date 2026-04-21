import { neighborhoods } from '@/lib/neighborhoods';
import { getPropertiesByLocation } from '@/lib/db';
import { notFound } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import AnimatedSection from '@/components/AnimatedSection';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 3600; // Update neighborhood guides once an hour

export async function generateMetadata({ params }) {
  const neighborhood = neighborhoods[params.slug];
  if (!neighborhood) return { title: 'Neighborhood Not Found' };

  return {
    title: `${neighborhood.name} Real Estate Guide`,
    description: neighborhood.description.slice(0, 160),
    openGraph: {
      title: `${neighborhood.name} | Neighborhood Guide | BYD Properties`,
      description: neighborhood.description,
      images: [{ url: neighborhood.image }],
    },
  };
}

export default async function NeighborhoodPage({ params }) {
  const neighborhood = neighborhoods[params.slug];

  if (!neighborhood) {
    notFound();
  }

  const properties = await getPropertiesByLocation(neighborhood.name);

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[500px] w-full bg-navy flex items-center justify-center overflow-hidden">
        <Image
          src={neighborhood.image}
          alt={neighborhood.name}
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/60 to-navy" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="text-gold font-bold uppercase tracking-[0.3em] mb-4 block">Neighborhood Guide</span>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6">
              {neighborhood.name}
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {neighborhood.description}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="right">
              <h2 className="section-title mb-6">Why live in {neighborhood.name}?</h2>
              <span className="gold-line" />
              <p className="text-gray-500 mb-8 leading-relaxed">
                {neighborhood.name} offers a unique blend of Rwandan culture and modern luxury. 
                Whether you are looking for a quiet family home or a modern apartment, this area 
                continues to be one of the top investment choices in Kigali.
              </p>
              <ul className="space-y-4">
                {neighborhood.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-navy font-semibold">{h}</span>
                  </li>
                ))}
              </ul>
            </AnimatedSection>
            
            <AnimatedSection direction="left" delay={0.2}>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src={neighborhood.image}
                  alt={`${neighborhood.name} Lifestyle`}
                  fill
                  className="object-cover"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Properties in this area */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">Current Listings in {neighborhood.name}</h2>
              <p className="text-gray-400 mt-2">Find your dream home in this neighborhood.</p>
            </div>
            <Link href={`/properties?location=${neighborhood.name}`} className="text-gold font-bold hover:underline hidden md:block">
              View all listings in this area →
            </Link>
          </div>
        </AnimatedSection>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="bg-cream rounded-2xl p-12 text-center">
            <h3 className="font-display text-xl font-bold text-navy mb-2">No active listings right now</h3>
            <p className="text-gray-500 mb-6">We currently don&apos;t have any available properties in {neighborhood.name}.</p>
            <Link href="/contact" className="btn-primary">
              Contact us to find a home here
            </Link>
          </div>
        )}
      </section>

      {/* Explore Other Neighborhoods */}
      <section className="py-24 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="font-display text-3xl font-bold mb-12">Explore Other Areas</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {Object.keys(neighborhoods).filter(slug => slug !== params.slug).map(slug => (
                <Link
                  key={slug}
                  href={`/neighborhoods/${slug}`}
                  className="px-8 py-4 border border-white/20 rounded-full hover:border-gold hover:text-gold transition-all duration-300 font-bold uppercase tracking-widest text-sm"
                >
                  {neighborhoods[slug].name}
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
