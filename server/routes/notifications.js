const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

// All routes are protected
router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;
