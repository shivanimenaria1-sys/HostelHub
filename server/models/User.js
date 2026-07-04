const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  googleId: {
    type: String,
    default: null
  },
  profilePic: {
    type: String,
    default: ''
  },
  hostel: {
    type: String,
    trim: true
  },
  roomNumber: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  needsOnboarding: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index on hostel for faster searches by hostel
UserSchema.index({ hostel: 1 });

module.exports = mongoose.model('User', UserSchema);
