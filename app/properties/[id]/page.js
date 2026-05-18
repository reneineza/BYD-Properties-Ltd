import { notFound } from 'next/navigation';
import { getPropertyById } from '@/lib/db';
import PropertyInquiryForm from '@/components/PropertyInquiryForm';
import WhatsAppLeadTrigger from '@/components/WhatsAppLeadTrigger';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Bed, Bath, Maximize, Phone, FileText } from 'lucide-react';
import PropertyGallery from '@/components/PropertyGallery';
import GalleryHero from '@/components/GalleryHero';

export const revalidate = 60; // Revalidate every minute

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function parseDescription(fullDescription) {
  if (!fullDescription) return { description: '', completionDate: '', drawings: [] };
  
  let description = fullDescription;
  let completionDate = '';
  let drawings = [];
  
  let parsed = true;
  while (parsed) {
    parsed = false;
    const compM = description.match(/^\[Completion:\s*([^\]]+)\]\s*(.*)/s);
    if (compM) {
      completionDate = compM[1];
      description = compM[2];
      parsed = true;
    }
    const drawM = description.match(/^\[Drawings:\s*([^\]]+)\]\s*(.*)/s);
    if (drawM) {
      drawings = drawM[1].split(',').filter(Boolean);
      description = drawM[2];
      parsed = true;
    }
  }
  
  return { description, completionDate, drawings };
}

export async function generateMetadata({ params }) {
  const property = await getPropertyById(params.id);
  if (!property) return { title: 'Property Not Found' };

  const { description: cleanDesc } = parseDescription(property.description);
  const desc = cleanDesc
    ? cleanDesc.slice(0, 155) + (cleanDesc.length > 155 ? '…' : '')
    : `${property.status === 'for-sale-and-rent' ? 'For sale & rent' : property.status === 'for-sale' ? 'For sale' : 'For rent'} in ${property.location || 'Kigali'}. Contact BYD Properties for details.`;

  const ogImage = `/api/og?title=${encodeURIComponent(property.title)}&price=${property.price || ''}&currency=${encodeURIComponent(property.currency || 'RWF')}&location=${encodeURIComponent(property.location || '')}&image=${encodeURIComponent(property.images?.[0] || '')}`;
  const canonical = `https://www.bydproperties.rw/properties/${params.id}`;

  return {
    title: property.title,
    description: desc,
    openGraph: {
      title: `${property.title} | BYD Properties`,
      description: desc,
      type: 'website',
      url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630, alt: property.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description: desc,
      images: [ogImage],
    },
    alternates: { canonical },
  };
}

function formatPrice(price, currency) {
  if (!price) return 'Price on request';
  return `${currency || 'RWF'} ${price.toLocaleString()}`;
}

export default async function PropertyPage({ params }) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  const { description: cleanDesc, completionDate, drawings } = parseDescription(property.description);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: cleanDesc,
    url: `https://www.bydproperties.rw/properties/${params.id}`,
    image: property.images?.[0] || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location || 'Kigali',
      addressCountry: 'RW',
    },
    ...(property.price && {
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: property.currency || 'RWF',
        availability: 'https://schema.org/InStock',
      },
    }),
  };

  const { title, type, status, price, price_rent, currency, location, bedrooms, bathrooms, area, images, youtube_url, units } = property;
  const statusLabel = 
    status === 'for-sale-and-rent' ? 'For Sale & Rent' :
    status === 'for-sale' ? 'For Sale' : 
    status === 'for-rent' ? 'For Rent' : 
    status === 'completed' ? 'Completed Project' :
    'Under Construction';
    
  const statusColor = 
    status === 'for-sale-and-rent' ? 'bg-gradient-to-r from-gold to-navy text-white' :
    status === 'for-sale' ? 'bg-gold text-white' : 
    status === 'for-rent' ? 'bg-navy text-white' : 
    status === 'completed' ? 'bg-green-600 text-white' :
    'bg-gray-600 text-white';

  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GalleryHero 
        title={title}
        images={images}
        location={location}
        statusLabel={statusLabel}
        statusColor={statusColor}
        type={type}
      />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-12">

          {/* Price & Key Features */}
          <div>
            {(status !== 'under-construction' && status !== 'completed') ? (
              <div className="mb-10">
                <p className="font-display text-4xl md:text-5xl font-bold text-gold">
                  {formatPrice(price, currency)}
                </p>
                {status === 'for-sale-and-rent' && price_rent && (
                  <p className="text-navy/50 text-xl font-bold mt-2">
                    or {formatPrice(price_rent, currency)} <span className="text-sm font-normal">/ month</span>
                  </p>
                )}
                {status === 'for-rent' && price_rent && (
                  <p className="font-display text-4xl md:text-5xl font-bold text-navy">
                    {formatPrice(price_rent, currency)} <span className="text-xl font-normal text-gray-400">/ month</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-10 bg-cream/50 border border-navy/5 p-6 rounded-2xl">
                <div className="text-[10px] uppercase tracking-[0.2em] font-black text-navy/40 mb-1">Project Status</div>
                <div className="text-2xl font-display font-bold text-navy flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${status === 'completed' ? 'bg-green-500' : 'bg-gold animate-pulse'}`} />
                  {status === 'completed' ? 'Completed Showcase' : 'Under Construction'}
                </div>
                {completionDate && (
                  <div className="mt-3 text-sm text-gray-500 font-medium">
                    {status === 'completed' ? 'Completed in' : 'Expected completion'}: <span className="text-navy font-bold">{completionDate}</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-6 py-8 border-y border-gray-100">
              {bedrooms > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Bed className="w-5 h-5 text-gold" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Bedrooms</span>
                  </div>
                  <p className="font-display font-bold text-navy text-2xl">{bedrooms}</p>
                </div>
              )}
              {bathrooms > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Bath className="w-5 h-5 text-gold" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Bathrooms</span>
                  </div>
                  <p className="font-display font-bold text-navy text-2xl">{bathrooms}</p>
                </div>
              )}
              {area > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Maximize className="w-5 h-5 text-gold" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Area</span>
                  </div>
                  <p className="font-display font-bold text-navy text-2xl">{area} m²</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="section-title text-2xl mb-4">Property Overview</h2>
            <span className="block w-8 h-0.5 bg-gold mb-6" />
            <div className="prose prose-lg text-gray-500 whitespace-pre-wrap">
              {cleanDesc || 'No description provided for this property.'}
            </div>
          </div>

          {/* Architectural Drawings */}
          {drawings && drawings.length > 0 && (
            <div>
              <h2 className="section-title text-2xl mb-4">Architectural Drawings &amp; Plans</h2>
              <span className="block w-8 h-0.5 bg-gold mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {drawings.map((url, idx) => {
                  const isPdf = url.split('?')[0].toLowerCase().endsWith('.pdf');
                  return (
                    <div key={idx} className="group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between bg-gray-50">
                      <div className="relative aspect-[4/3] w-full bg-cream-dark flex flex-col items-center justify-center">
                        {isPdf ? (
                          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center select-none">
                            <FileText className="w-16 h-16 text-red-500 animate-pulse" />
                            <span className="text-sm font-black text-navy uppercase tracking-wider">
                              Architectural PDF Document
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              Clickfullscreen below to read or download
                            </span>
                          </div>
                        ) : (
                          <>
                            <Image
                              src={url}
                              alt={`Architectural Drawing ${idx + 1}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-navy/20 group-hover:bg-navy/0 transition-colors" />
                          </>
                        )}
                      </div>
                      <div className="p-4 bg-white border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs font-bold text-navy uppercase tracking-wider">Drawing #{idx + 1}</span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gold hover:text-navy font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                        >
                          {isPdf ? 'Open & Read PDF →' : 'Open Fullscreen →'}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Units Table (For Apartments) */}
          {type === 'apartment' && units && units.length > 0 && (
            <div>
              <h2 className="section-title text-2xl mb-4">Available Units</h2>
              <span className="block w-8 h-0.5 bg-gold mb-6" />
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr className="text-[10px] uppercase tracking-[0.2em] font-bold text-navy/40 border-b border-gray-100">
                      <th className="py-4 px-6">Unit</th>
                      <th className="py-4 px-6">Beds / Baths</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {units.map((unit, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-navy">{unit.label}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-gray-500 text-sm">{unit.bedrooms} Bed • {unit.bathrooms} Bath</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-gold font-bold">{formatPrice(unit.price, currency)}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                            unit.status === 'available' ? 'bg-green-100 text-green-600' : 
                            unit.status === 'sold' ? 'bg-red-100 text-red-600' : 
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {unit.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gallery */}
          {images && images.length > 1 && (
            <div>
              <h2 className="section-title text-2xl mb-4">Gallery</h2>
              <span className="block w-8 h-0.5 bg-gold mb-6" />
              <PropertyGallery images={images} title={title} />
            </div>
          )}

          {/* Video */}
          {youtube_url && getYouTubeId(youtube_url) && (
            <div className="pt-8">
              <h2 className="section-title text-2xl mb-4">Property Video</h2>
              <span className="block w-8 h-0.5 bg-gold mb-6" />
              <div className="rounded-2xl overflow-hidden aspect-video shadow-lg border border-gray-100">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeId(youtube_url)}`}
                  title="Property Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <Link href="/properties" className="inline-flex items-center gap-2 text-navy font-bold hover:text-gold transition-colors pt-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Properties
          </Link>
        </div>

        {/* Right Column - Inquiry Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 glass-dark rounded-3xl p-8 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-white mb-6">Interested?</h3>

            <div className="flex flex-col gap-4 mb-8">
              <a
                href="tel:+250788661932"
                className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy py-4 px-6 rounded-full font-bold transition-all hover:-translate-y-1"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>

              <WhatsAppLeadTrigger 
                propertyId={property.id} 
                propertyTitle={title}
                className="w-full"
              >
                <div className="w-full flex items-center justify-center gap-2 border-2 border-gold text-gold hover:bg-gold hover:text-navy py-4 px-6 rounded-full font-bold transition-all hover:-translate-y-1">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </div>
              </WhatsAppLeadTrigger>
            </div>

            <div className="pt-6 border-t border-white/10">
              <p className="text-white/80 font-semibold mb-4 text-sm">Send a direct message:</p>
              <div className="bg-white rounded-2xl p-5">
                <PropertyInquiryForm propertyTitle={title} />
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
