const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');
const userService = require('../services/userService');
const eventService = require('../services/eventService');
const paymentService = require('../services/paymentService');
const axios = require('axios');

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'your-service-token';

// Create new booking
exports.createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, eventId, quantity } = req.body;

    // Validate user
    try {
      await userService.validateUser(userId);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }

    // Get event details and check availability
    let event;
    try {
      event = await eventService.getEventDetails(eventId);
      const availability = await eventService.checkAvailability(eventId, quantity);
      
      if (!availability.canBook) {
        return res.status(400).json({
          message: 'Insufficient tickets available',
          available: availability.availableTickets,
        });
      }
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }

    // Calculate total amount
    const totalAmount = event.price * quantity;

    // Reserve tickets
    try {
      await eventService.reserveTickets(eventId, quantity);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Create booking
    const booking = new Booking({
      userId,
      eventId,
      quantity,
      totalAmount,
      status: 'pending',
    });

    await booking.save();

    // Initiate payment
    try {
      const payment = await paymentService.processPayment(
        booking._id.toString(),
        totalAmount,
        userId
      );

      booking.paymentId = payment.paymentId;
      booking.status = payment.status === 'success' ? 'confirmed' : 'pending';
      await booking.save();

      res.status(201).json({
        message: 'Booking created successfully',
        booking: {
          id: booking._id,
          userId: booking.userId,
          eventId: booking.eventId,
          quantity: booking.quantity,
          totalAmount: booking.totalAmount,
          status: booking.status,
          paymentId: booking.paymentId,
        },
      });
    } catch (error) {
      // If payment fails, release tickets
      await eventService.releaseTickets(eventId, quantity);
      booking.status = 'cancelled';
      await booking.save();

      return res.status(400).json({
        message: 'Booking created but payment failed. Tickets released.',
        bookingId: booking._id,
        error: error.message,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// Get user's booking history
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .sort({ bookingDate: -1 });

    res.json({
      userId: req.params.userId,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    // Release tickets
    try {
      await eventService.releaseTickets(booking.eventId, booking.quantity);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to release tickets' });
    }

    booking.status = 'cancelled';
    booking.cancellationDate = new Date();
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Confirm booking (called by Payment Service)
exports.confirmBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.json({
      message: 'Booking confirmed successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
};
