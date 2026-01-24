const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const eventRegistrationController = require('../controllers/eventRegistrationController');
const { protect, admin } = require('../middleware/auth');
const { formLimiter } = require('../middleware/rateLimiter');

// Validation middleware
const registrationValidation = [
  body('eventId')
    .notEmpty()
    .withMessage('Event ID is required'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('age')
    .isInt({ min: 10, max: 15 })
    .withMessage('Age must be between 10 and 15'),
  body('emergencyContact.name')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact name is required'),
  body('emergencyContact.phone')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact phone is required'),
  body('emergencyContact.relationship')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact relationship is required')
];

// Public routes
router.post('/', formLimiter, registrationValidation, eventRegistrationController.createRegistration);

// Protected routes (require authentication)
router.get('/', protect, admin, eventRegistrationController.getAllRegistrations);
router.get('/event/:eventId', protect, admin, eventRegistrationController.getEventRegistrations);
router.get('/:id', protect, admin, eventRegistrationController.getRegistrationById);
router.patch('/:id/status', protect, admin, eventRegistrationController.updateRegistrationStatus);
router.delete('/:id', protect, admin, eventRegistrationController.deleteRegistration);

module.exports = router;
