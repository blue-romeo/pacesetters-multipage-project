const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const donationController = require('../controllers/donationController');
const { protect, admin } = require('../middleware/auth');
const { formLimiter } = require('../middleware/rateLimiter');


const donationValidation = [
  body('donorName')
    .trim()
    .notEmpty().withMessage('Donor name is required'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be greater than 0')
];


router.post('/', formLimiter, donationValidation, donationController.createDonation);


router.get('/', protect, admin, donationController.getAllDonations);
router.get('/stats', protect, admin, donationController.getDonationStats);
router.get('/:id', protect, admin, donationController.getDonationById);
router.patch('/:id/status', protect, admin, donationController.updateDonationStatus);

module.exports = router;
