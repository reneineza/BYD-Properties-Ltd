'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter, MapPin, Home, Tag } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import AnimatedSection from '@/components/AnimatedSection';
import { neighborhoods } from '@/lib/neighborhoods';

const TYPES = ['all', 'residential', 'commercial', 'land'];
const STATUSES = ['all', 'for-sale', 'for-rent', 'under-construction'];
const LOCATIONS = ['all', ...Object.values(neighborhoods).map(n => n.name.toLowerCase())];

function FilterDropdown({ label, value, options, onChange, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = () => setIsOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isOpen]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all duration-300 border ${
          isOpen 
            ? 'bg-navy text-white border-navy shadow-lg shadow-navy/20' 
            : 'bg-white text-navy border-navy/10 hover:border-gold hover:shadow-md'
        }`}
      >
        <Icon className={`w-4 h-4 ${isOpen ? 'text-gold' : 'text-gold'}`} />
        <div className="text-left">
          <p className={`text-[9px] uppercase tracking-[0.15em] font-bold leading-none mb-1 ${isOpen ? 'text-white/50' : 'text-navy/40'}`}>
            {label}
          </p>
          <p className="text-xs font-bold uppercase tracking-wide truncate max-w-[120px]">
            {value === 'all' ? (label === 'Status' ? 'All Status' : `All ${label}s`) : value.replace('-', ' ')}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${isOpen ? 'rotate-180 text-gold' : 'text-navy/20'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 mt-3 w-56 bg-white border border-navy/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
          >
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-[11px] uppercase tracking-widest font-bold transition-all duration-200 flex items-center justify-between group ${
                    value === opt
                      ? 'bg-navy text-white'
                      : 'text-navy hover:bg-gold/10 hover:text-gold'
                  }`}
                >
                  {opt === 'all' 
                    ? (label === 'Status' ? 'All Status' : `All ${label}s`)
                    : (opt === 'land' ? 'Land Plot' : opt.replace('-', ' '))}
                  {value === opt && (
                    <motion.div layoutId="active-check" className="w-1.5 h-1.5 rounded-full bg-gold" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || 'all');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (status !== 'all') params.set('status', status);
    if (location !== 'all') params.set('location', location);
    fetch(`/api/properties?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProperties(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [type, status, location]);

  return (
    <>
      {/* Enhanced Filters Bar */}
      <div className="bg-cream/80 backdrop-blur-md border-b border-gray-200 sticky top-[64px] md:top-[80px] z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="hidden lg:flex items-center gap-2 text-navy/40 mr-2">
              <Filter className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black">Filters</span>
            </div>
            
            <FilterDropdown 
              label="Type" 
              value={type} 
              options={TYPES} 
              onChange={setType} 
              icon={Home}
            />
            
            <FilterDropdown 
              label="Status" 
              value={status} 
              options={STATUSES} 
              onChange={setStatus} 
              icon={Tag}
            />
            
            <FilterDropdown 
              label="Location" 
              value={location} 
              options={LOCATIONS} 
              onChange={setLocation} 
              icon={MapPin}
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-navy/40">
              <span className="text-gold font-black">{properties.length}</span> results found
            </span>
            
            {(type !== 'all' || status !== 'all' || location !== 'all') && (
              <button 
                onClick={() => {
                  setType('all');
                  setStatus('all');
                  setLocation('all');
                }}
                className="text-[10px] uppercase tracking-widest font-bold text-gold hover:text-navy transition-colors underline underline-offset-4"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-cream/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-cream/30 rounded-3xl border border-dashed border-navy/10">
            <div className="text-navy/10 text-9xl mb-8 flex justify-center">
              <Filter className="w-24 h-24 stroke-[1px]" />
            </div>
            <h3 className="font-display text-3xl font-bold text-navy mb-4">No matching properties</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              We couldn&apos;t find any properties matching your current filters. Try broadening your search.
            </p>
            <button 
              onClick={() => {
                setType('all');
                setStatus('all');
                setLocation('all');
              }}
              className="mt-8 btn-primary px-8 py-3"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function PropertiesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-navy pt-40 pb-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-navy-light/10 blur-[100px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-6">
              <span className="block w-12 h-1 bg-gold rounded-full" />
              <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px]">Exclusive Listings</span>
            </div>
            <h1 className="font-display text-6xl md:text-7xl font-bold text-white mb-8 tracking-tight">
              Our Properties<span className="text-gold">.</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed">
              Discover Rwanda&apos;s most prestigious real estate opportunities. From luxury villas to modern commercial spaces across the country.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <Suspense fallback={<div className="py-24 text-center text-gray-400">Loading listings...</div>}>
        <PropertiesContent />
      </Suspense>
    </div>
  );
}

