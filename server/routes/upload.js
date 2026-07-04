const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const uploadImages = require('../middleware/uploadMiddleware');

// @desc    Upload multiple product images to Cloudinary (Max 5)
// @route   POST /api/upload
// @access  Private (Requires login)
router.post('/', protect, uploadImages, (req, res) => {
  console.log('Upload route: protect passed. req.user:', req.user ? req.user._id : 'none');
  try {
    if (!req.files || req.files.length === 0) {
      console.log('Upload route: No image files were uploaded or req.files is undefined');
      return res.status(400).json({
        status: 'error',
        message: 'No image files were uploaded'
      });
    }

    console.log('Upload route: req.files count:', req.files.length);
    // multer-storage-cloudinary stores the Cloudinary URL inside 'path' or 'secure_url'
    const urls = req.files.map(file => file.path || file.secure_url);
    console.log('Upload route: parsed urls:', urls);

    return res.status(200).json({
      status: 'success',
      message: 'Images uploaded successfully',
      urls
    });
  } catch (error) {
    console.error('Upload route error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during image processing: ' + error.message
    });
  }
});

module.exports = router;
