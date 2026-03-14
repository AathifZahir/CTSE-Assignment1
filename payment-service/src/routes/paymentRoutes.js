const express = require('express');
const { body } = require('express-validator');
const {
  processPayment,
  getPaymentById,
  getPaymentByBookingId,
  processRefund,
} = require('../controllers/paymentController');
const { verifyServiceToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/payments/process:
 *   post:
 *     summary: Process payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - amount
 *               - userId
 *             properties:
 *               bookingId:
 *                 type: string
 *               amount:
 *                 type: number
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Payment processing failed
 */
router.post(
  '/process',
  verifyServiceToken,
  [
    body('bookingId').notEmpty(),
    body('amount').isFloat({ min: 0 }),
    body('userId').notEmpty(),
  ],
  processPayment
);

/**
 * @swagger
 * /api/payments/{paymentId}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
router.get('/:paymentId', getPaymentById);

/**
 * @swagger
 * /api/payments/booking/{bookingId}:
 *   get:
 *     summary: Get payment for booking
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
router.get('/booking/:bookingId', getPaymentByBookingId);

/**
 * @swagger
 * /api/payments/{paymentId}/refund:
 *   post:
 *     summary: Process refund
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refundAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Refund processed successfully
 */
router.post(
  '/:paymentId/refund',
  [
    body('refundAmount').optional().isFloat({ min: 0 }),
  ],
  processRefund
);

module.exports = router;
