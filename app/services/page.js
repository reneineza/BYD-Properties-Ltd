import Link from 'next/link';
import { Home, Building, Ruler, ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { servicesData } from '@/data/services';

const iconMap = {
  Home: Home,
  Building: Building,
  Ruler: Ruler,
};

export const metadata = {
  title: 'Our Services',
  description:
    'BYD Properties offers expert property sales, construction management, and architecture & design services in Kigali, Rwanda. Get a tailored proposal today.',
  openGraph: {
    title: 'Our Services | BYD Properties',
    description: 'Expert real estate and construction services in Rwanda — property sales, construction management, and architecture.',
    images: [{ url: '/logo-transparent.png', alt: 'BYD Properties Services' }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://www.bydproperties.rw/services' },
};

export default function ServicesPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="bg-navy pt-40 pb-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <AnimatedSection>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-4">
              What We Offer
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">Our Services</h1>
            <span className="block w-16 h-1 bg-gold mx-auto" />
            <p className="text-white/70 mt-8 max-w-2xl mx-auto text-lg leading-relaxed">
              From ground-up construction to luxury property sales — BYD
              Properties delivers end-to-end real estate excellence.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesData.map((svc, i) => {
            const IconComponent = iconMap[svc.iconName];
            return (
              <AnimatedSection key={svc.id} delay={i * 0.1}>
                <Link href={`/services/${svc.slug}`} className="block group h-full">
                  <div className="bg-white rounded-3xl p-10 h-full border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col hover:-translate-y-2 relative overflow-hidden">
                    
                    {/* Hover Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors duration-500" />
                    
                    <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center mb-8 text-gold group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      {IconComponent && <IconComponent className="w-8 h-8" />}
                    </div>
                    
                    <h3 className="font-display text-2xl font-bold text-navy mb-3 group-hover:text-gold transition-colors">
                      {svc.title}
                    </h3>
                    
                    <p className="text-gray-500 flex-grow mb-8 line-clamp-3">
                      {svc.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-gold font-bold text-sm uppercase tracking-wider mt-auto group-hover:gap-4 transition-all duration-300">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 mt-24 bg-cream">
        <AnimatedSection className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-navy mb-6">
            Have a project in mind?
          </h2>
          <p className="text-gray-600 mb-10 text-lg">
            Our team is ready to discuss your vision and provide a tailored proposal to bring it to life.
          </p>
          <Link href="/contact" className="btn-primary">
            Start a Conversation
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
}
