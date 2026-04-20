import Link from 'next/link';
import { Home, Building, Ruler, Check } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import PropertyCard from '@/components/PropertyCard';
import { getProperties } from '@/lib/db';
import { getContent } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const content = getContent();
  const home = content.home || {};
  const allProperties = getProperties();
  const featured = allProperties.filter((p) => p.featured).slice(0, 3);

  const stats = [
    { value: home.statsYears || '14+', label: 'Years of Excellence' },
    { value: home.statsProjects || '30+', label: 'Projects Completed' },
    { value: home.statsClients || '1,200+', label: 'Happy Clients' },
    { value: home.statsAwards || '28', label: 'Industry Awards' },
  ];

  const services = [
    {
      icon: <Home className="w-12 h-12 text-gold mb-6" />,
      title: 'Property Sales',
      desc: 'Connecting buyers and sellers with premium properties across Kigali. Includes professional photography, marketing, negotiation, and post-sale support.',
      href: '/services#sales',
    },
    {
      icon: <Building className="w-12 h-12 text-gold mb-6" />,
      title: 'Construction Management',
      desc: 'End-to-end management from groundbreaking to handover. Includes project planning, quality assurance, and budget control.',
      href: '/services#construction',
    },
    {
      icon: <Ruler className="w-12 h-12 text-gold mb-6" />,
      title: 'Architecture & Design',
      desc: 'Innovative designs blending functionality with elegance. Includes custom residential/commercial design, 3D visualization, and interior design.',
      href: '/services#architecture',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center bg-[#0B132B] overflow-hidden">
        {/* Deep Animated Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-navy-light/40 via-navy to-navy-dark opacity-100" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gold/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-navy-light/40 blur-[150px] rounded-full mix-blend-screen" />
        </div>

        {/* Gold accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-transparent via-gold to-transparent opacity-70 z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 w-full flex flex-col items-center text-center">
          <div className="max-w-4xl flex flex-col items-center">
            <AnimatedSection delay={0.1}>
              <span className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-[0.3em] mb-6">
                Est. 2010 · Kigali, Rwanda
              </span>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[1.1] mb-8">
                {home.heroTitle || 'Building Your Vision, Delivering Excellence'}
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
                {home.heroSubtitle ||
                  "BYD Properties — Your trusted partner in premium construction and real estate."}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.4} className="flex flex-wrap gap-4 justify-center">
              <Link href={home.heroCtaLink || '/properties'} className="btn-primary">
                {home.heroCtaText || 'Explore Properties'}
              </Link>
              <Link href="/contact" className="btn-outline">
                Contact Us
              </Link>
            </AnimatedSection>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gold">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.1} className="text-center">
              <div className="font-display text-4xl font-bold text-navy mb-1">{stat.value}</div>
              <div className="text-navy/70 text-sm uppercase tracking-wider">{stat.label}</div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-3">
              What We Do
            </p>
            <h2 className="section-title mb-2">Our Services</h2>
            <span className="gold-line" />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {services.map((svc, i) => (
              <AnimatedSection key={svc.title} delay={i * 0.1}>
                <Link
                  href={svc.href}
                  className="group block bg-white p-10 rounded-sm hover:-translate-y-2 shadow-sm hover:shadow-[0_20px_40px_rgba(223,159,61,0.15)] border-t-4 border-transparent hover:border-gold transition-all duration-500 h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/20 transition-colors duration-500 -mr-10 -mt-10" />
                  <div className="mb-6 relative z-10">{svc.icon}</div>
                  <h3 className="font-display font-bold text-navy text-xl mb-4 group-hover:text-gold transition-colors relative z-10">
                    {svc.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed relative z-10">{svc.desc}</p>
                  <div className="mt-8 text-gold text-sm font-bold uppercase tracking-wider flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                    Learn More <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <AnimatedSection>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-3">
                Portfolio
              </p>
              <h2 className="section-title mb-2">
                {home.featuredTitle || 'Featured Properties'}
              </h2>
              <span className="gold-line" />
              <p className="text-gray-500 mt-4 max-w-md">
                {home.featuredSubtitle || 'Hand-picked properties from our exclusive portfolio'}
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.2} className="mt-6 md:mt-0">
              <Link href="/properties" className="btn-outline text-sm">
                View All Properties
              </Link>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.length > 0 ? (
              featured.map((property, i) => (
                <PropertyCard key={property.id} property={property} index={i} />
              ))
            ) : (
              <p className="text-gray-400 col-span-3 text-center py-12">
                No featured properties at the moment.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-24 bg-navy">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="right">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-3">
                Why BYD
              </p>
              <h2 className="font-display text-4xl font-bold text-white mb-6 leading-tight">
                A partner you can trust for life
              </h2>
              <p className="text-white/60 leading-relaxed mb-10">
                From the first consultation to the final handover, we are committed to exceeding
                your expectations with craftsmanship, integrity, and a relentless attention to
                detail.
              </p>
              <div className="space-y-5">
                {[
                  'Premium materials & certified contractors',
                  'On-time delivery, always',
                  'Transparent pricing with no hidden fees',
                  'Dedicated after-sales support',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                    <span className="text-white/75 text-sm">{point}</span>
                  </div>
                ))}
              </div>
              <Link href="/about" className="btn-primary mt-10 inline-block">
                Discover Our Story
              </Link>
            </AnimatedSection>

            <AnimatedSection direction="left" delay={0.2}>
              <div className="relative z-10">
                <div className="aspect-[4/3] bg-navy-light border border-white/10 flex items-center justify-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-50 mix-blend-overlay" />
                  <div className="text-center text-white/30 relative z-10">
                    <svg className="w-24 h-24 mx-auto mb-4 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                    <p className="text-sm uppercase tracking-widest font-bold">Premium Quality</p>
                  </div>
                </div>
                {/* Decorative gold border */}
                <div className="absolute -bottom-6 -right-6 w-40 h-40 border-2 border-gold opacity-50 z-[-1]" />
                <div className="absolute -top-6 -left-6 w-40 h-40 border-2 border-gold opacity-50 z-[-1]" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-gold">
        <AnimatedSection className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-navy mb-4">
            Ready to start your project?
          </h2>
          <p className="text-navy/70 mb-10 text-lg">
            Get in touch today and let our experts turn your vision into reality.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-navy">
              Contact Us Now
            </Link>
            <Link href="/properties" className="btn-outline border-navy text-navy hover:bg-navy hover:text-white">
              Browse Properties
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
