const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const newsletterController = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/auth');
const { formLimiter } = require('../middleware/rateLimiter');


const subscribeValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
];


router.post('/subscribe', formLimiter, subscribeValidation, newsletterController.subscribe);
router.post('/unsubscribe', subscribeValidation, newsletterController.unsubscribe);


router.get('/', protect, admin, newsletterController.getAllSubscribers);
router.delete('/:id', protect, admin, newsletterController.deleteSubscriber);

module.exports = router;
