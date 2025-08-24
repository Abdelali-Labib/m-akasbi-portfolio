// Cloudinary configurati
const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
  baseUrl: 'https://res.cloudinary.com'
};

// Utility function to generate Cloudinary URLs
const getCloudinaryUrl = (iconPath) => {
  const { cloudName, baseUrl } = CLOUDINARY_CONFIG;
  // Ensure iconPath starts with / for proper URL formatting
  const formattedPath = iconPath.startsWith('/') ? iconPath : `/${iconPath}`;
  return `${baseUrl}/${cloudName}/image/upload${formattedPath}`;
};

module.exports = {
  CLOUDINARY_CONFIG,
  getCloudinaryUrl
}; 