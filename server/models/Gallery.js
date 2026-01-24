const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Gallery item title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  thumbnailUrl: {
    type: String
  },
  category: {
    type: String,
    enum: ['camping', 'activities', 'ceremonies', 'community-service', 'training', 'events', 'other'],
    default: 'other'
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  uploadedBy: {
    type: String,
    default: 'admin'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  captureDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
gallerySchema.index({ category: 1 });
gallerySchema.index({ isPublished: 1 });
gallerySchema.index({ isFeatured: 1 });
gallerySchema.index({ createdAt: -1 });
// Compound indexes for optimized queries
gallerySchema.index({ isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);
