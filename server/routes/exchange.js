const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  expressInterest,
  getDashboardStats,
  getSmartMatches
} = require('../controllers/exchangeController');

// All routes are protected
router.use(protect);

router.post('/', createRequest);
router.get('/', getRequests);
router.get('/stats', getDashboardStats);
router.get('/:id', getRequestById);
router.patch('/:id/status', updateRequestStatus);
router.post('/:id/interest', expressInterest);
router.get('/:id/matches', getSmartMatches);

module.exports = router;
