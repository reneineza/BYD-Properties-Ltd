'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';

function formatPrice(price, currency) {
  if (!price) return 'Price on request';
  return `${currency || 'RWF'} ${price.toLocaleString()}`;
}

export default function PropertyCard({ property, index = 0 }) {
  const { id, title, type, status, price, price_rent, currency, location, bedrooms, bathrooms, area, images } =
    property;

  const statusLabel = 
    status === 'for-sale-and-rent' ? 'For Sale & Rent' :
    status === 'for-sale' ? 'For Sale' : 
    status === 'for-rent' ? 'For Rent' : 
    'Under Construction';

  const statusColor = 
    status === 'for-sale-and-rent' ? 'bg-gradient-to-r from-gold to-navy text-white' :
    status === 'for-sale' ? 'bg-gold text-white' : 
    status === 'for-rent' ? 'bg-navy text-white' : 
    'bg-gray-800 text-white';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
      className="group card overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-56 bg-cream-dark overflow-hidden">
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
            <svg className="w-16 h-16 text-navy/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
        )}
        {/* Status Badge */}
        <span className={`absolute top-4 left-4 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-sm backdrop-blur-md border border-white/20 shadow-lg ${
          status === 'for-sale-and-rent' ? 'bg-gradient-to-r from-gold/90 to-navy/90 text-white' :
          status === 'for-sale' ? 'bg-gold/90 text-white' : 
          status === 'for-rent' ? 'bg-navy/90 text-white' : 
          'bg-gray-800/90 text-white'
        }`}>
          {statusLabel}
        </span>
        {/* Type Badge */}
        <span className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest bg-white/90 backdrop-blur-md text-navy px-4 py-1.5 rounded-sm shadow-lg">
          {type === 'land' ? 'Land Plot' : type}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 uppercase tracking-wide">
          <MapPin className="w-3.5 h-3.5" />
          {location}
        </p>
        <h3 className="font-display font-bold text-navy text-lg mb-3 leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-200">
          {title}
        </h3>

        <div className="mb-4">
          <p className="text-gold font-bold text-xl">{formatPrice(price, currency)}</p>
          {status === 'for-sale-and-rent' && price_rent && (
            <p className="text-navy/60 text-sm font-semibold mt-1">
              or {formatPrice(price_rent, currency)} / month
            </p>
          )}
          {status === 'for-rent' && price_rent && (
             <p className="text-navy font-bold text-xl">{formatPrice(price_rent, currency)} <span className="text-xs font-normal text-gray-400">/ month</span></p>
          )}
        </div>

        {/* Details */}
        <div className="flex items-center gap-5 text-xs text-gray-500 border-t border-gray-100 pt-4">
          {bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-gold" />
              {bedrooms} Bed
            </span>
          )}
          {bathrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-gold" />
              {bathrooms} Bath
            </span>
          )}
          {area > 0 && (
            <span className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-gold" />
              {area} m²
            </span>
          )}
        </div>

        <Link
          href={`/properties/${id}`}
          className="mt-6 btn-outline text-sm w-full text-center block"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
