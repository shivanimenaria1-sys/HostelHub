const ExchangeRequest = require('../models/ExchangeRequest');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const Need = require('../models/Need');
const User = require('../models/User');

// @desc    Create a new Room/Roommate Exchange request
// @route   POST /api/exchange
// @access  Private
const createRequest = async (req, res) => {
  try {
    const {
      requestType,
      currentHostel,
      currentBlock,
      currentRoomNumber,
      roomType,
      lookingFor,
      preferredRoom,
      roommatePreference,
      reasonForSwitching,
      additionalNotes,
      whatsappNumber
    } = req.body;

    if (!requestType || !currentHostel || !currentBlock || !currentRoomNumber || !roomType || !lookingFor || !whatsappNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }

    const exchangeRequest = await ExchangeRequest.create({
      student: req.user.id,
      requestType,
      currentHostel,
      currentBlock,
      currentRoomNumber,
      roomType,
      lookingFor,
      preferredRoom,
      roommatePreference: roommatePreference || [],
      reasonForSwitching,
      additionalNotes,
      whatsappNumber
    });

    // Check for smart matches immediately to notify the user
    // (A request is a match if it has a different author, is Open, and shares the same hostel and roomType)
    const potentialMatches = await ExchangeRequest.find({
      student: { $ne: req.user.id },
      status: 'Open',
      currentHostel,
      roomType
    });

    if (potentialMatches.length > 0) {
      // Create a match notification for the user
      await Notification.create({
        recipient: req.user.id,
        type: 'MATCH',
        message: `We found ${potentialMatches.length} matching room/roommate exchange request(s) for your new posting in ${currentHostel}!`,
        relatedRequest: exchangeRequest._id
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Exchange request posted successfully',
      exchangeRequest
    });
  } catch (error) {
    console.error('Create Exchange Request Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while creating request'
    });
  }
};

// @desc    Get all exchange requests with filters & search
// @route   GET /api/exchange
// @access  Private
const getRequests = async (req, res) => {
  try {
    const { hostel, block, roomType, requestType, status, search } = req.query;

    const query = {};

    // Apply filters
    if (hostel) query.currentHostel = hostel;
    if (block) query.currentBlock = new RegExp(block, 'i');
    if (roomType) query.roomType = roomType;
    if (requestType) query.requestType = requestType;
    if (status) {
      query.status = status;
    } else {
      // By default show Open requests
      query.status = 'Open';
    }

    // Apply search
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Search matching users first
      const matchedUsers = await User.find({
        $or: [{ name: searchRegex }, { hostel: searchRegex }]
      }).select('_id');
      const userIds = matchedUsers.map(u => u._id);

      query.$or = [
        { student: { $in: userIds } },
        { currentHostel: searchRegex },
        { currentRoomNumber: searchRegex },
        { lookingFor: searchRegex },
        { reasonForSwitching: searchRegex },
        { additionalNotes: searchRegex },
        { roommatePreference: { $in: [searchRegex] } }
      ];
    }

    const requests = await ExchangeRequest.find(query)
      .populate('student', 'name email profilePic hostel roomNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get Exchange Requests Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while fetching requests'
    });
  }
};

// @desc    Get single request detail
// @route   GET /api/exchange/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id)
      .populate('student', 'name email profilePic hostel roomNumber');

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Exchange request not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      request
    });
  } catch (error) {
    console.error('Get Exchange Request By ID Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while fetching request details'
    });
  }
};

// @desc    Update request status (Open -> Matched -> Closed)
// @route   PATCH /api/exchange/:id/status
// @access  Private (Owner only)
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Open', 'Matched', 'Closed'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value'
      });
    }

    const request = await ExchangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }

    // Verify ownership
    if (request.student.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You did not post this request'
      });
    }

    request.status = status;
    await request.save();

    // Notify interested students if matched/closed
    if (request.interestedStudents && request.interestedStudents.length > 0) {
      const messages = {
        Matched: `The exchange request you were interested in (posted by ${req.user.name || 'a student'}) has been marked as Matched!`,
        Closed: `The exchange request you were interested in has been closed.`
      };

      if (messages[status]) {
        const notifications = request.interestedStudents.map(studentId => ({
          recipient: studentId,
          sender: req.user.id,
          type: 'STATUS_CHANGE',
          message: messages[status],
          relatedRequest: request._id
        }));
        await Notification.insertMany(notifications);
      }
    }

    // Also notify request owner that status is updated successfully
    await Notification.create({
      recipient: req.user.id,
      type: 'STATUS_CHANGE',
      message: `Your request status has been successfully updated to: ${status}`,
      relatedRequest: request._id
    });

    return res.status(200).json({
      status: 'success',
      message: `Request marked as ${status}`,
      request
    });
  } catch (error) {
    console.error('Update Request Status Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while updating request status'
    });
  }
};

// @desc    Express interest in a request
// @route   POST /api/exchange/:id/interest
// @access  Private
const expressInterest = async (req, res) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id).populate('student', 'name');
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Exchange request not found'
      });
    }

    if (request.student.toString() === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot express interest in your own request'
      });
    }

    // Check if already interested
    if (request.interestedStudents.includes(req.user.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already expressed interest in this request'
      });
    }

    request.interestedStudents.push(req.user.id);
    await request.save();

    // Create notification for request owner
    await Notification.create({
      recipient: request.student,
      sender: req.user.id,
      type: 'INTEREST',
      message: `${req.user.name || 'Another student'} expressed interest in your room exchange request in ${request.currentHostel}!`,
      relatedRequest: request._id
    });

    return res.status(200).json({
      status: 'success',
      message: 'Interest recorded successfully. The owner has been notified.'
    });
  } catch (error) {
    console.error('Express Interest Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while recording interest'
    });
  }
};

// @desc    Get dashboard statistics for students
// @route   GET /api/exchange/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const marketplaceListings = await Product.countDocuments({ status: 'Available' });
    const openNeedRequests = await Need.countDocuments({ status: 'Open' });
    const roomSwitchRequests = await ExchangeRequest.countDocuments({ requestType: 'Room Switch', status: 'Open' });
    const roommateRequests = await ExchangeRequest.countDocuments({ requestType: 'Roommate Switch', status: 'Open' });
    const successfulMatches = await ExchangeRequest.countDocuments({ status: 'Matched' });
    const activeExchangeRequests = await ExchangeRequest.countDocuments({ status: 'Open' });

    return res.status(200).json({
      status: 'success',
      stats: {
        marketplaceListings,
        openNeedRequests,
        roomSwitchRequests,
        roommateRequests,
        successfulMatches,
        activeExchangeRequests
      }
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while fetching stats'
    });
  }
};

// @desc    Get smart matching suggestions for a request
// @route   GET /api/exchange/:id/matches
// @access  Private
const getSmartMatches = async (req, res) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }

    // Find other open requests
    const candidates = await ExchangeRequest.find({
      _id: { $ne: request._id },
      student: { $ne: req.user.id },
      status: 'Open'
    }).populate('student', 'name email profilePic hostel roomNumber');

    // Score candidates based on matching criteria
    const scored = candidates.map(candidate => {
      let score = 0;

      // 1. Hostel match (high preference)
      if (candidate.currentHostel === request.currentHostel) {
        score += 3;
      }
      
      // 2. Room Type match
      if (candidate.roomType === request.roomType) {
        score += 3;
      }

      // 3. Roommate preference overlap
      if (request.roommatePreference && candidate.roommatePreference) {
        const overlap = request.roommatePreference.filter(p => candidate.roommatePreference.includes(p));
        score += overlap.length * 1.5;
      }

      // 4. Request type match
      if (candidate.requestType === request.requestType) {
        score += 1;
      }

      return { candidate, score };
    });

    // Sort by score descending and select positive matches
    scored.sort((a, b) => b.score - a.score);
    const matches = scored.filter(item => item.score > 0).map(item => item.candidate);

    return res.status(200).json({
      status: 'success',
      matches: matches.slice(0, 5)
    });
  } catch (error) {
    console.error('Get Smart Matches Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while fetching matches'
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  expressInterest,
  getDashboardStats,
  getSmartMatches
};
