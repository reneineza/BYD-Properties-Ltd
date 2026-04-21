'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import BecomeAgentModal from './BecomeAgentModal';

const footerLinks = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Our Projects', href: '/properties' },
    { label: 'Contact', href: '/contact' },
  ],
  Properties: [
    { label: 'For Sale', href: '/properties?status=for-sale' },
    { label: 'For Rent', href: '/properties?status=for-rent' },
    { label: 'Residential', href: '/properties?type=residential' },
    { label: 'Commercial', href: '/properties?type=commercial' },
  ],
  Services: [
    { label: 'Property Sales', href: '/services/property-sales' },
    { label: 'Construction Management', href: '/services/construction-management' },
    { label: 'Architecture & Design', href: '/services/architecture-design' },
  ],
};

export default function Footer() {
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) return null;

  return (
    <>
      <footer className="bg-navy text-white">
        {/* Top CTA Band */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold mb-1">
                Ready to find your perfect property?
              </h3>
              <p className="text-white/60 text-sm">
                Our experts are here to guide you every step of the way.
              </p>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <Link href="/properties" className="btn-primary text-sm">
                Browse Properties
              </Link>
              <Link href="/contact" className="btn-outline text-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center lg:text-left">
            {/* Brand */}
            <div className="lg:col-span-1 flex flex-col items-center lg:items-start w-full">
              <Link href="/" className="inline-block mb-6">
                <Image 
                  src="/logo-transparent.png" 
                  alt="BYD Properties Logo" 
                  width={336} 
                  height={112}
                  className="h-28 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" 
                />
              </Link>
              <p className="text-white/55 text-sm leading-relaxed max-w-xs mb-6">
                Rwanda&apos;s trusted partner in premium construction and real estate since 2010.
                Building your vision, delivering excellence.
              </p>

              {/* Social */}
              <div className="flex gap-3 justify-center lg:justify-start">
                <a href="#" aria-label="Instagram" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold hover:-translate-y-1 transition-all duration-300 rounded-sm bg-white/5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
                <a href="#" aria-label="Facebook" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold hover:-translate-y-1 transition-all duration-300 rounded-sm bg-white/5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                </a>
                <a href="#" aria-label="TikTok" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold hover:-translate-y-1 transition-all duration-300 rounded-sm bg-white/5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.96-1.72 5.39-1.39 1.63-3.73 2.5-5.83 2.22-2.31-.31-4.32-1.92-5.18-4.11-.8-2.05-.59-4.48.55-6.38 1.17-1.95 3.4-3.32 5.62-3.36V13c-1.34.1-2.68.87-3.4 1.99-.79 1.22-.84 2.87-.21 4.17.65 1.34 2.2 2.36 3.73 2.37 1.52 0 2.92-1 3.49-2.42.34-.84.44-1.78.44-2.69V.02h-1.57z" /></svg>
                </a>
                <a href="#" aria-label="Twitter" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold hover:-translate-y-1 transition-all duration-300 rounded-sm bg-white/5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="flex flex-col items-center lg:items-start w-full">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gold mb-5">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-white/55 text-sm hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} BYD Properties. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-white/40">
              <Link href="/privacy-policy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-use" className="hover:text-white/70 transition-colors">Terms of Use</Link>
              {/* BECOME AN AGENT */}
              <button
                onClick={() => setAgentModalOpen(true)}
                className="flex items-center gap-2 text-gold font-semibold hover:text-gold-light transition-colors duration-200 group"
              >
                <span className="w-5 h-5 rounded-full border border-gold flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-200 text-xs">
                  +
                </span>
                Become an Agent
              </button>
            </div>
          </div>
        </div>
      </footer>

      <BecomeAgentModal open={agentModalOpen} onClose={() => setAgentModalOpen(false)} />
    </>
  );
}
