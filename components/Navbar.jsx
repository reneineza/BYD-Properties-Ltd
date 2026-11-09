'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Home, Building, Building2, Search, ArrowRight } from 'lucide-react';

const propertyMenuItems = [
  {
    label: 'House for sale',
    description: 'Luxury villas, estates & modern family houses',
    href: '/properties?type=residential&status=for-sale',
    icon: Home,
  },
  {
    label: 'Apartment for Rent',
    description: 'Furnished, serviced & modern rental flats',
    href: '/properties?type=apartment&status=for-rent',
    icon: Building2,
  },
  {
    label: 'Apartment for sale',
    description: 'Prime residential apartments & penthouses',
    href: '/properties?type=apartment&status=for-sale',
    icon: Building,
  },
  {
    label: 'All Properties',
    description: 'Explore our complete portfolio across Rwanda',
    href: '/properties',
    icon: Search,
  },
];

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties', hasDropdown: true },
  { href: '/projects', label: 'Projects' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/become-agent', label: 'Become an Agent' },
];

const WHATSAPP_URL =
  'https://wa.me/250788661932?text=Hello%20BYD%20Properties!%20I%20am%20interested%20in%20your%20real%20estate%20services.';

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function HamburgerButton({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
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
  const [propDropdownOpen, setPropDropdownOpen] = useState(false);
  const [mobilePropOpen, setMobilePropOpen] = useState(true);
  const dropdownTimerRef = useRef(null);
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
    setPropDropdownOpen(false);
  }, [pathname]);

  // Trap focus
  useEffect(() => {
    if (menuOpen && closeRef.current) {
      closeRef.current.focus();
    }
  }, [menuOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setPropDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleMouseEnter = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setPropDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setPropDropdownOpen(false);
    }, 150);
  };

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
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                const isPropertiesActive = pathname === '/properties' || pathname?.startsWith('/properties/');
                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={link.href}
                      className={`text-sm font-medium uppercase tracking-widest transition-colors duration-300 relative group flex items-center gap-1.5 py-2 ${
                        isPropertiesActive ? 'text-gold' : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          propDropdownOpen ? 'rotate-180 text-gold' : 'text-white/50 group-hover:text-gold'
                        }`}
                      />
                      <span
                        className={`absolute bottom-0 left-0 h-px bg-gold transition-all duration-300 ${
                          isPropertiesActive ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                      />
                    </Link>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {propDropdownOpen && (
                        <div className="absolute top-full -left-4 pt-2 z-50">
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.96 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="bg-navy-dark/95 border border-white/10 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl w-[340px] text-white"
                          >
                            <div className="px-2 py-1.5 mb-2 border-b border-white/10 flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                                Properties
                              </span>
                              <Link
                                href="/properties"
                                onClick={() => setPropDropdownOpen(false)}
                                className="text-[11px] text-white/50 hover:text-gold transition-colors flex items-center gap-1"
                              >
                                View all <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>

                            <div className="space-y-1">
                              {propertyMenuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setPropDropdownOpen(false)}
                                    className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200 group"
                                  >
                                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-navy group-hover:border-gold transition-colors duration-200 flex-shrink-0">
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="leading-tight">
                                      <p className="text-sm font-semibold text-white group-hover:text-gold transition-colors">
                                        {item.label}
                                      </p>
                                      <p className="text-xs text-white/55 group-hover:text-white/80 transition-colors mt-0.5">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium uppercase tracking-widest transition-colors duration-300 relative group py-2 ${
                    pathname === link.href ? 'text-gold' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-px bg-gold transition-all duration-300 ${
                      pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
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

          {/* Hamburger */}
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
            className="fixed inset-0 z-[60] bg-navy md:hidden flex flex-col overflow-hidden"
            onPanEnd={(_, info) => {
              if (info.offset.x > 80) setMenuOpen(false);
            }}
          >
            {/* Top bar */}
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
              <button
                ref={closeRef}
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white/70 hover:text-white hover:border-gold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-6 flex flex-col gap-2">
              {navLinks.map((link, i) => {
                if (link.hasDropdown) {
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
                      className="border-b border-white/8 pb-3"
                    >
                      <button
                        type="button"
                        onClick={() => setMobilePropOpen((v) => !v)}
                        className="flex items-center justify-between w-full py-3 text-white hover:text-gold transition-colors"
                      >
                        <span className="font-display font-bold text-2xl tracking-tight">
                          {link.label}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gold transition-transform duration-300 ${
                            mobilePropOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {mobilePropOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden pl-2 pt-1 pb-2 space-y-2"
                          >
                            {propertyMenuItems.map((sub) => {
                              const Icon = sub.icon;
                              return (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  onClick={() => setMenuOpen(false)}
                                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-navy-dark flex items-center justify-center text-gold border border-white/10">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-white">
                                      {sub.label}
                                    </p>
                                    <p className="text-[11px] text-white/50">
                                      {sub.description}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between w-full py-3.5 border-b border-white/8 group transition-colors duration-200 ${
                        pathname === link.href ? 'text-gold' : 'text-white hover:text-gold'
                      }`}
                    >
                      <span className="font-display font-bold text-2xl tracking-tight">
                        {link.label}
                      </span>
                      {pathname === link.href && (
                        <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Bottom CTA */}
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
