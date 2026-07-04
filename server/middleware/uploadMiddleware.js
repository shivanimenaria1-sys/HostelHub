const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Allowed image mime types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG and WEBP formats are allowed.'), false);
  }
};

// Configure Multer limits (5MB) and max count (5 images)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
}).array('images', 5); // key name in request: 'images'

/**
 * Reusable upload middleware wrapper to catch Multer errors
 */
const uploadImages = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer Upload Middleware Error:', err.message);
      
      // Handle file limit sizes
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'One or more files exceed the 5 MB size limit.'
        });
      }

      // Handle excess file count limits
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          status: 'error',
          message: 'Too many files uploaded. Maximum count is 5 images.'
        });
      }

      // General error
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File upload failed'
      });
    }
    next();
  });
};

module.exports = uploadImages;
