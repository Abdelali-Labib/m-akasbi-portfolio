import FirestoreService from "@/lib/firestore-service";
import { NextResponse } from "next/server";
import { headers } from 'next/headers';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // Track CV download before serving file
    await trackCvDownload(req);

    const cvPath = await FirestoreService.getCvPath();

    if (!cvPath) {
      return new NextResponse(JSON.stringify({ error: "CV path not found in database." }), {
        status: 404,
        headers: { "Content-Type": "application/json", 'Cache-Control': 'no-store' },
      });
    }

    const fullCvUrl = FirestoreService.fixCloudinaryUrl(cvPath);

    const fileResponse = await fetch(fullCvUrl);

    if (!fileResponse.ok) {
      return new NextResponse(JSON.stringify({ error: "Failed to fetch CV from storage." }), {
        status: fileResponse.status,
        headers: { "Content-Type": "application/json", 'Cache-Control': 'no-store' },
      });
    }

    const fileBuffer = await fileResponse.arrayBuffer();

    const responseHeaders = new Headers();
    responseHeaders.append("Content-Type", fileResponse.headers.get("Content-Type") || "application/octet-stream");
    responseHeaders.append("Content-Disposition", `attachment; filename="cv-mouhcine-akasbi.pdf"`);
    responseHeaders.append("Content-Length", fileBuffer.byteLength.toString());

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: new Headers({ ...Object.fromEntries(responseHeaders), 'Cache-Control': 'no-store' }),
    });

  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "An internal server error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json", 'Cache-Control': 'no-store' },
    });
  }
}

/**
 * Track CV download in analytics
 */
async function trackCvDownload(req) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const country = headersList.get('cf-ipcountry') || headersList.get('x-vercel-ip-country') || 'Unknown';
    
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    
    
    await FirestoreService.trackCvDownload({
      date: today,
      userAgent,
      country,
      timestamp: new Date()
    });
    
    
  } catch (error) {
    // Don't fail the download if tracking fails
  }
}
