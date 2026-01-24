const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const volunteerController = require('../controllers/volunteerController');
const { protect, admin } = require('../middleware/auth');

// Validation middleware
const volunteerValidation = [
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
    .isInt({ min: 18 })
    .withMessage('Volunteers must be at least 18 years old'),
  body('interests')
    .isArray({ min: 1 })
    .withMessage('At least one area of interest is required'),
  body('availability')
    .trim()
    .notEmpty()
    .withMessage('Availability information is required'),
  body('backgroundCheck')
    .isBoolean()
    .withMessage('Background check consent is required')
    .custom((value) => {
      if (value !== true) {
        throw new Error('Background check consent is required');
      }
      return true;
    }),
  body('consent')
    .isBoolean()
    .withMessage('Consent is required')
    .custom((value) => {
      if (value !== true) {
        throw new Error('You must agree to the terms');
      }
      return true;
    })
];

// Public routes
router.post('/', volunteerValidation, volunteerController.createVolunteer);

// Protected routes (require authentication)
router.get('/', protect, admin, volunteerController.getAllVolunteers);
router.get('/stats', protect, admin, volunteerController.getVolunteerStats);
router.get('/:id', protect, admin, volunteerController.getVolunteerById);
router.patch('/:id/status', protect, admin, volunteerController.updateVolunteerStatus);
router.put('/:id', protect, admin, volunteerController.updateVolunteer);
router.delete('/:id', protect, admin, volunteerController.deleteVolunteer);

module.exports = router;
