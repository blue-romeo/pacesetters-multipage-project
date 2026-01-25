const Leader = require('../models/Leader');
const { validationResult } = require('express-validator');


exports.getAllLeaders = async (req, res) => {
  try {
    const leaders = await Leader.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('name role bio photoUrl order')
      .lean();

    res.status(200).json({
      success: true,
      data: leaders,
      total: leaders.length
    });
  } catch (error) {
    console.error('Error fetching leaders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.getLeaderById = async (req, res) => {
  try {
    const leader = await Leader.findById(req.params.id);

    if (!leader || !leader.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Leader not found'
      });
    }

    res.status(200).json({
      success: true,
      data: leader
    });
  } catch (error) {
    console.error('Error fetching leader:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


// @route   GET /api/leaders/admin/:id
// @access  Private/Admin
exports.getLeaderByIdAdmin = async (req, res) => {
  try {
    const leader = await Leader.findById(req.params.id);

    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Leader not found'
      });
    }

    res.status(200).json({
      success: true,
      data: leader
    });
  } catch (error) {
    console.error('Error fetching leader for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


// @route   GET /api/leaders/admin/all
// @access  Private/Admin
exports.getAllLeadersAdmin = async (req, res) => {
  try {
    const { 
      isActive,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const leaders = await Leader.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Leader.countDocuments(query);

    res.status(200).json({
      success: true,
      data: leaders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error fetching leaders for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.createLeader = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const leader = await Leader.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Leader created successfully',
      data: leader
    });
  } catch (error) {
    console.error('Error creating leader:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.updateLeader = async (req, res) => {
  try {
    const leader = await Leader.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Leader not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leader updated successfully',
      data: leader
    });
  } catch (error) {
    console.error('Error updating leader:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.deleteLeader = async (req, res) => {
  try {
    const leader = await Leader.findByIdAndDelete(req.params.id);

    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Leader not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leader deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leader:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
