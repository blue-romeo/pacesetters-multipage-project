const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: [true, 'Donor name is required'],
    trim: true
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
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [1, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'KES',
    uppercase: true
  },
  donationType: {
    type: String,
    enum: ['one-time', 'monthly', 'yearly'],
    default: 'one-time'
  },
  purpose: {
    type: String,
    enum: ['general', 'equipment', 'uniforms', 'trips', 'scholarships', 'other'],
    default: 'general'
  },
  message: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank', 'cash', 'other']
  },
  transactionId: {
    type: String,
    trim: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  receiptSent: {
    type: Boolean,
    default: false
  },
  donatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
donationSchema.index({ email: 1 });
donationSchema.index({ paymentStatus: 1 });
donationSchema.index({ donatedAt: -1 });
donationSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Donation', donationSchema);
