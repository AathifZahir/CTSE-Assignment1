const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getBookingById,
  getUserBookings,
  cancelBooking,
  confirmBooking,
} = require('../controllers/bookingController');
const { verifyServiceToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - eventId
 *               - quantity
 *             properties:
 *               userId:
 *                 type: string
 *               eventId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error or insufficient tickets
 */
router.post(
  '/',
  [
    body('userId').notEmpty(),
    body('eventId').notEmpty(),
    body('quantity').isInt({ min: 1 }),
  ],
  createBooking
);

/**
 * @swagger
 * /api/bookings/{bookingId}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Booking not found
 */
router.get('/:bookingId', getBookingById);

/**
 * @swagger
 * /api/bookings/user/{userId}:
 *   get:
 *     summary: Get user's booking history
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User bookings
 */
router.get('/user/:userId', getUserBookings);

/**
 * @swagger
 * /api/bookings/{bookingId}/cancel:
 *   put:
 *     summary: Cancel booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.put('/:bookingId/cancel', cancelBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}/confirm:
 *   post:
 *     summary: Confirm booking (internal service call)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking confirmed
 */
router.post('/:bookingId/confirm', verifyServiceToken, confirmBooking);

module.exports = router;
