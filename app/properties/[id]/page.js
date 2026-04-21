import { notFound } from 'next/navigation';
import { getPropertyById } from '@/lib/db';
import PropertyInquiryForm from '@/components/PropertyInquiryForm';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Bed, Bath, Maximize, Phone } from 'lucide-react';

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function generateMetadata({ params }) {
  const property = await getPropertyById(params.id);
  if (!property) return { title: 'Property Not Found' };

  const desc = property.description
    ? property.description.slice(0, 155) + (property.description.length > 155 ? '…' : '')
    : `${property.status === 'for-sale' ? 'For sale' : 'For rent'} in ${property.location || 'Kigali'}. Contact BYD Properties for details.`;

  const image = property.images?.[0] || '/logo-transparent.png';
  const canonical = `https://www.bydproperties.rw/properties/${params.id}`;

  return {
    title: property.title,
    description: desc,
    openGraph: {
      title: `${property.title} | BYD Properties`,
      description: desc,
      type: 'website',
      url: canonical,
      images: [{ url: image, alt: property.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description: desc,
      images: [image],
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
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

  const { title, type, status, price, currency, location, bedrooms, bathrooms, area, description, images, youtubeUrl } = property;
  const statusLabel = status === 'for-sale' ? 'For Sale' : status === 'for-rent' ? 'For Rent' : 'Under Construction';
  const statusColor = status === 'for-sale' ? 'bg-gold text-white' : status === 'for-rent' ? 'bg-navy text-white' : 'bg-gray-600 text-white';

  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full bg-navy flex items-end pb-12">
        {images?.[0] ? (
          <>
            <Image
              src={images[0]}
              alt={title}
              fill
              priority
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy to-navy-dark" />
        )}

        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-4xl">
            <div className="flex gap-3 mb-6">
              <span className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg ${statusColor}`}>
                {statusLabel}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full bg-white/90 text-navy shadow-lg backdrop-blur-md">
                {type}
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-[1.1] drop-shadow-lg">
              {title}
            </h1>
            <p className="flex items-center gap-2 text-white/90 text-lg drop-shadow-md">
              <MapPin className="w-5 h-5 text-gold" />
              {location}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-12">

          {/* Price & Key Features */}
          <div>
            <p className="font-display text-4xl md:text-5xl font-bold text-gold mb-10">
              {formatPrice(price, currency)}
            </p>

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
              {description || 'No description provided for this property.'}
            </div>
          </div>

          {/* Gallery */}
          {images && images.length > 1 && (
            <div>
              <h2 className="section-title text-2xl mb-4">Gallery</h2>
              <span className="block w-8 h-0.5 bg-gold mb-6" />
              <div className="grid grid-cols-2 gap-4">
                {images.slice(1).map((img, idx) => (
                  <div key={idx} className="aspect-[4/3] bg-gray-100 relative group overflow-hidden">
                    <Image
                      src={img}
                      alt={`Gallery image ${idx + 1}`}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {youtubeUrl && getYouTubeId(youtubeUrl) && (
            <div className="pt-8">
              <h2 className="section-title text-2xl mb-4">Property Video</h2>
              <span className="block w-8 h-0.5 bg-gold mb-6" />
              <div className="rounded-2xl overflow-hidden aspect-video shadow-lg border border-gray-100">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeId(youtubeUrl)}`}
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

              <a
                href={`https://wa.me/+250788661932?text=Hi! I'm interested in the property: ${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border-2 border-gold text-gold hover:bg-gold hover:text-navy py-4 px-6 rounded-full font-bold transition-all hover:-translate-y-1"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
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
