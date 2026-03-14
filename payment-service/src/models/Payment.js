const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  bookingId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer'],
    default: 'card',
  },
  transactionId: {
    type: String,
    default: null,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
