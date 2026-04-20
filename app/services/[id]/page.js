import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Home, Building, Ruler, Check, ArrowLeft } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { servicesData } from '@/data/services';

const iconMap = {
  Home: Home,
  Building: Building,
  Ruler: Ruler,
};

export async function generateStaticParams() {
  return servicesData.map((svc) => ({
    id: svc.slug,
  }));
}

export async function generateMetadata({ params }) {
  const service = servicesData.find((s) => s.slug === params.id);
  if (!service) return { title: 'Service Not Found' };
  return {
    title: `${service.title} | BYD Properties`,
    description: service.description,
  };
}

export default function SingleServicePage({ params }) {
  const service = servicesData.find((s) => s.slug === params.id);

  if (!service) {
    notFound();
  }

  const IconComponent = iconMap[service.iconName];

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] w-full bg-navy flex items-end pb-12 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-80`} />
        
        {/* Background Icon Watermark */}
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
          {IconComponent && <IconComponent className="w-[500px] h-[500px] text-white" />}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <Link href="/services" className="inline-flex items-center gap-2 text-gold font-bold hover:text-white transition-colors mb-8 text-sm uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                {IconComponent && <IconComponent className="w-8 h-8 text-gold" />}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
                {service.tagline}
              </p>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-[1.1] drop-shadow-lg">
              {service.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Left Column - Details */}
        <div className="lg:col-span-2">
          <AnimatedSection>
            <h2 className="font-display text-3xl font-bold text-navy mb-6">Service Overview</h2>
            <span className="block w-12 h-0.5 bg-gold mb-8" />
            
            <p className="text-gray-600 text-lg leading-relaxed mb-12">
              {service.description}
            </p>

            <div className="bg-cream p-10 rounded-3xl border border-gray-100">
              <h3 className="font-display text-2xl font-bold text-navy mb-8">What this includes</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <span className="w-6 h-6 bg-gold/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-gold" />
                    </span>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>

        {/* Right Column - CTA Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 glass-dark rounded-3xl p-8 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-white mb-4">Start Your Project</h3>
            <p className="text-white/70 text-sm mb-8">
              Speak directly with our experts to learn how we can help you achieve your goals with {service.title.toLowerCase()}.
            </p>
            
            <div className="flex flex-col gap-4">
              <a 
                href="/contact"
                className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy py-4 px-6 rounded-full font-bold transition-all hover:-translate-y-1"
              >
                Request a Consultation
              </a>
              
              <a 
                href={`https://wa.me/+250788661932?text=Hi! I would like to inquire about your ${encodeURIComponent(service.title)} services.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border-2 border-gold text-gold hover:bg-gold hover:text-navy py-4 px-6 rounded-full font-bold transition-all hover:-translate-y-1"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
