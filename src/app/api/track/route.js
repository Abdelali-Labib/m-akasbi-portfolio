import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    // Handle empty or malformed request bodies
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json({ success: true, message: 'Empty request body' });
      }
      body = JSON.parse(text);
    } catch (parseError) {
      
      return NextResponse.json({ success: true, message: 'Invalid JSON body' });
    }
    
    const { type, visitorId, pathname, referrer: pageReferrer, userAgent, data } = body;

    // Do not track visits to admin pages
    if (pathname && pathname.startsWith('/admin')) {
      return NextResponse.json({ success: true, message: 'Admin visit not tracked.' });
    }
    
    // Get headers for country detection
    const headersList = await headers();
    const country = headersList.get('cf-ipcountry') || headersList.get('x-vercel-ip-country') || 'Unknown';
    const resolvedUserAgent = userAgent || headersList.get('user-agent') || '';
    
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    
    
    // Import FirestoreService dynamically to avoid import issues
    const { default: FirestoreService } = await import('@/lib/firestore-service');
    
    if (type === 'pageview') {
      // Track visitor analytics (no page view data)
      await FirestoreService.trackVisitor({
        visitorId,
        date: today,
        country,
        userAgent: resolvedUserAgent,
        referrer: pageReferrer,
        timestamp: new Date()
      });
      
      
    } else if (type === 'event' && data?.name === 'cv_download') {
      // Track CV download event
      await FirestoreService.trackCvDownload({
        date: today,
        userAgent,
        country,
        timestamp: new Date()
      });
      
      
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 });
  }
}
