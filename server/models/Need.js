const mongoose = require('mongoose');

const NeedSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please specify the need title (e.g. Need Maggi urgently)'],
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify the requester']
  },
  hostel: {
    type: String,
    required: [true, 'Please specify the hostel location'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Open', 'Fulfilled'],
    default: 'Open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index on hostel and category for fast filtering
NeedSchema.index({ hostel: 1, category: 1 });

module.exports = mongoose.model('Need', NeedSchema);
