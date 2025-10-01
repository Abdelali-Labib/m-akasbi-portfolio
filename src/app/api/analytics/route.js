// Google Analytics integration removed

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { dbAdmin } = await import('@/lib/firebase-admin');
    if (!dbAdmin) {
      return new Response(JSON.stringify({
        totalVisitors: 0,
        cvDownloads: 0,
        visitorsByDay: [],
        cvDownloadsByDay: [],
        topCountries: [],
        devices: [],
        topReferrers: []
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const snap = await dbAdmin.collection('analytics').doc('daily_stats').get();
    const agg = snap.exists ? snap.data() : {};
    // Calculate total visitors from daily_visitors
    const totalVisitors = Object.values(agg.daily_visitors || {}).reduce((sum, v) => sum + (Array.isArray(v) ? v.length : 0), 0);
    
    // Process daily visitors data
    const visitorsByDay = Object.entries(agg.daily_visitors || {}).map(([date, visitors]) => ({
      date,
      visitors: Array.isArray(visitors) ? visitors.length : 0
    }));

    // Process CV downloads by date
    const cvDownloadsByDay = Object.entries(agg.cv_downloads_by_date || {}).map(([date, downloads]) => ({
      date,
      downloads: downloads || 0
    }));
    const topCountries = Object.entries(agg.visitor_countries || {}).map(([country, users]) => ({ country, users }));
    const deviceCategories = Object.entries(agg.visitor_devices || {}).map(([device, users]) => ({ device, users }));
    const trafficSources = Object.entries(agg.visitor_referrers || {}).map(([source, users]) => ({ source, users }));
    // Calculate CV downloads total from cv_downloads_by_date
    const cvDownloadCount = Object.values(agg.cv_downloads_by_date || {}).reduce((sum, count) => sum + (count || 0), 0);

    return new Response(JSON.stringify({
      totalVisitors,
      cvDownloads: cvDownloadCount,
      visitorsByDay,
      cvDownloadsByDay,
      topCountries: topCountries.map(item => ({ country: item.country, count: item.users })),
      devices: deviceCategories.map(item => ({ device: item.device, count: item.users })),
      topReferrers: trafficSources.map(item => ({ referrer: item.source, count: item.users }))
    }), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch analytics data.',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
}
