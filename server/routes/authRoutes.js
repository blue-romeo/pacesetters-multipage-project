const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

// Validation middleware
const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username or email is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
];

// Public routes
router.post('/login', loginValidation, authController.login);
router.post('/init', registerValidation, authController.initSuperAdmin);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/password', protect, authController.updatePassword);
router.patch('/profile', protect, authController.updateProfile);

// Super-admin only routes
router.post('/register', protect, admin, registerValidation, authController.register);
router.get('/admins', protect, admin, authController.getAllAdmins);
router.get('/admins/:id', protect, authController.getAdminById);
router.patch('/admins/:id', protect, admin, authController.updateAdmin);
router.delete('/admins/:id', protect, admin, authController.deleteAdmin);

module.exports = router;
