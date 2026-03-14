const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentId: {
    type: String,
    default: null,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  cancellationDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
