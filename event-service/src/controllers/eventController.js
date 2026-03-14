const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// Get all events with filters
exports.getAllEvents = async (req, res, next) => {
  try {
    const {
      category,
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await Event.find(query)
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get event by ID
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Create new event
exports.createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      availableTickets: req.body.totalTickets,
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// Update event
exports.updateEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (key !== 'availableTickets' && key !== '_id') {
        event[key] = req.body[key];
      }
    });

    await event.save();

    res.json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// Check ticket availability
exports.checkAvailability = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { quantity = 1 } = req.query;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const available = event.availableTickets >= parseInt(quantity);

    res.json({
      eventId,
      available,
      availableTickets: event.availableTickets,
      requestedQuantity: parseInt(quantity),
      canBook: available,
    });
  } catch (error) {
    next(error);
  }
};

// Reserve tickets (called by Booking Service)
exports.reserveTickets = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { quantity } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableTickets < quantity) {
      return res.status(400).json({
        message: 'Insufficient tickets available',
        available: event.availableTickets,
        requested: quantity,
      });
    }

    event.availableTickets -= quantity;
    await event.save();

    res.json({
      message: 'Tickets reserved successfully',
      eventId,
      quantity,
      remainingTickets: event.availableTickets,
    });
  } catch (error) {
    next(error);
  }
};

// Release tickets (when booking is cancelled)
exports.releaseTickets = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { quantity } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.availableTickets += quantity;
    await event.save();

    res.json({
      message: 'Tickets released successfully',
      eventId,
      quantity,
      availableTickets: event.availableTickets,
    });
  } catch (error) {
    next(error);
  }
};

// Search events
exports.searchEvents = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const events = await Event.find({
      $text: { $search: q },
      status: 'published',
    })
      .sort({ date: 1 })
      .limit(20)
      .select('-__v');

    res.json({
      query: q,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};
