const mongoose = require('mongoose');

const leaderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Leader name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Leader role is required'],
    trim: true
  },
  bio: {
    type: String,
    required: [true, 'Leader bio is required']
  },
  photoUrl: {
    type: String,
    required: [true, 'Leader photo URL is required']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
leaderSchema.index({ order: 1 });
leaderSchema.index({ isActive: 1 });

module.exports = mongoose.model('Leader', leaderSchema);
