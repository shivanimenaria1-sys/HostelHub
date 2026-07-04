const Need = require('../models/Need');
const Product = require('../models/Product');

// @desc    Create a new need request
// @route   POST /api/needs
// @access  Private (Authenticated)
const createNeed = async (req, res) => {
  const { title, category, description } = req.body;

  // 1. Validation
  if (!title) {
    return res.status(400).json({
      status: 'error',
      message: 'Title is required'
    });
  }

  const cleanTitle = title.trim();
  if (cleanTitle.length < 5 || cleanTitle.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Title must be between 5 and 100 characters long'
    });
  }

  try {
    // Check if user has finished onboarding and has a hostel
    if (!req.user.hostel) {
      return res.status(400).json({
        status: 'error',
        message: 'Onboarding required: Please set your hostel location first'
      });
    }

    const need = await Need.create({
      title: cleanTitle,
      category: category || 'Others',
      description: description || '',
      requestedBy: req.user.id,
      hostel: req.user.hostel,
      status: 'Open'
    });

    // 2. Find possible matching products (same category and hostel, currently Available)
    let possibleMatches = [];
    if (need.category && need.hostel) {
      possibleMatches = await Product.find({
        category: need.category,
        hostel: need.hostel,
        status: 'Available'
      })
      .sort({ createdAt: -1 }) // Newest first
      .limit(5)
      .populate('seller', 'name profilePic');
    }

    return res.status(201).json({
      status: 'success',
      message: 'Need request posted successfully',
      need,
      possibleMatches
    });
  } catch (error) {
    console.error('Create Need Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to post need request'
    });
  }
};

// @desc    Get all open needs with pagination and filtering
// @route   GET /api/needs
// @access  Public
const getNeeds = async (req, res) => {
  try {
    const { category, hostel, search, page = 1, limit = 10 } = req.query;

    const query = { status: 'Open' }; // Fetch only open needs

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by hostel
    if (hostel) {
      query.hostel = hostel;
    }

    // Search by title and description (case-insensitive)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skipNum = (pageNum - 1) * limitNum;

    // Fetch pagination metrics
    const totalNeeds = await Need.countDocuments(query);
    const totalPages = Math.ceil(totalNeeds / limitNum);

    const needs = await Need.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skipNum)
      .limit(limitNum)
      .populate('requestedBy', 'name hostel roomNumber profilePic');

    return res.status(200).json({
      status: 'success',
      needs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        totalNeeds
      }
    });
  } catch (error) {
    console.error('Get Needs Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve need requests'
    });
  }
};

// @desc    Get all open/fulfilled requests created by the logged-in user
// @route   GET /api/needs/my-requests
// @access  Private (Authenticated)
const getMyRequests = async (req, res) => {
  try {
    const needs = await Need.find({ requestedBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('requestedBy', 'name hostel roomNumber profilePic');

    return res.status(200).json({
      status: 'success',
      needs
    });
  } catch (error) {
    console.error('Get My Requests Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve your need requests'
    });
  }
};

// @desc    Mark a need request as Fulfilled
// @route   PATCH /api/needs/:id/fulfill
// @access  Private (Owner Only)
const fulfillNeed = async (req, res) => {
  try {
    const need = await Need.findById(req.params.id);

    if (!need) {
      return res.status(404).json({
        status: 'error',
        message: 'Need request not found'
      });
    }

    // Verify ownership (only the requester can fulfill)
    if (need.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You can only mark your own requests as fulfilled'
      });
    }

    need.status = 'Fulfilled';
    const updatedNeed = await need.save();
    
    // Populate requester profile before returning
    await updatedNeed.populate('requestedBy', 'name hostel roomNumber profilePic');

    return res.status(200).json({
      status: 'success',
      message: 'Need marked as fulfilled successfully',
      need: updatedNeed
    });
  } catch (error) {
    console.error('Fulfill Need Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to mark need request as fulfilled'
    });
  }
};

// @desc    Delete a need request
// @route   DELETE /api/needs/:id
// @access  Private (Owner Only)
const deleteNeed = async (req, res) => {
  try {
    const need = await Need.findById(req.params.id);

    if (!need) {
      return res.status(404).json({
        status: 'error',
        message: 'Need request not found'
      });
    }

    // Verify ownership
    if (need.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You can only delete your own requests'
      });
    }

    await Need.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Need request deleted successfully'
    });
  } catch (error) {
    console.error('Delete Need Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete need request'
    });
  }
};

module.exports = {
  createNeed,
  getNeeds,
  getMyRequests,
  fulfillNeed,
  deleteNeed
};
