'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Building, Ruler, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';
import PropertyCard from '@/components/PropertyCard';

export default function HomePageClient({ home, featured }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

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
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-navy-light/30 via-navy to-navy-dark opacity-100" />
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-gold/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-navy-light/20 blur-[150px] rounded-full mix-blend-screen" />
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="max-w-2xl text-center lg:text-left">
              <AnimatedSection delay={0.1}>
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                  </span>
                  Established 2010 · Kigali, Rwanda
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[1.05] mb-8">
                  {home.heroTitle || 'Building Your Vision, Delivering Excellence'}
                  <span className="text-gold">.</span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-12 max-w-xl">
                  {home.heroSubtitle ||
                    "BYD Properties — Your trusted partner in premium construction and real estate across Rwanda."}
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.4} className="flex flex-wrap gap-5 justify-center lg:justify-start">
                <Link href={home.heroCtaLink || '/properties'} className="btn-primary py-4 px-10 group shadow-gold/20">
                  {home.heroCtaText || 'Explore Properties'}
                  <span className="inline-block transform group-hover:translate-x-1 transition-transform ml-2">→</span>
                </Link>
                <Link href="/contact" className="btn-outline border-white/20 text-white hover:border-gold hover:text-gold py-4 px-10">
                  Contact Us
                </Link>
              </AnimatedSection>
            </div>

            {/* Right Image Carousel Section */}
            <AnimatedSection direction="left" delay={0.5} className="relative hidden lg:block">
              <div className="relative z-10">
                {/* Main Image Container */}
                <div className="relative aspect-[4/5] w-full max-w-[500px] ml-auto rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.4)] border border-white/10 group">
                  <AnimatePresence mode="wait">
                    {featured.length > 0 ? (
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1.05 }}
                        exit={{ opacity: 0, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={featured[currentSlide].images?.[0] || '/hero-apartment.png'}
                          alt={featured[currentSlide].title}
                          fill
                          className="object-cover transition-transform duration-[5s] ease-linear"
                          priority
                        />
                      </motion.div>
                    ) : (
                      <Image
                        src="/hero-apartment.png"
                        alt="Luxury Apartment"
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                  </AnimatePresence>
                  
                  {/* Image Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent opacity-80" />
                  
                  {/* Floating Badge on Image */}
                  <div className="absolute bottom-8 left-8 right-8 p-6 glass rounded-2xl border-white/10 z-20">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                      >
                        <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Featured Listing</p>
                        <h4 className="text-white font-bold text-lg line-clamp-1">
                          {featured.length > 0 ? featured[currentSlide].title : 'Premium Residential Suites'}
                        </h4>
                        <p className="text-white/60 text-xs">
                          {featured.length > 0 ? featured[currentSlide].location : 'Kigali, Rwanda'}
                        </p>
                        <Link 
                          href={featured.length > 0 ? `/properties/${featured[currentSlide].id}` : '/properties'}
                          className="inline-block mt-4 text-[10px] font-bold uppercase tracking-widest text-gold hover:text-white transition-colors"
                        >
                          View Details →
                        </Link>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Carousel Dots */}
                  {featured.length > 1 && (
                    <div className="absolute top-8 right-8 flex flex-col gap-2 z-30">
                      {featured.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          className={`w-1.5 h-6 rounded-full transition-all duration-300 ${
                            currentSlide === i ? 'bg-gold h-10' : 'bg-white/20 hover:bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Decorative Elements around image */}
                <div className="absolute -top-10 -right-10 w-40 h-40 border-2 border-gold/30 rounded-full z-[-1] animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-navy-light/10 blur-3xl z-[-1]" />
              </div>
            </AnimatedSection>
          </div>

          {/* Mobile Image (Show below text on small screens) */}
          <AnimatedSection direction="up" delay={0.5} className="mt-16 lg:hidden">
            <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl">
              <AnimatePresence mode="wait">
                <div className="relative w-full h-full">
                  <Image
                    src={featured[currentSlide]?.images?.[0] || '/hero-apartment.png'}
                    alt="Apartment"
                    fill
                    className="object-cover"
                  />
                </div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent opacity-50" />
              <div className="absolute bottom-4 left-4 right-4">
                 <h4 className="text-white font-bold text-sm line-clamp-1">
                    {featured.length > 0 ? featured[currentSlide].title : 'Premium Residential Suites'}
                  </h4>
              </div>
            </div>
          </AnimatedSection>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
            <div className="w-[1px] h-12 bg-gradient-to-b from-gold/50 to-transparent" />
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
              featured.slice(0, 3).map((property, i) => (
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
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
                  <Image 
                    src="/why-byd.png" 
                    alt="Premium Quality Construction" 
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-[2s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-40" />
                </div>
                {/* Decorative gold borders */}
                <div className="absolute -bottom-6 -right-6 w-40 h-40 border-2 border-gold opacity-50 z-[-1] rounded-2xl" />
                <div className="absolute -top-6 -left-6 w-40 h-40 border-2 border-gold opacity-50 z-[-1] rounded-2xl" />
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
