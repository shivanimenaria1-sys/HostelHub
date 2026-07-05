const mongoose = require('mongoose');

const HostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hostel name is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Boys', 'Girls'],
    required: [true, 'Hostel type (Boys/Girls) is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for fast lookups
HostelSchema.index({ isActive: 1, name: 1 });

module.exports = mongoose.model('Hostel', HostelSchema);
