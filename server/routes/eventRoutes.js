const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const eventController = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');

// Validation middleware
const eventValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Event title is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Event description is required'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Please provide a valid date')
];

// Admin routes (must come before parameterized routes)
router.get('/admin/all', protect, admin, eventController.getAllEventsAdmin);
router.get('/admin/:id', protect, admin, eventController.getEventByIdAdmin);
router.post('/', protect, admin, eventValidation, eventController.createEvent);
router.put('/:id', protect, admin, eventValidation, eventController.updateEvent);
router.delete('/:id', protect, admin, eventController.deleteEvent);

// Public routes
router.get('/', eventController.getAllEvents);
router.post('/:id/register', eventController.registerForEvent);
router.get('/:id', eventController.getEventById);

module.exports = router;
