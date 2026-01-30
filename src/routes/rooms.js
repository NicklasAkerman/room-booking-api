const express = require('express');
const { getRooms, getRoomById, getBookingsByRoom } = require('../database');

const router = express.Router();

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: List all meeting rooms
 *     description: Get a list of all available meeting rooms with their details
 *     responses:
 *       200:
 *         description: List of rooms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *             example:
 *               - id: room1
 *                 name: Conference Room A
 *                 capacity: 10
 *               - id: room2
 *                 name: Conference Room B
 *                 capacity: 8
 *               - id: room3
 *                 name: Meeting Room 1
 *                 capacity: 6
 *               - id: room4
 *                 name: Meeting Room 2
 *                 capacity: 4
 *               - id: room5
 *                 name: Board Room
 *                 capacity: 12
 */
router.get('/rooms', (req, res) => {
  res.json(getRooms());
});

/**
 * @swagger
 * /api/rooms/{roomId}/bookings:
 *   get:
 *     summary: List bookings for a specific room
 *     description: Get all future bookings for a specific room (sorted by start time)
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         example: room1
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully
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
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Room not found
 */
router.get('/rooms/:roomId/bookings', (req, res) => {
  const { roomId } = req.params;

  const room = getRoomById(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const bookings = getBookingsByRoom(roomId);
  res.json(bookings);
});

module.exports = router;
