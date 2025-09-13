import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Handles POST requests to upload a file to Cloudinary.
 * @param {Request} request - The incoming request object, expected to contain form-data with a 'file' field.
 * @returns {NextResponse} - A response object with the upload result or an error message.
 */
export async function POST(request) {
  try {
    // Check Cloudinary configuration
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables');
      return NextResponse.json({ error: 'Cloudinary configuration missing' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get original filename without extension for public_id
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;

    // Use a promise to handle the stream-based upload
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: nameWithoutExt,
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload stream error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            console.log('Cloudinary upload successful:', result?.public_id);
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('Cloudinary upload did not return a secure URL.');
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully.',
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      original_filename: originalName,
    });

  } catch (error) {
    console.error('File upload API error:', error.message);
    return NextResponse.json({ error: 'Something went wrong during file upload.' }, { status: 500 });
  }
}
