import { dbAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { NextResponse } from 'next/server';

/**
 * Track CV download events
 * POST /api/cv-download
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userAgent, referrer } = body;
    
    // Extract IP from request headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'Unknown';
    
    // Add download record to Firestore using Admin SDK (server-side reliable)
    await dbAdmin.collection('cvDownloads').add({
      downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: userAgent || 'Unknown',
      ip: ip,
      referrer: referrer || 'Direct',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'CV download tracked successfully' 
    });
  } catch (error) {
    console.error('CV download tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track CV download' },
      { status: 500 }
    );
  }
}

/**
 * Get CV download statistics
 * GET /api/cv-download
 */
export async function GET() {
  try {
    // This endpoint can be used to get download stats if needed
    // For now, we'll use the real-time listener in the dashboard
    return NextResponse.json({ 
      message: 'CV download tracking is active' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get CV download stats' },
      { status: 500 }
    );
  }
}
