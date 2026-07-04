const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dummy_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'dummy_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dummy_api_secret'
});

// Configure Multer Storage Engine for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'HostelHub/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Max dimension constraint
  }
});

/**
 * Helper to delete a file from Cloudinary based on its URL
 * @param {string} imageUrl - The full secure url from Cloudinary
 */
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    // A secure URL typically follows:
    // https://res.cloudinary.com/<cloud_name>/image/upload/<version>/HostelHub/products/<filename>.<ext>
    const parts = imageUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) {
      console.warn(`URL does not contain 'upload' token: ${imageUrl}`);
      return;
    }

    // Get all parts after /upload/
    let pathParts = parts.slice(uploadIndex + 1);
    
    // If the first part matches a version pattern (e.g. v1625471900), remove it
    if (pathParts[0] && pathParts[0].startsWith('v') && !isNaN(pathParts[0].substring(1))) {
      pathParts = pathParts.slice(1);
    }

    // Join remaining parts and remove file extension
    const pathWithExtension = pathParts.join('/');
    const dotIndex = pathWithExtension.lastIndexOf('.');
    const publicId = dotIndex !== -1 ? pathWithExtension.substring(0, dotIndex) : pathWithExtension;

    console.log(`Cloudinary API Destroy call: ${publicId}`);
    const res = await cloudinary.uploader.destroy(publicId);
    return res;
  } catch (error) {
    console.error(`Failed to delete asset from Cloudinary: ${error.message}`);
    throw error;
  }
};

module.exports = {
  cloudinary,
  storage,
  deleteFromCloudinary
};
