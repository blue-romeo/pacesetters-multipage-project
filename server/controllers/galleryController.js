const Gallery = require('../models/Gallery');
const { validationResult } = require('express-validator');


exports.getAllGalleryItems = async (req, res) => {
  try {
    const { 
      category, 
      featured,
      page = 1, 
      limit = 12 
    } = req.query;
    
    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (featured) query.isFeatured = featured === 'true';
    
    const galleryItems = await Gallery.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('eventId', 'title startDate')
      .select('title imageUrl thumbnailUrl category isFeatured captureDate')
      .lean()
      .exec();

    const count = await Gallery.countDocuments(query);

    res.status(200).json({
      success: true,
      data: galleryItems,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


// @route   GET /api/gallery/admin/all
// @access  Private/Admin
exports.getAllGalleryItemsAdmin = async (req, res) => {
  try {
    const { 
      category, 
      featured,
      isPublished,
      page = 1, 
      limit = 12 
    } = req.query;
    
    const query = {};
    
    if (category) query.category = category;
    if (featured !== undefined) query.isFeatured = featured === 'true';
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    
    const galleryItems = await Gallery.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('eventId', 'title startDate')
      .lean()
      .exec();

    const count = await Gallery.countDocuments(query);

    res.status(200).json({
      success: true,
      data: galleryItems,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error fetching gallery items for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.getGalleryItemById = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id)
      .populate('eventId', 'title startDate location');

    if (!galleryItem || !galleryItem.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


// @route   GET /api/gallery/admin/:id
// @access  Private/Admin
exports.getGalleryItemByIdAdmin = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id)
      .populate('eventId', 'title startDate location');

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    console.error('Error fetching gallery item for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.createGalleryItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const galleryItem = await Gallery.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: galleryItem
    });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.updateGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully',
      data: galleryItem
    });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.deleteGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.getGalleryCategories = async (req, res) => {
  try {
    const categories = await Gallery.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching gallery categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
