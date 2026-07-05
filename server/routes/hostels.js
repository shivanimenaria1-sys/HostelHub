const express = require('express');
const router = express.Router();
const {
  getHostels,
  createHostel,
  updateHostel,
  deleteHostel
} = require('../controllers/hostelController');

// GET is public so unauthenticated pages (e.g. Onboarding) can load the list
router.get('/', getHostels);
router.post('/', createHostel);
router.put('/:id', updateHostel);
router.delete('/:id', deleteHostel);

module.exports = router;
