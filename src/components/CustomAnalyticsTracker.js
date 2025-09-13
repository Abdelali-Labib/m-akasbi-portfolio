"use client";

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export default function CustomAnalyticsTracker() {
  const pathname = usePathname();
  const visitorIdRef = useRef(null);

  const trackPageview = useCallback(async () => {
    if (!visitorIdRef.current) return;

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
          referrer: document.referrer || 'Direct',
          userAgent: navigator.userAgent,
        }),
      });

      const result = await response.json();

  // ...existing code...
      sessionStorage.setItem('analytics_session_tracked', 'true');
    } catch (error) {
    }
  }, [pathname]);

  useEffect(() => {
  // ...existing code...
    let visitorId = localStorage.getItem('analytics_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_visitor_id', visitorId);
    }
    visitorIdRef.current = visitorId;

  // ...existing code...
    const sessionStart = sessionStorage.getItem('analytics_session_start');
    if (!sessionStart) {
      sessionStorage.setItem('analytics_session_start', Date.now().toString());
    }

  // ...existing code...
    trackPageview();

  // ...existing code...
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
