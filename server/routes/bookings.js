import express from 'express';
import Booking from '../models/Booking.js';
import Charger from '../models/Charger.js';
import { protect, merchantOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Driver)
router.post('/', protect, async (req, res) => {
  const { chargerId, scheduledAt, durationMinutes, estimatedCost, paymentId } = req.body;

  try {
    const charger = await Charger.findById(chargerId);
    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    if (!charger.isLive) {
      return res.status(400).json({ message: 'Charger is offline' });
    }

    const booking = new Booking({
      userId: req.user._id,
      chargerId,
      scheduledAt: new Date(scheduledAt),
      durationMinutes: Number(durationMinutes),
      estimatedCost: Number(estimatedCost),
      status: 'pending', // will start as pending, or confirmed on instant mock payment
      paymentId: paymentId || '',
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get user's (driver) bookings
// @route   GET /api/bookings/me
// @access  Private (Driver)
router.get('/me', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'chargerId',
        populate: { path: 'merchantId', select: 'name email' }
      })
      .sort({ scheduledAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get merchant's (host) incoming bookings
// @route   GET /api/bookings/merchant
// @access  Private/Merchant (Host)
router.get('/merchant', protect, merchantOnly, async (req, res) => {
  try {
    // Find all chargers belonging to this merchant
    const merchantChargers = await Charger.find({ merchantId: req.user._id });
    const chargerIds = merchantChargers.map((c) => c._id);

    // Find all bookings for these chargers
    const bookings = await Booking.find({ chargerId: { $in: chargerIds } })
      .populate('userId', 'name email carModel')
      .populate('chargerId')
      .sort({ scheduledAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update booking status (confirm/cancel)
// @route   PATCH /api/bookings/:id/status
// @access  Private (Driver or Merchant)
router.patch('/:id/status', protect, async (req, res) => {
  const { status } = req.body;

  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status update' });
  }

  try {
    // Find booking WITHOUT populate first for auth checks (avoids populated object issues)
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Find the charger separately to get merchant ID
    const charger = await Charger.findById(booking.chargerId);
    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    // Extract IDs safely — handle both string IDs and populated objects
    const bookingUserId = (booking.userId?._id || booking.userId)?.toString();
    const chargerMerchantId = (charger.merchantId?._id || charger.merchantId)?.toString();
    const requestUserId = req.user._id?.toString();

    const isDriver = bookingUserId === requestUserId;
    const isMerchant = chargerMerchantId === requestUserId;

    if (!isDriver && !isMerchant) {
      return res.status(401).json({ message: 'Not authorized to modify this booking' });
    }

    if ((status === 'confirmed' || status === 'completed') && !isMerchant) {
      return res.status(403).json({ message: 'Only hosts can confirm or complete bookings' });
    }

    // Update status — use the raw booking object's save method
    booking.status = status;
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
