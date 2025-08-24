import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
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
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use a promise to handle the stream-based upload
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio_ma',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            
            reject(new Error('Failed to upload to Cloudinary.'));
          }
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('Cloudinary upload did not return a secure URL.');
    }

    return NextResponse.json({
      message: 'File uploaded successfully.',
      url: uploadResult.secure_url,
    });

  } catch (error) {
    
    return NextResponse.json({ error: 'Something went wrong during file upload.' }, { status: 500 });
  }
}
