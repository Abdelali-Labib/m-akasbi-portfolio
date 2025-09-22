// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
  baseUrl: 'https://res.cloudinary.com'
};

/**
 * Utility function to generate Cloudinary URLs
 * @param {string} iconPath - The path to the image
 * @returns {string} Full Cloudinary URL
 */
const getCloudinaryUrl = (iconPath) => {
  const { cloudName, baseUrl } = CLOUDINARY_CONFIG;
  
  if (!cloudName || !iconPath) return iconPath;
  
  // Ensure iconPath starts with / for proper URL formatting
  const formattedPath = iconPath.startsWith('/') ? iconPath : `/${iconPath}`;
  return `${baseUrl}/${cloudName}/image/upload${formattedPath}`;
};

export {
  CLOUDINARY_CONFIG,
  getCloudinaryUrl
}; 