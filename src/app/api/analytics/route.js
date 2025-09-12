import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Authentication using service account credentials
const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) {
  throw new Error('The GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set.');
}
const credentials = JSON.parse(serviceAccountJson);

const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

// Get the GA4 Property ID from environment variables
const propertyId = process.env.GA4_PROPERTY_ID;
if (!propertyId) {
  throw new Error('The GA4_PROPERTY_ID environment variable is not set. Please add your numeric GA4 Property ID to your .env.local file.');
}

// Helper function to run a report
async function runReport(request) {
  const [response] = await analyticsDataClient.runReport(request);
  return response;
}

export async function GET(request) {
  try {
    // Get date range from query parameters
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30days';
    
    // Map date range to GA4 format
    const dateRangeMap = {
      '24hours': { startDate: '1daysAgo', endDate: 'today' },
      '7days': { startDate: '7daysAgo', endDate: 'today' },
      '30days': { startDate: '30daysAgo', endDate: 'today' },
      '90days': { startDate: '90daysAgo', endDate: 'today' },
      'allTime': { startDate: '2020-01-01', endDate: 'today' }
    };
    
    const dateRanges = [dateRangeMap[dateRange] || dateRangeMap['30days']];

    // 1. Basic Totals Report
    const totalsRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'engagementRate' },
        { name: 'bounceRate' }
      ]
    };

    // 2. Daily Breakdown
    const dailyRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' }
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }]
    };

    // 3. Countries
    const countriesRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10
    };

    // 4. Device Categories
    const deviceRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
    };

    // 5. Traffic Sources
    const trafficRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
    };

    // 6. CV Downloads (custom event)
    const cvDownloadsRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: {
            matchType: 'EXACT',
            value: 'cv_download'
          }
        }
      }
    };

    // Run all reports
    const [
      totalsResponse,
      dailyResponse,
      countriesResponse,
      deviceResponse,
      trafficResponse,
      cvDownloadsResponse
    ] = await Promise.all([
      runReport(totalsRequest),
      runReport(dailyRequest),
      runReport(countriesRequest),
      runReport(deviceRequest),
      runReport(trafficRequest),
      runReport(cvDownloadsRequest)
    ]);

    // Get real-time users
    let realtimeUsers = 0;
    try {
      const [realtimeResponse] = await analyticsDataClient.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [{ name: 'activeUsers' }]
      });
      realtimeUsers = parseInt(realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || '0');
    } catch (error) {
      console.error('Real-time data error:', error);
      realtimeUsers = 0; // Default to 0 if real-time data fails
    }

    // Process raw data without calculations
    const totalMetrics = {
      totalUsers: parseInt(totalsResponse.rows?.[0]?.metricValues?.[0]?.value || '0'),
      sessions: parseInt(totalsResponse.rows?.[0]?.metricValues?.[1]?.value || '0'),
      pageViews: parseInt(totalsResponse.rows?.[0]?.metricValues?.[2]?.value || '0'),
      engagementRate: parseFloat(totalsResponse.rows?.[0]?.metricValues?.[3]?.value || '0'),
      bounceRate: parseFloat(totalsResponse.rows?.[0]?.metricValues?.[4]?.value || '0')
    };

    const dailyMetrics = dailyResponse.rows?.map(row => ({
      date: row.dimensionValues[0].value,
      activeUsers: parseInt(row.metricValues[0].value),
      sessions: parseInt(row.metricValues[1].value),
      pageViews: parseInt(row.metricValues[2].value)
    })) || [];

    const topCountries = countriesResponse.rows?.map(row => ({
      country: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value)
    })) || [];

    const deviceCategories = deviceResponse.rows?.map(row => ({
      device: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value)
    })) || [];

    const trafficSources = trafficResponse.rows?.map(row => ({
      source: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value)
    })) || [];

    // Prefer Firestore count for CV downloads (tracked server-side), fallback to GA if needed
    let cvDownloadCount = 0;
    try {
      const { dbAdmin } = await import('@/lib/firebase-admin');
      const admin = (await import('firebase-admin')).default;
      const now = new Date();
      let startDate;
      switch (dateRange) {
        case '24hours':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'allTime':
        default:
          startDate = null;
          break;
      }

      let queryRef = dbAdmin.collection('cvDownloads');
      if (startDate) {
        queryRef = queryRef.where('downloadedAt', '>=', admin.firestore.Timestamp.fromDate(startDate));
      }
      // Improved error handling for Firestore query
      try {
        const snapshot = await queryRef.get();
        cvDownloadCount = snapshot.size;
      } catch (e) {
        console.error('Firestore query error:', e);
        cvDownloadCount = parseInt(cvDownloadsResponse.rows?.[0]?.metricValues?.[0]?.value || '0');
      }
    } catch (e) {
      cvDownloadCount = parseInt(cvDownloadsResponse.rows?.[0]?.metricValues?.[0]?.value || '0');
    }

    // Return raw data
    return new Response(JSON.stringify({
      dateRange,
      realtimeUsers,
      totalMetrics,
      dailyMetrics,
      topCountries,
      deviceCategories,
      trafficSources,
      cvDownloads: {
        total: cvDownloadCount
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch analytics data.',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
