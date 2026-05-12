'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/projects', label: 'Projects' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const WHATSAPP_URL =
  'https://wa.me/250788661932?text=Hello%20BYD%20Properties!%20I%20am%20interested%20in%20your%20real%20estate%20services.';

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Hamburger — three bars that animate to X
function HamburgerButton({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      // Always on top; large 48×48 touch target
      className="relative z-[70] md:hidden flex items-center justify-center w-12 h-12 -mr-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      <div className="w-6 flex flex-col gap-[5px]">
        <span
          className={`block h-0.5 bg-white rounded-full origin-center transition-all duration-300 ${
            open ? 'rotate-45 translate-y-[7px]' : ''
          }`}
        />
        <span
          className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${
            open ? 'opacity-0 scale-x-0' : ''
          }`}
        />
        <span
          className={`block h-0.5 bg-white rounded-full origin-center transition-all duration-300 ${
            open ? '-rotate-45 -translate-y-[7px]' : ''
          }`}
        />
      </div>
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const closeRef = useRef(null);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [menuOpen]);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Trap focus: move focus into menu when it opens
  useEffect(() => {
    if (menuOpen && closeRef.current) {
      closeRef.current.focus();
    }
  }, [menuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (isAdminPage) return null;

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'top-0 bg-navy/95 backdrop-blur-md py-3 border-b border-white/10 shadow-lg'
            : 'top-0 bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group z-[60]" onClick={() => setMenuOpen(false)}>
            <Image
              src="/logo-transparent.png"
              alt="BYD Properties Logo"
              width={180}
              height={60}
              priority
              className="h-11 md:h-16 w-auto object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium uppercase tracking-widest transition-colors duration-300 relative group ${
                  pathname === link.href ? 'text-gold' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                    pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2"
            >
              <WhatsAppIcon />
              Get In Touch
            </a>
          </nav>

          {/* Hamburger — always rendered so it stays on top of overlay */}
          <HamburgerButton open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
        </div>
      </header>

      {/* ── Mobile Menu Overlay ────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            // z-[60] sits above content but below the hamburger button (z-[70])
            className="fixed inset-0 z-[60] bg-navy md:hidden flex flex-col overflow-hidden"
            // Swipe-to-dismiss: close if swiped right ≥80px
            onPanEnd={(_, info) => {
              if (info.offset.x > 80) setMenuOpen(false);
            }}
          >
            {/* Top bar — logo + close */}
            <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-6 border-b border-white/10 flex-shrink-0">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <Image
                  src="/logo-transparent.png"
                  alt="BYD Properties"
                  width={140}
                  height={46}
                  className="h-10 w-auto object-contain opacity-90"
                />
              </Link>
              {/* Explicit close button for accessibility */}
              <button
                ref={closeRef}
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white/70 hover:text-white hover:border-gold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links — scrollable in case of very small screens */}
            <nav className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-8 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.07, duration: 0.35, ease: 'easeOut' }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between w-full py-4 border-b border-white/8 group transition-colors duration-200 ${
                      pathname === link.href ? 'text-gold' : 'text-white hover:text-gold'
                    }`}
                  >
                    <span className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
                      {link.label}
                    </span>
                    {/* Active dot */}
                    {pathname === link.href && (
                      <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Bottom CTA — always visible, safe-area aware */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.35 }}
              className="flex-shrink-0 px-4 sm:px-6 py-6 border-t border-white/10"
              style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            >
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="btn-primary w-full text-base py-4 gap-3 justify-center"
              >
                <WhatsAppIcon />
                Get In Touch via WhatsApp
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
