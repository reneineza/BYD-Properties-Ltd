'use client';

import Image from 'next/image';
import { MapPin, Maximize } from 'lucide-react';

export default function GalleryHero({ title, images, location, statusLabel, statusColor, type }) {
  const openGallery = () => {
    const trigger = document.getElementById('trigger-gallery');
    if (trigger) trigger.click();
  };

  return (
    <section 
      className="relative h-[60vh] min-h-[500px] w-full bg-navy flex items-end pb-12 cursor-pointer group overflow-hidden"
      onClick={openGallery}
    >
      {images?.[0] ? (
        <>
          <Image
            src={images[0]}
            alt={title}
            fill
            priority
            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="flex flex-col items-center gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                <Maximize className="w-6 h-6" />
              </div>
              <span className="text-white text-xs font-bold uppercase tracking-widest">View Gallery</span>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-navy to-navy-dark" />
      )}

      <div className="relative max-w-7xl mx-auto px-6 w-full pointer-events-none">
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
  );
}
