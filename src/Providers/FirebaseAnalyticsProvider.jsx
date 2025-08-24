"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

/**
 * FirebaseAnalyticsProvider is a client component that handles Google Analytics page view tracking.
 * It listens for route changes using the `usePathname` hook and logs a `page_view` event whenever the URL changes.
 * This ensures that all page navigations within the Next.js App Router are automatically tracked.
 */
const FirebaseAnalyticsProvider = ({ children }) => {
  const pathname = usePathname();

  useEffect(() => {
    // Only track in production environment
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    // The `analytics` object might not be available immediately on the first render.
    // The `isSupported()` check in `firebase.js` is asynchronous.
    // We ensure `analytics` is defined before attempting to log an event.
    if (analytics) {
      try {
        logEvent(analytics, 'page_view', {
          page_path: pathname,
          page_title: document.title, // Use the current document title
        });
      } catch (error) {
        // Silently handle GA tracking errors to prevent console spam
        
      }
    }
  }, [pathname]); // Re-run the effect when the pathname changes

  return <>{children}</>;
};

export default FirebaseAnalyticsProvider;
