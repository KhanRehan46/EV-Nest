import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create a payment order (Razorpay or Mock)
// @route   POST /api/payments/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  const { amount, bookingId } = req.body;

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required' });
  }

  // Simulating Razorpay order creation
  const orderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;

  res.status(201).json({
    id: orderId,
    entity: 'order',
    amount: amount * 100, // paise
    currency: 'INR',
    receipt: bookingId || 'receipt_123',
    status: 'created',
  });
});

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
router.post('/verify', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Since we are mocking payment for demo, we will auto-approve
  const mockPaymentId = razorpay_payment_id || `pay_mock_${Math.random().toString(36).substring(2, 15)}`;

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    paymentId: mockPaymentId,
  });
});

export default router;
