'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter, MapPin, Home, Tag, X, SlidersHorizontal, Check } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import AnimatedSection from '@/components/AnimatedSection';
import { neighborhoods } from '@/lib/neighborhoods';

const TYPES = ['all', 'residential', 'commercial', 'land'];
const STATUSES = ['all', 'for-sale', 'for-rent', 'under-construction'];
const LOCATIONS = ['all', ...Object.values(neighborhoods).map((n) => n.name.toLowerCase())];

const OPTION_LABELS = {
  all: { Type: 'All Types', Status: 'All Status', Location: 'All Locations' },
  residential: 'Residential',
  commercial: 'Commercial',
  land: 'Land Plot',
  'for-sale': 'For Sale',
  'for-rent': 'For Rent',
  'under-construction': 'Under Construction',
  'for-sale-and-rent': 'For Sale & Rent',
};

function getLabel(opt, label) {
  if (opt === 'all') return OPTION_LABELS.all[label] || `All ${label}s`;
  return OPTION_LABELS[opt] || opt.replace(/-/g, ' ');
}

// ── Desktop hover dropdown ─────────────────────────────────────────────────
// Uses CSS group-hover: the browser natively tracks hover across the entire
// group including absolutely-positioned descendants — no JS events, no timers,
// no rendering-race conditions. Panel is always in the DOM so hover is instant.
function FilterDropdown({ label, value, options, onChange, icon: Icon }) {
  const isActive = value !== 'all';

  return (
    <div className="relative group/dd">
      {/* Trigger button — styled via CSS :hover on the group */}
      <button
        type="button"
        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-200 border text-sm font-bold uppercase tracking-wide select-none ${
          isActive
            ? 'bg-navy text-white border-navy shadow-lg shadow-navy/20'
            : 'bg-white text-navy border-navy/10 group-hover/dd:bg-navy group-hover/dd:text-white group-hover/dd:border-navy group-hover/dd:shadow-lg group-hover/dd:shadow-navy/20'
        }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0 text-gold" />
        <span className="truncate max-w-[110px]">{getLabel(value, label)}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 group-hover/dd:rotate-180 group-hover/dd:text-gold ${isActive ? 'text-gold' : 'text-navy/30'}`} />
      </button>

      {/* Panel — always in the DOM; shown/hidden via CSS so hover is seamless.
          pt-2 covers the 8px gap so the group stays hovered when crossing it. */}
      <div className="absolute top-full left-0 pt-2 z-50
                      opacity-0 invisible pointer-events-none
                      group-hover/dd:opacity-100 group-hover/dd:visible group-hover/dd:pointer-events-auto
                      transition-opacity duration-150">
        <div className="min-w-[200px] bg-white border border-navy/8 rounded-2xl shadow-2xl py-2 overflow-hidden">
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {options.map((opt) => {
              const selected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(opt)}
                  className={`w-full text-left px-5 py-3 text-[11px] uppercase tracking-widest font-bold transition-all duration-150 flex items-center justify-between gap-3 ${
                    selected
                      ? 'bg-navy text-white'
                      : 'text-navy hover:bg-gold/10 hover:text-gold'
                  }`}
                >
                  {getLabel(opt, label)}
                  {selected && <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mobile filter sheet ────────────────────────────────────────────────────
function MobileFilterSheet({ type, status, location, setType, setStatus, setLocation, count, onClose }) {
  const activeCount = [type, status, location].filter((v) => v !== 'all').length;

  function Section({ label, icon: Icon, options, value, onChange }) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-gold" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-navy/50">{label}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const selected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-all duration-200 ${
                  selected
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-navy border-navy/15 hover:border-gold hover:text-gold'
                }`}
              >
                {getLabel(opt, label)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key="filter-sheet"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 md:hidden"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl overflow-hidden"
        style={{ maxHeight: '85dvh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-navy" />
            <h2 className="font-display font-bold text-navy text-lg">Filter Properties</h2>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gold text-white text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-navy transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(85dvh - 160px)' }}>
          <Section label="Type" icon={Home} options={TYPES} value={type} onChange={setType} />
          <Section label="Status" icon={Tag} options={STATUSES} value={status} onChange={setStatus} />
          <Section label="Location" icon={MapPin} options={LOCATIONS} value={location} onChange={setLocation} />
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t border-gray-100 flex gap-3"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={() => { setType('all'); setStatus('all'); setLocation('all'); }}
            className="flex-1 btn-outline text-sm py-3"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-primary text-sm py-3"
          >
            Show {count} Result{count !== 1 ? 's' : ''}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main content ───────────────────────────────────────────────────────────
function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || 'all');
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeCount = [type, status, location].filter((v) => v !== 'all').length;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (status !== 'all') params.set('status', status);
    if (location !== 'all') params.set('location', location);
    fetch(`/api/properties?${params}`)
      .then((r) => r.json())
      .then((data) => { setProperties(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [type, status, location]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sheetOpen]);

  return (
    <>
      {/* ── Filter Bar ──────────────────────────────────── */}
      <div className="bg-cream/90 backdrop-blur-md border-b border-gray-200 sticky top-[64px] md:top-[80px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">

          {/* Desktop filters */}
          <div className="hidden md:flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-navy/40 mr-1">
              <Filter className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black">Filters</span>
            </div>
            <FilterDropdown label="Type" value={type} options={TYPES} onChange={setType} icon={Home} />
            <FilterDropdown label="Status" value={status} options={STATUSES} onChange={setStatus} icon={Tag} />
            <FilterDropdown label="Location" value={location} options={LOCATIONS} onChange={setLocation} icon={MapPin} />
          </div>

          {/* Mobile: single filter button */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={`md:hidden flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
              activeCount > 0
                ? 'bg-navy text-white border-navy shadow-md'
                : 'bg-white text-navy border-navy/10 hover:border-gold'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gold text-white text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Right: results count + clear */}
          <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-navy/40">
              <span className="text-gold font-black">{loading ? '—' : properties.length}</span> results
            </span>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => { setType('all'); setStatus('all'); setLocation('all'); }}
                className="text-[10px] uppercase tracking-widest font-bold text-gold hover:text-navy transition-colors underline underline-offset-4 hidden sm:block"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <MobileFilterSheet
            type={type}
            status={status}
            location={location}
            setType={setType}
            setStatus={setStatus}
            setLocation={setLocation}
            count={loading ? 0 : properties.length}
            onClose={() => setSheetOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Grid ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-cream/50 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-28 bg-cream/30 rounded-3xl border border-dashed border-navy/10">
            <div className="flex justify-center mb-8">
              <Filter className="w-20 h-20 text-navy/10 stroke-[1px]" />
            </div>
            <h3 className="font-display text-3xl font-bold text-navy mb-4">No matching properties</h3>
            <p className="text-gray-400 max-w-sm mx-auto mb-8">
              We couldn&apos;t find any properties matching your current filters. Try broadening your search.
            </p>
            <button
              type="button"
              onClick={() => { setType('all'); setStatus('all'); setLocation('all'); }}
              className="btn-primary px-8 py-3"
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
