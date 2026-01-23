const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  location: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['meeting', 'camping', 'service', 'training', 'social', 'competition', 'other'],
    default: 'other'
  },
  imageUrl: {
    type: String
  },
  maxParticipants: {
    type: Number
  },
  registeredParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  requiresRegistration: {
    type: Boolean,
    default: false
  },
  registrationDeadline: {
    type: Date
  },
  cost: {
    type: Number,
    default: 0
  },
  additionalInfo: {
    type: String
  },
  createdBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});


eventSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date();
});


eventSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.requiresRegistration) return false;
  const now = new Date();
  return now < this.registrationDeadline && this.startDate > now;
});


eventSchema.index({ startDate: 1 });
eventSchema.index({ isPublished: 1 });
eventSchema.index({ category: 1 });

eventSchema.index({ isPublished: 1, startDate: 1 });
eventSchema.index({ isPublished: 1, isFeatured: 1 });

module.exports = mongoose.model('Event', eventSchema);
