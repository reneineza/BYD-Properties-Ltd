'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function DropdownNavigation({ navItems }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [isHover, setIsHover] = useState(null);

  const handleHover = (menuLabel) => {
    setOpenMenu(menuLabel);
  };

  return (
    <ul className="relative flex items-center space-x-1">
      {navItems.map((navItem) => (
        <li
          key={navItem.label}
          className="relative"
          onMouseEnter={() => handleHover(navItem.label)}
          onMouseLeave={() => handleHover(null)}
        >
          {navItem.subMenus ? (
            <button
              type="button"
              className="text-xs lg:text-sm font-medium uppercase tracking-widest py-2 px-3 flex cursor-pointer group transition-colors duration-300 items-center justify-center gap-1.5 text-white/80 hover:text-white relative"
              onMouseEnter={() => setIsHover(navItem.id)}
              onMouseLeave={() => setIsHover(null)}
            >
              <span>{navItem.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gold group-hover:rotate-180 duration-300 transition-transform ${
                  openMenu === navItem.label ? 'rotate-180 text-gold' : ''
                }`}
              />
              {(isHover === navItem.id || openMenu === navItem.label) && (
                <motion.div
                  layoutId="nav-hover-bg"
                  className="absolute inset-0 size-full bg-gold/15 border border-gold/30"
                  style={{ borderRadius: 99 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </button>
          ) : (
            <Link
              href={navItem.link || navItem.href || '#'}
              className="text-xs lg:text-sm font-medium uppercase tracking-widest py-2 px-3 flex cursor-pointer group transition-colors duration-300 items-center justify-center gap-1 text-white/80 hover:text-white relative"
              onMouseEnter={() => setIsHover(navItem.id)}
              onMouseLeave={() => setIsHover(null)}
            >
              <span>{navItem.label}</span>
              {isHover === navItem.id && (
                <motion.div
                  layoutId="nav-hover-bg"
                  className="absolute inset-0 size-full bg-gold/15 border border-gold/30"
                  style={{ borderRadius: 99 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </Link>
          )}

          <AnimatePresence>
            {openMenu === navItem.label && navItem.subMenus && (
              <div className="w-auto absolute left-0 top-full pt-3 z-50">
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-navy-dark/95 border border-white/10 backdrop-blur-xl p-5 shadow-2xl rounded-2xl w-max min-w-[320px]"
                >
                  <div className="w-fit shrink-0 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 overflow-hidden">
                    {navItem.subMenus.map((sub) => (
                      <motion.div layout className="w-full" key={sub.title}>
                        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gold">
                          {sub.title}
                        </h3>
                        <ul className="space-y-2">
                          {sub.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <li key={item.label}>
                                <Link
                                  href={item.link || '#'}
                                  onClick={() => setOpenMenu(null)}
                                  className="flex items-start space-x-3.5 p-2 rounded-xl group hover:bg-white/5 transition-all duration-200"
                                >
                                  <div className="border border-white/15 bg-white/5 text-gold rounded-lg flex items-center justify-center size-9 shrink-0 group-hover:bg-gold group-hover:text-navy group-hover:border-gold transition-colors duration-200">
                                    <Icon className="h-4 w-4 flex-none" />
                                  </div>
                                  <div className="leading-5 w-max pr-2">
                                    <p className="text-sm font-semibold text-white group-hover:text-gold transition-colors duration-200">
                                      {item.label}
                                    </p>
                                    <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-200">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </li>
      ))}
    </ul>
  );
}

export default DropdownNavigation;
