const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');
const { formLimiter } = require('../middleware/rateLimiter');

// Validation middleware
const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 10, max: 15 }).withMessage('Age must be between 10 and 15'),
  body('consent')
    .notEmpty().withMessage('Consent is required')
    .isBoolean().withMessage('Consent must be a boolean')
    .custom(value => value === true).withMessage('You must agree to the terms')
];


router.post('/', formLimiter, contactValidation, contactController.createContact);


router.get('/', protect, admin, contactController.getAllContacts);
router.get('/:id', protect, admin, contactController.getContactById);
router.patch('/:id/status', protect, admin, contactController.updateContactStatus);
router.delete('/:id', protect, admin, contactController.deleteContact);

module.exports = router;
