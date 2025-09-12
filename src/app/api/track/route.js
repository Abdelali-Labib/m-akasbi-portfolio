import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    // Handle empty or malformed request bodies
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        console.log('Empty request body, skipping analytics tracking');
        return NextResponse.json({ success: true, message: 'Empty request body' });
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.log('Invalid JSON in request body:', parseError.message);
      return NextResponse.json({ success: true, message: 'Invalid JSON body' });
    }
    
    const { type, visitorId, referrer, userAgent, data } = body;
    
    // Get headers for country detection
    const headersList = await headers();
    const country = headersList.get('cf-ipcountry') || headersList.get('x-vercel-ip-country') || 'Unknown';
    const resolvedUserAgent = userAgent || headersList.get('user-agent') || '';
    
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Analytics tracking request:', { type, visitorId, today, country });
    
    // Import FirestoreService dynamically to avoid import issues
    const { default: FirestoreService } = await import('@/lib/firestore-service');
    
    if (type === 'pageview') {
      // Track pageview with visitor analytics
      await FirestoreService.trackPageview({
        visitorId,
        date: today,
        country,
        userAgent: resolvedUserAgent,
        referrer,
        timestamp: new Date()
      });
      
      console.log('Pageview tracked successfully');
    } else if (type === 'event' && data?.name === 'cv_download') {
      // Track CV download event
      await FirestoreService.trackCvDownload({
        date: today,
        userAgent,
        country,
        timestamp: new Date()
      });
      
      console.log('CV download event tracked successfully');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 });
  }
}
