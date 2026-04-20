'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import AnimatedSection from '@/components/AnimatedSection';

const TYPES = ['all', 'residential', 'commercial'];
const STATUSES = ['all', 'for-sale', 'for-rent'];

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (status !== 'all') params.set('status', status);
    fetch(`/api/properties?${params}`)
      .then((r) => r.json())
      .then((data) => { setProperties(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [type, status]);

  return (
    <>
      {/* Filters */}
      <div className="bg-cream border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-bold text-navy">Type:</span>
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`text-xs px-4 py-2 uppercase tracking-wide font-semibold transition-all duration-200 ${
                    type === t
                      ? 'bg-navy text-white'
                      : 'border border-navy/20 text-navy hover:border-navy'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-bold text-navy">Status:</span>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`text-xs px-4 py-2 uppercase tracking-wide font-semibold transition-all duration-200 ${
                    status === s
                      ? 'bg-gold text-white'
                      : 'border border-navy/20 text-navy hover:border-gold'
                  }`}
                >
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          <span className="ml-auto text-xs text-gray-400">
            {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} found
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-cream animate-pulse" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-gray-200 text-8xl mb-6">🏠</div>
            <h3 className="font-display text-2xl font-bold text-navy mb-3">No properties found</h3>
            <p className="text-gray-400">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default function PropertiesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-3">
              Our Portfolio
            </p>
            <h1 className="font-display text-5xl font-bold text-white mb-4">Properties</h1>
            <span className="block w-12 h-0.5 bg-gold" />
            <p className="text-white/55 mt-6 max-w-lg">
              Explore our curated selection of residential and commercial properties across Kigali, Rwanda.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <Suspense fallback={<div className="py-24 text-center text-gray-400">Loading...</div>}>
        <PropertiesContent />
      </Suspense>
    </div>
  );
}
