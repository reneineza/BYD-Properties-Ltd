'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, HardHat, Calendar, ArrowRight, Building2, Layers } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';

const TYPE_LABELS = {
  residential: 'Residential',
  commercial: 'Commercial',
  land: 'Land Plot',
};

function parseDescription(fullDescription) {
  if (!fullDescription) return { description: '', completionDate: '' };
  const match = fullDescription.match(/^\[Completion:\s*([^\]]+)\]\s*(.*)/s);
  if (match) {
    return {
      completionDate: match[1],
      description: match[2]
    };
  }
  return { description: fullDescription, completionDate: '' };
}

function ProjectCard({ project, index }) {
  const { id, title, type, location, images, area, description, created_at, status } = project;
  const startYear = created_at ? new Date(created_at).getFullYear() : null;
  const { description: cleanDesc, completionDate } = parseDescription(description);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.09, duration: 0.5, ease: 'easeOut' }}
      className="group card overflow-hidden relative"
    >
      {/* Image */}
      <div className="relative h-60 bg-cream-dark overflow-hidden">
        {images?.[0] ? (
          <Image
            src={images[0]}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy/10 to-gold/10">
            <Building2 className="w-16 h-16 text-navy/20" />
          </div>
        )}

        {/* Status badge */}
        <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-navy/90 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-sm backdrop-blur-md border border-white/20 shadow-lg">
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'completed' ? 'bg-green-500' : 'bg-gold animate-pulse'}`} />
          {status === 'completed' ? 'Completed' : 'Under Construction'}
        </span>

        {/* Type badge */}
        {type && (
          <span className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest bg-white/90 backdrop-blur-md text-navy px-4 py-1.5 rounded-sm shadow-lg">
            {TYPE_LABELS[type] || type}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 uppercase tracking-wide">
          <MapPin className="w-3.5 h-3.5" />
          {location || 'Rwanda'}
        </p>

        <h3 className="font-display font-bold text-navy text-lg mb-3 leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-200">
          {title}
        </h3>

        {cleanDesc && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
            {cleanDesc}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-5 text-xs text-gray-400 border-t border-gray-100 pt-4">
          {completionDate ? (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gold" />
              {status === 'completed' ? 'Completed' : 'Expected'}: {completionDate}
            </span>
          ) : startYear ? (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gold" />
              Started {startYear}
            </span>
          ) : null}
          {area > 0 && (
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-gold" />
              {area} m²
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest group-hover:gap-4 transition-all duration-300">
          View Project <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Clickable overlay */}
      <Link
        href={`/properties/${id}`}
        className="absolute inset-0 z-40 cursor-pointer"
        aria-label={`View details for ${title}`}
      />
    </motion.div>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="bg-white border border-gray-100 shadow-sm px-8 py-6 flex items-center gap-4">
      <div className="w-12 h-12 bg-navy flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-gold" />
      </div>
      <div>
        <div className="text-3xl font-bold text-navy font-display">{value}</div>
        <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">{label}</div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((data) => {
        const filtered = Array.isArray(data)
          ? data.filter((p) => p.status === 'under-construction' || p.status === 'completed')
          : [];
        setProjects(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const locations = [...new Set(projects.map((p) => p.location).filter(Boolean))];
  const types = [...new Set(projects.map((p) => p.type).filter(Boolean))];

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="bg-navy pt-40 pb-24 relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-navy/30 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-6">
              <span className="block w-12 h-1 bg-gold rounded-full" />
              <HardHat className="w-4 h-4 text-gold" />
              <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px]">
                Active Construction
              </span>
            </div>

            <h1 className="font-display text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              Our Projects<span className="text-gold">.</span>
            </h1>

            <p className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed">
              A live view of what we&apos;re building across Rwanda. Every project reflects our
              commitment to precision, quality, and architectural excellence.
            </p>
          </AnimatedSection>
        </div>
      </section>



      {/* ── Grid ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-cream/50 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-cream/30 rounded-3xl border border-dashed border-navy/10">
            <div className="flex justify-center mb-8">
              <HardHat className="w-24 h-24 text-navy/10 stroke-[1px]" />
            </div>
            <h3 className="font-display text-3xl font-bold text-navy mb-4">
              No active projects yet
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto mb-10">
              Check back soon — we&apos;re always working on something new across Rwanda.
            </p>
            <Link href="/properties" className="btn-primary px-10 py-3">
              Browse All Properties
            </Link>
          </div>
        )}
      </div>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="bg-navy py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-6 justify-center">
              <span className="block w-12 h-1 bg-gold rounded-full" />
              <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px]">Get Involved</span>
              <span className="block w-12 h-1 bg-gold rounded-full" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
              Interested in a project?
            </h2>
            <p className="text-white/55 text-lg max-w-xl mx-auto mb-10">
              Get in touch with our team to learn more about pre-sale opportunities,
              progress updates, and investment options.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact" className="btn-primary">
                Contact Our Team
              </Link>
              <Link href="/properties" className="btn-outline border-white/30 text-white hover:bg-white hover:text-navy">
                View All Listings
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
