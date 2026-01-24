const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const galleryController = require('../controllers/galleryController');
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


const galleryValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required'),
  body('imageUrl')
    .notEmpty().withMessage('Image URL is required')
    .custom(isImageUrlOrBase64).withMessage('Please provide a valid URL or image data')
];


router.get('/admin/all', protect, admin, galleryController.getAllGalleryItemsAdmin);
router.get('/admin/:id', protect, admin, galleryController.getGalleryItemByIdAdmin);
router.get('/', galleryController.getAllGalleryItems);
router.get('/categories/list', galleryController.getGalleryCategories);
router.get('/:id', galleryController.getGalleryItemById);


router.post('/', protect, admin, galleryValidation, galleryController.createGalleryItem);
router.put('/:id', protect, admin, galleryController.updateGalleryItem);
router.delete('/:id', protect, admin, galleryController.deleteGalleryItem);

module.exports = router;
