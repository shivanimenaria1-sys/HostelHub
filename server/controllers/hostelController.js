const Hostel = require('../models/Hostel');

// Natural-sort order: B1-B12 first, then G1-G8
const SORT_ORDER = [
  'B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12',
  'G1','G2','G3','G4','G5','G6','G7','G8'
];

const sortHostels = (hostels) => {
  return [...hostels].sort((a, b) => {
    const ai = SORT_ORDER.indexOf(a.name);
    const bi = SORT_ORDER.indexOf(b.name);
    // Known hostels sort by their position in SORT_ORDER;
    // unknown/new hostels (index === -1) go to the end, alphabetically.
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
};

// @desc   Get all active hostels
// @route  GET /api/hostels
// @access Public
const getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({ isActive: true });
    const sorted = sortHostels(hostels);
    res.status(200).json({
      status: 'success',
      count: sorted.length,
      data: sorted
    });
  } catch (err) {
    console.error('getHostels error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch hostels' });
  }
};

// @desc   Create a new hostel
// @route  POST /api/hostels
// @access Public (can be restricted to admin later)
const createHostel = async (req, res) => {
  try {
    const { name, type } = req.body;
    const hostel = await Hostel.create({ name, type });
    res.status(201).json({ status: 'success', data: hostel });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ status: 'error', message: `Hostel "${req.body.name}" already exists` });
    }
    console.error('createHostel error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @desc   Update a hostel
// @route  PUT /api/hostels/:id
// @access Public (can be restricted to admin later)
const updateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!hostel) {
      return res.status(404).json({ status: 'error', message: 'Hostel not found' });
    }
    res.status(200).json({ status: 'success', data: hostel });
  } catch (err) {
    console.error('updateHostel error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @desc   Soft-delete a hostel (set isActive = false)
// @route  DELETE /api/hostels/:id
// @access Public (can be restricted to admin later)
const deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!hostel) {
      return res.status(404).json({ status: 'error', message: 'Hostel not found' });
    }
    res.status(200).json({ status: 'success', message: `Hostel "${hostel.name}" deactivated` });
  } catch (err) {
    console.error('deleteHostel error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = { getHostels, createHostel, updateHostel, deleteHostel };
