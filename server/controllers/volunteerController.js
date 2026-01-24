const Volunteer = require('../models/Volunteer');
const { validationResult } = require('express-validator');

// Create a new volunteer application
exports.createVolunteer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { 
      name, 
      email, 
      phone, 
      age, 
      occupation, 
      address, 
      interests, 
      skills, 
      availability, 
      experience, 
      backgroundCheck, 
      message, 
      consent 
    } = req.body;

    // Check if volunteer with this email already exists
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return res.status(400).json({
        success: false,
        message: 'A volunteer application with this email already exists'
      });
    }

    // Create new volunteer application
    const volunteer = await Volunteer.create({
      name,
      email,
      phone,
      age,
      occupation,
      address,
      interests,
      skills,
      availability,
      experience,
      backgroundCheck,
      message,
      consent
    });

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully',
      data: volunteer
    });
  } catch (error) {
    console.error('Error creating volunteer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get all volunteers
exports.getAllVolunteers = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const volunteers = await Volunteer.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('reviewedBy', 'username email');

    const count = await Volunteer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: volunteers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get single volunteer by ID
exports.getVolunteerById = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id)
      .populate('reviewedBy', 'username email');

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update volunteer status
exports.updateVolunteerStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    volunteer.status = status;
    if (notes) {
      volunteer.notes = notes;
    }
    volunteer.reviewedAt = Date.now();
    volunteer.reviewedBy = req.user.id; // From auth middleware

    await volunteer.save();

    res.status(200).json({
      success: true,
      message: 'Volunteer status updated successfully',
      data: volunteer
    });
  } catch (error) {
    console.error('Error updating volunteer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update volunteer information
exports.updateVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'name', 'email', 'phone', 'age', 'occupation', 'address',
      'interests', 'skills', 'availability', 'experience', 
      'backgroundCheck', 'message', 'status', 'notes'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        volunteer[field] = req.body[field];
      }
    });

    volunteer.reviewedAt = Date.now();
    volunteer.reviewedBy = req.user.id;

    await volunteer.save();

    res.status(200).json({
      success: true,
      message: 'Volunteer updated successfully',
      data: volunteer
    });
  } catch (error) {
    console.error('Error updating volunteer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Delete volunteer
exports.deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    await volunteer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Volunteer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get volunteer statistics
exports.getVolunteerStats = async (req, res) => {
  try {
    const stats = await Volunteer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Volunteer.countDocuments();
    const pending = stats.find(s => s._id === 'pending')?.count || 0;
    const approved = stats.find(s => s._id === 'approved')?.count || 0;
    const active = stats.find(s => s._id === 'active')?.count || 0;
    const reviewed = stats.find(s => s._id === 'reviewed')?.count || 0;
    const rejected = stats.find(s => s._id === 'rejected')?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        active,
        reviewed,
        rejected,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
