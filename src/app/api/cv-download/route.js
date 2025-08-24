import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

/**
 * Track CV download events
 * POST /api/cv-download
 */
export async function POST(request) {
  try {
    const { userAgent, ip, referrer } = await request.json();
    
    // Add download record to Firestore
    await addDoc(collection(db, 'cvDownloads'), {
      downloadedAt: serverTimestamp(),
      userAgent: userAgent || 'Unknown',
      ip: ip || 'Unknown',
      referrer: referrer || 'Direct',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'CV download tracked successfully' 
    });
  } catch (error) {
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
