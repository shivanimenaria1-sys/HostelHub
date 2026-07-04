const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createNeed,
  getNeeds,
  getMyRequests,
  fulfillNeed,
  deleteNeed
} = require('../controllers/needController');

// Public search/listing route and creation route
router.get('/', getNeeds);
router.post('/', protect, createNeed);

// Protected My Requests endpoint (Registered BEFORE /:id to prevent routing conflict)
router.get('/my-requests', protect, getMyRequests);

// Individual Need Modification endpoints
router.patch('/:id/fulfill', protect, fulfillNeed);
router.delete('/:id', protect, deleteNeed);

module.exports = router;
