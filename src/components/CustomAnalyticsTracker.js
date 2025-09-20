"use client";

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export default function CustomAnalyticsTracker() {
  const pathname = usePathname();
  const visitorIdRef = useRef(null);
  const hasTrackedRef = useRef(false);

  const trackPageview = useCallback(async () => {
    if (!visitorIdRef.current) return;
    // Prevent back-to-back duplicate sends in same render cycle
    if (hasTrackedRef.current) return;

    // Only count first visit per calendar day
    const today = new Date().toISOString().split('T')[0];
    try {
      if (typeof window !== 'undefined') {
        const lastTrackedDate = localStorage.getItem('analytics_tracked_date');
        if (lastTrackedDate === today) return;
      }
    } catch (_) {}

  // ...existing code...
    if (pathname.startsWith('/admin')) {
      return;
    }

    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'pageview',
          visitorId: visitorIdRef.current,
          pathname,
          referrer: document.referrer || 'Direct',
          userAgent: navigator.userAgent,
        }),
      });

      const result = await response.json();

      // Mark as tracked for today
      hasTrackedRef.current = true;
      try {
        localStorage.setItem('analytics_tracked_date', today);
      } catch (_) {}
      // Optional: session marker
      sessionStorage.setItem('analytics_session_tracked', 'true');
    } catch (error) {
    }
  }, [pathname]);

  useEffect(() => {
    let visitorId = localStorage.getItem('analytics_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_visitor_id', visitorId);
    }
    visitorIdRef.current = visitorId;

    const sessionStart = sessionStorage.getItem('analytics_session_start');
    if (!sessionStart) {
      sessionStorage.setItem('analytics_session_start', Date.now().toString());
    }

    // Attempt to track; function will ensure only once per day
    trackPageview();

    const handleBeforeUnload = () => {
      const startTime = parseInt(sessionStorage.getItem('analytics_session_start') || '0');
      const sessionDuration = Math.floor((Date.now() - startTime) / 1000);
      if (sessionDuration > 5) {
        navigator.sendBeacon('/api/track', JSON.stringify({
          type: 'session_end',
          visitorId: visitorIdRef.current,
          sessionDuration: sessionDuration
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackPageview]);

  // ...existing code...
  useEffect(() => {
    const trackEvent = async (eventName, eventData = {}) => {
      if (!visitorIdRef.current) return;

      

      try {
        const response = await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'event',
            visitorId: visitorIdRef.current,
            data: {
              name: eventName,
              ...eventData
            }
          }),
        });
        
        const result = await response.json();
      } catch (error) {
      }
    };

  // ...existing code...
    window.trackAnalyticsEvent = trackEvent;

  // ...existing code...
    return () => {
      if (window.trackAnalyticsEvent) {
        delete window.trackAnalyticsEvent;
      }
    };
  }, []);

  // ...existing code...
  return null;
}
