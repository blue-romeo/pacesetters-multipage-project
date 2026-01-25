const Event = require('../models/Event');
const { validationResult } = require('express-validator');


exports.getAllEvents = async (req, res) => {
  try {
    const { 
      category, 
      upcoming, 
      featured,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (featured) query.isFeatured = featured === 'true';
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }
    
    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title startDate endDate location category imageUrl isFeatured isPublished requiresRegistration maxParticipants registeredParticipants')
      .lean()
      .exec();

    const count = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: events,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registeredParticipants', 'name email');

    if (!event || !event.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


// @route   GET /api/events/admin/:id
// @access  Private/Admin
exports.getEventByIdAdmin = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registeredParticipants', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.getAllEventsAdmin = async (req, res) => {
  try {
    const { 
      category, 
      isPublished,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    if (category) query.category = category;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: events,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error fetching events for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.registerForEvent = async (req, res) => {
  try {
    const { contactId } = req.body;
    const event = await Event.findById(req.params.id);

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

    const now = new Date();
    if (now > event.registrationDeadline || now > event.startDate) {
      return res.status(400).json({
        success: false,
        message: 'Registration for this event is closed'
      });
    }

    
    if (event.registeredParticipants.includes(contactId)) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event'
      });
    }

    
    if (event.maxParticipants && event.registeredParticipants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'This event is full'
      });
    }

    event.registeredParticipants.push(contactId);
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      data: event
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
