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
    const eventId = req.params.eventId;
    const serviceToken = req.headers['x-service-token'];
    
    if (serviceToken) {
      console.log(`[EVENT-SERVICE] Service request for event details: ${eventId}`);
    }
    
    const event = await Event.findById(eventId);
    if (!event) {
      if (serviceToken) {
        console.log(`[EVENT-SERVICE] Event not found: ${eventId}`);
      }
      return res.status(404).json({ message: 'Event not found' });
    }

    if (serviceToken) {
      console.log(`[EVENT-SERVICE] Event details retrieved: ${eventId}`);
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
    
    console.log(`[EVENT-SERVICE] 📥 Availability check request: eventId=${eventId}, quantity=${quantity}`);

    const event = await Event.findById(eventId);
    if (!event) {
      console.log(`[EVENT-SERVICE] ❌ Event not found: ${eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }

    const available = event.availableTickets >= parseInt(quantity);
    console.log(`[EVENT-SERVICE] ✅ Availability check: available=${event.availableTickets}, requested=${quantity}, canBook=${available}`);

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
    
    console.log(`[EVENT-SERVICE] 📥 Ticket reservation request: eventId=${eventId}, quantity=${quantity}`);

    const event = await Event.findById(eventId);
    if (!event) {
      console.log(`[EVENT-SERVICE] ❌ Event not found: ${eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableTickets < quantity) {
      console.log(`[EVENT-SERVICE] ❌ Insufficient tickets: available=${event.availableTickets}, requested=${quantity}`);
      return res.status(400).json({
        message: 'Insufficient tickets available',
        available: event.availableTickets,
        requested: quantity,
      });
    }

    const previousAvailable = event.availableTickets;
    event.availableTickets -= quantity;
    await event.save();

    console.log(`[EVENT-SERVICE] ✅ Tickets reserved: ${quantity} tickets for event ${eventId}`);
    console.log(`[EVENT-SERVICE] 📊 Availability: ${previousAvailable} → ${event.availableTickets} (remaining)`);

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
    
    console.log(`[EVENT-SERVICE] 📥 Ticket release request: eventId=${eventId}, quantity=${quantity}`);

    const event = await Event.findById(eventId);
    if (!event) {
      console.log(`[EVENT-SERVICE] ❌ Event not found: ${eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }

    const previousAvailable = event.availableTickets;
    event.availableTickets += quantity;
    await event.save();

    console.log(`[EVENT-SERVICE] ✅ Tickets released: ${quantity} tickets for event ${eventId}`);
    console.log(`[EVENT-SERVICE] 📊 Availability: ${previousAvailable} → ${event.availableTickets} (now available)`);

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
