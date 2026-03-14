const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  organizerId: {
    type: String,
    required: true,
  },
  venue: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['music', 'sports', 'theater', 'comedy', 'conference', 'other'],
    default: 'other',
  },
  totalTickets: {
    type: Number,
    required: true,
    min: 1,
  },
  availableTickets: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
  },
}, {
  timestamps: true,
});

// Index for search
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);
