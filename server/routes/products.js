const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createProduct,
  getProducts,
  getProductById,
  getMyListings,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  logContact
} = require('../controllers/productController');

// Public Product List and creation endpoint
router.get('/', getProducts);
router.post('/', protect, createProduct);

// Protected My Listings endpoint (Registered BEFORE /:id to prevent parameter matching conflict)
router.get('/my-listings', protect, getMyListings);

// Individual Listing endpoints
router.get('/:id', getProductById);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.patch('/:id/status', protect, toggleProductStatus);
router.post('/:id/contact-log', protect, logContact);

module.exports = router;
