// src/app/api/cv/route.js
import FirestoreService from "@/lib/firestore-service";
import { NextResponse } from "next/server";
import { headers } from 'next/headers';

/**
 * API route handler for GET requests to fetch and stream the CV.
 * Fetches the CV path from Firestore, retrieves the file from the URL,
 * tracks the download, and streams it to the client for download.
 * @param {Request} req - The incoming request object.
 * @returns {Promise<NextResponse>} A response object with the CV file stream or an error.
 */
export async function GET(req) {
  try {
    // Track CV download before serving file
    await trackCvDownload(req);

    // 1. Fetch the CV path from Firestore
    const cvPath = await FirestoreService.getCvPath();

    if (!cvPath) {
      return new NextResponse(JSON.stringify({ error: "CV path not found in database." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Construct the full Cloudinary URL using the fixCloudinaryUrl method
    const fullCvUrl = FirestoreService.fixCloudinaryUrl(cvPath);

    // 3. Fetch the CV file from the Cloudinary URL
    const fileResponse = await fetch(fullCvUrl);

    if (!fileResponse.ok) {
      return new NextResponse(JSON.stringify({ error: "Failed to fetch CV from storage." }), {
        status: fileResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Get the file content as an ArrayBuffer
    const fileBuffer = await fileResponse.arrayBuffer();

    // 5. Create response with appropriate headers for download
    const responseHeaders = new Headers();
    responseHeaders.append("Content-Type", fileResponse.headers.get("Content-Type") || "application/octet-stream");
    responseHeaders.append("Content-Disposition", `attachment; filename="cv-mouhcine-akasbi.pdf"`);
    responseHeaders.append("Content-Length", fileBuffer.byteLength.toString());

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('CV download error:', error);
    return new NextResponse(JSON.stringify({ error: "An internal server error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
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
    
    console.log('Tracking CV download for date:', today);
    
    await FirestoreService.trackCvDownload({
      date: today,
      userAgent,
      country,
      timestamp: new Date()
    });
    
    console.log('CV download tracked successfully');
  } catch (error) {
    console.error('Failed to track CV download:', error);
    // Don't fail the download if tracking fails
  }
}
