const Payment = require('../models/Payment');
const { validationResult } = require('express-validator');
const bookingService = require('../services/bookingService');
const { v4: uuidv4 } = require('uuid');

// Simulate payment processing (in production, this would integrate with a payment gateway)
const simulatePayment = async (amount) => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate 95% success rate for demo purposes
  const success = Math.random() > 0.05;
  return {
    success,
    transactionId: success ? `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : null,
    message: success ? 'Payment processed successfully' : 'Payment processing failed',
  };
};

// Process payment
exports.processPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, amount, userId } = req.body;

    // Generate unique payment ID
    const paymentId = `PAY-${Date.now()}-${uuidv4().substr(0, 8)}`;

    // Create payment record
    const payment = new Payment({
      paymentId,
      bookingId,
      userId,
      amount,
      status: 'pending',
    });

    await payment.save();

    // Simulate payment processing
    const paymentResult = await simulatePayment(amount);

    if (paymentResult.success) {
      payment.status = 'success';
      payment.transactionId = paymentResult.transactionId;
      await payment.save();

      // Confirm booking
      try {
        await bookingService.confirmBooking(bookingId);
      } catch (error) {
        console.error('Failed to confirm booking:', error);
        // Payment succeeded but booking confirmation failed
        // In production, this would trigger a compensation transaction
      }

      res.status(200).json({
        message: 'Payment processed successfully',
        paymentId: payment.paymentId,
        transactionId: payment.transactionId,
        status: 'success',
        bookingId,
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        message: 'Payment processing failed',
        paymentId: payment.paymentId,
        status: 'failed',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.paymentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

// Get payment by booking ID
exports.getPaymentByBookingId = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.bookingId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found for this booking' });
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

// Process refund
exports.processRefund = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { refundAmount } = req.body;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({ message: 'Can only refund successful payments' });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({ message: 'Payment already refunded' });
    }

    const refund = refundAmount || payment.amount;

    if (refund > payment.amount) {
      return res.status(400).json({ message: 'Refund amount cannot exceed payment amount' });
    }

    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 500));

    payment.status = 'refunded';
    payment.refundAmount = refund;
    payment.refundDate = new Date();
    await payment.save();

    res.json({
      message: 'Refund processed successfully',
      paymentId: payment.paymentId,
      refundAmount: refund,
      refundDate: payment.refundDate,
    });
  } catch (error) {
    next(error);
  }
};
