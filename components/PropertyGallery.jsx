'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export default function PropertyGallery({ images = [], title = '' }) {
  const [index, setIndex] = useState(-1);
  const isOpen = index !== -1;

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') setIndex(-1);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, next, prev]);

  if (!images.length) return null;

  return (
    <div className="w-full">
      {/* Grid Layout for Gallery Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {images.slice(1, 5).map((img, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="aspect-[4/3] bg-gray-100 relative group overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
            onClick={() => setIndex(idx + 1)}
          >
            <Image
              src={img}
              alt={`${title} - view ${idx + 2}`}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition-colors duration-500 flex items-center justify-center">
              <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500" />
            </div>
            
            {idx === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-navy/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <span className="text-3xl font-bold">+{images.length - 5}</span>
                <span className="text-xs uppercase tracking-widest font-bold opacity-80">More Photos</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-navy/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
          >
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
              <div className="text-white/60 text-sm font-medium">
                <span className="text-white font-bold">{index + 1}</span> / {images.length}
              </div>
              <button
                onClick={() => setIndex(-1)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative w-full max-w-6xl aspect-[4/3] md:aspect-video flex items-center justify-center group">
              <button
                onClick={prev}
                className="absolute left-4 z-20 w-14 h-14 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-md opacity-0 md:group-hover:opacity-100 transition-all -translate-x-4 md:group-hover:translate-x-0"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <div className="relative w-full h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={images[index]}
                      alt={`${title} - view ${index + 1}`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={next}
                className="absolute right-4 z-20 w-14 h-14 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-md opacity-0 md:group-hover:opacity-100 transition-all translate-x-4 md:group-hover:translate-x-0"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            <div className="mt-8 w-full max-w-4xl overflow-x-auto no-scrollbar py-4">
              <div className="flex gap-4 justify-center min-w-max px-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      index === idx ? 'border-gold scale-110 shadow-lg shadow-gold/20' : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-white/40 text-xs uppercase tracking-[0.3em] font-black italic">
              {title}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hidden button to trigger from Parent if needed */}
      <button id="trigger-gallery" className="hidden" onClick={() => setIndex(0)} />
    </div>
  );
}
