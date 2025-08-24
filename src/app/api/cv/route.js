// src/app/api/cv/route.js
import FirestoreService from "@/lib/firestore-service";
import { NextResponse } from "next/server";

/**
 * API route handler for GET requests to fetch and stream the CV.
 * Fetches the CV path from Firestore, retrieves the file from the URL,
 * and streams it to the client for download.
 * @param {Request} req - The incoming request object.
 * @returns {Promise<NextResponse>} A response object with the CV file stream or an error.
 */
export async function GET(req) {
  try {
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

    // 3. Get the file content as an ArrayBuffer
    const fileBuffer = await fileResponse.arrayBuffer();

    // 4. Create response with appropriate headers for download
    const headers = new Headers();
    headers.append("Content-Type", fileResponse.headers.get("Content-Type") || "application/octet-stream");
    headers.append("Content-Disposition", `attachment; filename="cv-mouhcine-akasbi.pdf"`);
    headers.append("Content-Length", fileBuffer.byteLength.toString());

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    
    return new NextResponse(JSON.stringify({ error: "An internal server error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
