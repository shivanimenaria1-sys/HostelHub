const mongoose = require('mongoose');

const ExchangeRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify the student posting the request']
  },
  requestType: {
    type: String,
    enum: ['Room Switch', 'Roommate Switch'],
    required: [true, 'Request type must be either Room Switch or Roommate Switch']
  },
  currentHostel: {
    type: String,
    required: [true, 'Current hostel is required'],
    trim: true
  },
  currentBlock: {
    type: String,
    required: [true, 'Current block is required'],
    trim: true
  },
  currentRoomNumber: {
    type: String,
    required: [true, 'Current room number is required'],
    trim: true
  },
  roomType: {
    type: String,
    enum: ['Single', 'Double', 'Triple'],
    required: [true, 'Current room type is required']
  },
  lookingFor: {
    type: String,
    required: [true, 'Looking for description is required'],
    trim: true
  },
  preferredRoom: {
    type: String,
    trim: true
  },
  roommatePreference: {
    type: [String],
    default: []
  },
  reasonForSwitching: {
    type: String,
    trim: true
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  whatsappNumber: {
    type: String,
    required: [true, 'WhatsApp number is required for contact'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Open', 'Matched', 'Closed'],
    default: 'Open'
  },
  interestedStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for filtering/searching
ExchangeRequestSchema.index({ currentHostel: 1, roomType: 1, requestType: 1, status: 1 });

module.exports = mongoose.model('ExchangeRequest', ExchangeRequestSchema);
