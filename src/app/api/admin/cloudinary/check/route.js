import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return Response.json({ error: 'Name parameter is required' }, { status: 400 });
    }

    // Check if resource exists in Cloudinary
    try {
      await cloudinary.api.resource(name);
      return Response.json({ exists: true });
    } catch (error) {
      if (error.http_code === 404) {
        return Response.json({ exists: false });
      }
      throw error;
    }
  } catch (error) {
    return Response.json({ 
      error: 'Failed to check resource existence',
      exists: false 
    }, { status: 500 });
  }
}
