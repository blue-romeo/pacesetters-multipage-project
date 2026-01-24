const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event reference is required']
  },
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [10, 'Age must be at least 10'],
    max: [15, 'Age must be at most 15']
  },
  guardian: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      trim: true
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      trim: true
    }
  },
  medicalInfo: {
    type: String,
    trim: true
  },
  dietaryRestrictions: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'attended'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['not-required', 'pending', 'paid', 'refunded'],
    default: 'not-required'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
eventRegistrationSchema.index({ event: 1 });
eventRegistrationSchema.index({ email: 1 });
eventRegistrationSchema.index({ status: 1 });
eventRegistrationSchema.index({ event: 1, email: 1 }, { unique: true }); // Prevent duplicate registrations

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
