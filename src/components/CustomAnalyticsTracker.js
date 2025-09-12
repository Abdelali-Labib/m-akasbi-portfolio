"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function CustomAnalyticsTracker() {
  const pathname = usePathname();
  const visitorIdRef = useRef(null);

  const trackPageview = async () => {
    if (!visitorIdRef.current) return;

    // Don't track admin pages
    if (pathname.startsWith('/admin')) {
      console.log('Skipping analytics tracking for admin page:', pathname);
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
      console.log('Pageview tracking response:', result);

      // Mark this session as tracked
      sessionStorage.setItem('analytics_session_tracked', 'true');
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  useEffect(() => {
    // Generate or retrieve visitor ID
    let visitorId = localStorage.getItem('analytics_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_visitor_id', visitorId);
    }
    visitorIdRef.current = visitorId;

    // Track session start time for duration calculation
    const sessionStart = sessionStorage.getItem('analytics_session_start');
    if (!sessionStart) {
      sessionStorage.setItem('analytics_session_start', Date.now().toString());
    }

    // Track pageview on every route change (not just once per session)
    trackPageview();

    // Track session end on page unload
    const handleBeforeUnload = () => {
      const startTime = parseInt(sessionStorage.getItem('analytics_session_start') || '0');
      const sessionDuration = Math.floor((Date.now() - startTime) / 1000); // in seconds
      
      if (sessionDuration > 5) { // Only track sessions longer than 5 seconds
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
  }, []);

  // Expose tracking function globally for CV downloads and other events
  useEffect(() => {
    const trackEvent = async (eventName, eventData = {}) => {
      if (!visitorIdRef.current) return;

      console.log('Tracking event:', eventName, 'with data:', eventData);

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
        console.log('Event tracking response:', result);
      } catch (error) {
        console.error('Event tracking failed:', error);
      }
    };

    // Make tracking function available globally
    window.trackAnalyticsEvent = trackEvent;

    // Cleanup
    return () => {
      if (window.trackAnalyticsEvent) {
        delete window.trackAnalyticsEvent;
      }
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
