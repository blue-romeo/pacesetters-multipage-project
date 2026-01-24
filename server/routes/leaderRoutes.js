const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const leaderController = require('../controllers/leaderController');
const { protect, admin } = require('../middleware/auth');


const isImageUrlOrBase64 = (value) => {
  if (!value) return false;
  
  if (value.startsWith('data:image/')) return true;
  
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};


const leaderValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Leader name is required'),
  body('role')
    .trim()
    .notEmpty().withMessage('Leader role is required'),
  body('bio')
    .trim()
    .notEmpty().withMessage('Leader bio is required'),
  body('photoUrl')
    .notEmpty().withMessage('Photo URL is required')
    .custom(isImageUrlOrBase64).withMessage('Please provide a valid URL or image data')
];


router.get('/admin/all', protect, admin, leaderController.getAllLeadersAdmin);
router.get('/admin/:id', protect, admin, leaderController.getLeaderByIdAdmin);
router.post('/', protect, admin, leaderValidation, leaderController.createLeader);
router.put('/:id', protect, admin, leaderController.updateLeader);
router.delete('/:id', protect, admin, leaderController.deleteLeader);


router.get('/', leaderController.getAllLeaders);
router.get('/:id', leaderController.getLeaderById);

module.exports = router;
