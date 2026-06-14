import express from 'express';
import Review from '../models/Review.js';
import Charger from '../models/Charger.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Add review for a charger
// @route   POST /api/reviews/:chargerId
// @access  Private
router.post('/:chargerId', protect, async (req, res) => {
  const { rating, comment } = req.body;
  const chargerId = req.params.chargerId;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Please provide a rating between 1 and 5' });
  }

  try {
    const charger = await Charger.findById(chargerId);
    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    // Check if user has already reviewed this charger
    const alreadyReviewed = await Review.findOne({ userId: req.user._id, chargerId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this charger' });
    }

    const review = new Review({
      userId: req.user._id,
      chargerId,
      rating: Number(rating),
      comment: comment || '',
    });

    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all reviews for a charger
// @route   GET /api/reviews/:chargerId
// @access  Public
router.get('/:chargerId', async (req, res) => {
  try {
    const reviews = await Review.find({ chargerId: req.params.chargerId })
      .populate('userId', 'name email carModel')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
