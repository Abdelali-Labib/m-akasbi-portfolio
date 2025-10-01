import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const fieldName = formData.get('fieldName');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    // Use exact original filename without extension as public_id
    const originalName = file.name.split('.')[0];
    const fileExtension = file.name.split('.').pop();

    // Check if file already exists in Cloudinary
    try {
      const existingFile = await cloudinary.api.resource(originalName);
      if (existingFile) {
        return NextResponse.json({ 
          error: 'Un fichier avec ce nom existe déjà. Veuillez renommer votre fichier.' 
        }, { status: 409, headers: { 'Cache-Control': 'no-store' } });
      }
    } catch (error) {
      // File doesn't exist, continue with upload
      if (error.http_code !== 404) {
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with exact original filename
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: originalName,
          use_filename: true,
          unique_filename: false,
          upload_preset: 'portfolio_filename'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Return the exact filename with original extension
    const filename = `${originalName}.${fileExtension}`;

    return NextResponse.json({
      success: true,
      filename: filename,
      url: result.secure_url,
      publicId: result.public_id
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
