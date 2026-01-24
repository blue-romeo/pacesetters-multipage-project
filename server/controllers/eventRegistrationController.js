const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// Create a new event registration
exports.createRegistration = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { 
      eventId,
      name, 
      email, 
      phone, 
      age, 
      guardian, 
      emergencyContact,
      medicalInfo,
      dietaryRestrictions,
      message
    } = req.body;

    // Check if event exists and registration is open
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.requiresRegistration) {
      return res.status(400).json({
        success: false,
        message: 'This event does not require registration'
      });
    }

    // Check if registration is still open
    const now = new Date();
    if (event.registrationDeadline && now > event.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check if already registered
    const existingRegistration = await EventRegistration.findOne({ 
      event: eventId, 
      email 
    });
    
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check if event is full
    if (event.maxParticipants) {
      const registrationCount = await EventRegistration.countDocuments({ 
        event: eventId,
        status: { $in: ['pending', 'confirmed'] }
      });
      
      if (registrationCount >= event.maxParticipants) {
        return res.status(400).json({
          success: false,
          message: 'This event is full'
        });
      }
    }

    // Determine payment status
    const paymentStatus = event.cost > 0 ? 'pending' : 'not-required';

    // Create registration
    const registration = await EventRegistration.create({
      event: eventId,
      name,
      email,
      phone,
      age,
      guardian,
      emergencyContact,
      medicalInfo,
      dietaryRestrictions,
      message,
      paymentStatus
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      data: registration
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get all registrations (admin only)
exports.getAllRegistrations = async (req, res) => {
  try {
    const { eventId, status, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (eventId) query.event = eventId;
    if (status) query.status = status;

    const registrations = await EventRegistration.find(query)
      .populate('event', 'title startDate location')
      .sort({ registeredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await EventRegistration.countDocuments(query);

    res.status(200).json({
      success: true,
      data: registrations,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get single registration by ID
exports.getRegistrationById = async (req, res) => {
  try {
    const registration = await EventRegistration.findById(req.params.id)
      .populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get registrations for a specific event
exports.getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;

    const query = { event: eventId };
    if (status) query.status = status;

    const registrations = await EventRegistration.find(query)
      .sort({ registeredAt: -1 });

    const total = registrations.length;
    const confirmed = registrations.filter(r => r.status === 'confirmed').length;
    const pending = registrations.filter(r => r.status === 'pending').length;

    res.status(200).json({
      success: true,
      data: registrations,
      stats: {
        total,
        confirmed,
        pending
      }
    });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update registration status
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { status, paymentStatus, notes } = req.body;
    const registration = await EventRegistration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (status) {
      registration.status = status;
      if (status === 'confirmed') {
        registration.confirmedAt = Date.now();
      }
    }
    
    if (paymentStatus) registration.paymentStatus = paymentStatus;
    if (notes !== undefined) registration.notes = notes;

    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Registration updated successfully',
      data: registration
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Delete registration
exports.deleteRegistration = async (req, res) => {
  try {
    const registration = await EventRegistration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    await registration.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
