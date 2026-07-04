const Notification = require('../models/Notification');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name profilePic')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    return res.status(200).json({
      status: 'success',
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while fetching notifications'
    });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    // Verify ownership
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized action'
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while updating notification status'
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
