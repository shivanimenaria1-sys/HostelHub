const express = require('express');
const router = express.Router();
const { googleLogin, updateOnboarding } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Route for Google ID Token Authentication
router.post('/google', googleLogin);

// Route for completing onboarding details (Protected)
router.put('/onboarding', protect, updateOnboarding);

module.exports = router;
