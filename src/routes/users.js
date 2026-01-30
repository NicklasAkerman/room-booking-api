const express = require('express');
const { getBookingsByUser } = require('../database');

const router = express.Router();

/**
 * @swagger
 * /api/users/{userId}/bookings:
 *   get:
 *     summary: List bookings for a specific user
 *     description: Get all bookings for a specific user (sorted by start time, includes past bookings)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: user1
 *     responses:
 *       200:
 *         description: List of user bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *             example:
 *               - id: 550e8400-e29b-41d4-a716-446655440000
 *                 roomId: room1
 *                 userId: user1
 *                 startTime: 2030-01-01T10:00:00.000Z
 *                 endTime: 2030-01-01T12:00:00.000Z
 *                 createdAt: 2026-01-01T10:00:00.000Z
 *               - id: 660e8400-e29b-41d4-a716-446655440001
 *                 roomId: room2
 *                 userId: user1
 *                 startTime: 2030-01-02T10:00:00.000Z
 *                 endTime: 2030-01-02T12:00:00.000Z
 *                 createdAt: 2026-01-01T10:00:00.000Z
 */
router.get('/users/:userId/bookings', (req, res) => {
  const { userId } = req.params;

  const bookings = getBookingsByUser(userId);
  res.json(bookings);
});

module.exports = router;
