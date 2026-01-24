const Donation = require('../models/Donation');
const { validationResult } = require('express-validator');


exports.createDonation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const donation = await Donation.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Donation record created successfully',
      data: donation
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.getAllDonations = async (req, res) => {
  try {
    const { 
      paymentStatus, 
      donationType, 
      purpose,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (donationType) query.donationType = donationType;
    if (purpose) query.purpose = purpose;
    
    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Donation.countDocuments(query);

    
    const totalAmount = await Donation.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: donations,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.updateDonationStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, transactionId },
      { new: true, runValidators: true }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donation status updated successfully',
      data: donation
    });
  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};


exports.getDonationStats = async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      {
        $facet: {
          totalCompleted: [
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
          ],
          byPurpose: [
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: '$purpose', total: { $sum: '$amount' }, count: { $sum: 1 } } }
          ],
          byType: [
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: '$donationType', total: { $sum: '$amount' }, count: { $sum: 1 } } }
          ],
          recentDonations: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
