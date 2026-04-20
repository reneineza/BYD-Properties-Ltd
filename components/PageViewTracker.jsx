'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Generates or retrieves a stable session ID from sessionStorage
function getSessionId() {
  try {
    let id = sessionStorage.getItem('byd_sid');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('byd_sid', id);
    }
    return id;
  } catch {
    return null;
  }
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef(null);

  useEffect(() => {
    // Skip admin paths entirely
    if (pathname.startsWith('/admin')) return;
    // Skip duplicate fires (e.g. StrictMode double-mount)
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const sessionId = getSessionId();
    const referrer = document.referrer || null;

    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, sessionId, referrer }),
    }).catch(() => {
      // Silently ignore tracker errors
    });
  }, [pathname]);

  return null;
}
