const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
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
    min: [18, 'Volunteers must be at least 18 years old']
  },
  occupation: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  interests: {
    type: [String],
    required: [true, 'At least one area of interest is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Please select at least one area of interest'
    }
  },
  skills: {
    type: String,
    trim: true
  },
  availability: {
    type: String,
    required: [true, 'Availability information is required'],
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  backgroundCheck: {
    type: Boolean,
    required: [true, 'Background check consent is required'],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'Background check consent is required'
    }
  },
  message: {
    type: String,
    trim: true
  },
  consent: {
    type: Boolean,
    required: [true, 'Consent is required'],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'You must agree to the terms'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected', 'active'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Index for faster queries
volunteerSchema.index({ email: 1 });
volunteerSchema.index({ status: 1 });
volunteerSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Volunteer', volunteerSchema);
