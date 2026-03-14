const express = require('express');
const { body, query } = require('express-validator');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  checkAvailability,
  reserveTickets,
  releaseTickets,
  searchEvents,
} = require('../controllers/eventController');
const { verifyServiceToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events with filters
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/', getAllEvents);

/**
 * @swagger
 * /api/events/{eventId}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get('/:eventId', getEventById);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - organizerId
 *               - venue
 *               - date
 *               - time
 *               - totalTickets
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               organizerId:
 *                 type: string
 *               venue:
 *                 type: object
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               totalTickets:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post(
  '/',
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('organizerId').notEmpty(),
    body('venue.name').trim().notEmpty(),
    body('venue.address').trim().notEmpty(),
    body('venue.city').trim().notEmpty(),
    body('date').isISO8601(),
    body('time').notEmpty(),
    body('totalTickets').isInt({ min: 1 }),
    body('price').isFloat({ min: 0 }),
  ],
  createEvent
);

/**
 * @swagger
 * /api/events/{eventId}:
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 */
router.put(
  '/:eventId',
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('date').optional().isISO8601(),
    body('totalTickets').optional().isInt({ min: 1 }),
    body('price').optional().isFloat({ min: 0 }),
  ],
  updateEvent
);

/**
 * @swagger
 * /api/events/{eventId}/availability:
 *   get:
 *     summary: Check ticket availability
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Availability status
 */
router.get('/:eventId/availability', checkAvailability);

/**
 * @swagger
 * /api/events/{eventId}/reserve:
 *   post:
 *     summary: Reserve tickets (internal service call)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tickets reserved
 */
router.post('/:eventId/reserve', verifyServiceToken, reserveTickets);

/**
 * @swagger
 * /api/events/{eventId}/release:
 *   post:
 *     summary: Release tickets (internal service call)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tickets released
 */
router.post('/:eventId/release', verifyServiceToken, releaseTickets);

/**
 * @swagger
 * /api/events/search:
 *   get:
 *     summary: Search events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchEvents);

module.exports = router;
