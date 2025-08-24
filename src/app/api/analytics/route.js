import { BetaAnalyticsDataClient } from '@google-analytics/data';

// 1. Authenticate using service account credentials
const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) {
  throw new Error('The GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set.');
}
const credentials = JSON.parse(serviceAccountJson);

const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

// 2. Get the GA4 Property ID from environment variables
// Note: This should be the numeric Property ID (e.g., "123456789"), not the Measurement ID (G-XXXXXXXXX)
// You can find this in Google Analytics > Admin > Property Settings > Property ID
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
      '7days': { startDate: '7daysAgo', endDate: 'today' },
      '30days': { startDate: '30daysAgo', endDate: 'today' },
      '90days': { startDate: '90daysAgo', endDate: 'today' }
    };
    
    const dateRanges = [dateRangeMap[dateRange] || dateRangeMap['30days']];

    // 1. Core Metrics Report
    const coreMetricsRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'engagementRate' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'sessionsPerUser' },
        { name: 'screenPageViewsPerSession' },
        { name: 'userEngagementDuration' }
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }]
    };

    // 2. Enhanced Demographics Report
    const demographicsRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'country' }, { name: 'countryId' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 50
    };

    // 2b. City Demographics Report
    const cityDemographicsRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'city' }, { name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 20
    };

    // 2c. Age and Gender Demographics
    const ageGenderRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'userAgeBracket' }, { name: 'userGender' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
    };

    // 3. Enhanced Technology Report
    const deviceRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
    };

    const browserRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'browser' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' }
      ],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 15
    };

    // 3b. Operating System Report
    const osRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'operatingSystem' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10
    };

    // 3c. Screen Resolution Report
    const screenRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'screenResolution' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10
    };

    // 4. Content Performance Report (exclude admin and login pages)
    const topPagesRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: 'pagePath',
                stringFilter: {
                  matchType: 'DOES_NOT_CONTAIN',
                  value: '/admin'
                }
              }
            },
            {
              filter: {
                fieldName: 'pagePath',
                stringFilter: {
                  matchType: 'DOES_NOT_CONTAIN',
                  value: '/login'
                }
              }
            },
          ]
        }
      },
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 15
    };

    // 5. Enhanced Traffic Acquisition Report
    const trafficSourcesRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'engagementRate' }
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
    };

    // 5b. Source/Medium Report
    const sourceMediumRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'bounceRate' }
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 20
    };

    // 5c. Landing Pages Report
    const landingPagesRequest = {
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'landingPage' }],
      metrics: [
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: 'landingPage',
                stringFilter: {
                  matchType: 'DOES_NOT_CONTAIN',
                  value: '/admin'
                }
              }
            }
          ]
        }
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15
    };

    // 6. Real-time Report
    const realtimeRequest = {
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }]
    };

    // Run all reports in parallel
    const [
      coreMetricsResponse,
      demographicsResponse,
      deviceResponse,
      browserResponse,
      topPagesResponse,
      trafficSourcesResponse
    ] = await Promise.all([
      runReport(coreMetricsRequest),
      runReport(demographicsRequest),
      runReport(deviceRequest),
      runReport(browserRequest),
      runReport(topPagesRequest),
      runReport(trafficSourcesRequest)
    ]);

    // Get real-time data
    let realtimeUsers = 0;
    try {
      const [realtimeResponse] = await analyticsDataClient.runRealtimeReport(realtimeRequest);
      realtimeUsers = realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || 0;
    } catch (error) {
      
    }

    // Process core metrics with daily breakdown
    const dailyMetrics = coreMetricsResponse.rows?.map(row => ({
      date: row.dimensionValues[0].value,
      activeUsers: parseInt(row.metricValues[0].value),
      sessions: parseInt(row.metricValues[1].value),
      pageViews: parseInt(row.metricValues[2].value),
      engagementRate: parseFloat(row.metricValues[3].value),
      avgSessionDuration: parseFloat(row.metricValues[4].value)
    })) || [];

    // Calculate totals
    const totalMetrics = dailyMetrics.reduce((acc, day) => ({
      activeUsers: acc.activeUsers + day.activeUsers,
      sessions: acc.sessions + day.sessions,
      pageViews: acc.pageViews + day.pageViews,
      engagementRate: acc.engagementRate + day.engagementRate,
      avgSessionDuration: acc.avgSessionDuration + day.avgSessionDuration
    }), { activeUsers: 0, sessions: 0, pageViews: 0, engagementRate: 0, avgSessionDuration: 0 });

    // Average the rates
    const daysCount = dailyMetrics.length || 1;
    totalMetrics.engagementRate = totalMetrics.engagementRate / daysCount;
    totalMetrics.avgSessionDuration = totalMetrics.avgSessionDuration / daysCount;

    // Process other reports
    const topCountries = demographicsResponse.rows?.map(row => ({
      country: row.dimensionValues[0].value,
      countryCode: row.dimensionValues[1].value,
      users: parseInt(row.metricValues[0].value)
    })) || [];

    const deviceCategories = deviceResponse.rows?.map(row => ({
      device: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value)
    })) || [];

    const topBrowsers = browserResponse.rows?.map(row => ({
      browser: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value)
    })) || [];

    const topPages = topPagesResponse.rows?.map(row => ({
      page: row.dimensionValues[0].value,
      title: row.dimensionValues[1].value,
      visitors: parseInt(row.metricValues[0].value),
      views: parseInt(row.metricValues[1].value)
    })) || [];

    const trafficSources = trafficSourcesResponse.rows?.map(row => ({
      source: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[1].value), // activeUsers
      sessions: parseInt(row.metricValues[0].value) // sessions
    })) || [];

    // Return comprehensive analytics data
    return new Response(JSON.stringify({
      dateRange,
      realtimeUsers: parseInt(realtimeUsers),
      totalMetrics,
      dailyMetrics,
      topCountries,
      deviceCategories,
      topBrowsers,
      topPages,
      trafficSources
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch analytics data.',
      details: error.details || error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
