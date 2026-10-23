'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastPingRef = useRef<number>(0);

  useEffect(() => {
    // Generate or get pseudonymous session ID
    let sessionId = localStorage.getItem('funprint_session_id');
    if (!sessionId) {
      sessionId = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('funprint_session_id', sessionId);
    }

    const deviceCategory = window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
    const trafficSource = document.referrer ? new URL(document.referrer).hostname : 'direct';

    const sendPing = () => {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          currentPage: pathname,
          deviceCategory,
          trafficSource,
          eventName: 'page_view',
        }),
      }).catch(() => {});
      lastPingRef.current = Date.now();
    };

    sendPing();

    // Heartbeat every 2 minutes for active session
    const interval = setInterval(() => {
      sendPing();
    }, 120000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
