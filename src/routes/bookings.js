const express = require('express');
const { validateBookingData } = require('../validation');
const { createBooking, getBookingById, updateBooking, deleteBooking, getBookings } = require('../database');
const { authenticate, checkBookingOwnership } = require('../auth');

const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Create a new room booking with the specified time range
 *     security:
 *       - xUserId: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *           example:
 *             roomId: room1
 *             startTime: 2030-01-01T10:00:00.000Z
 *             endTime: 2030-01-01T12:00:00.000Z
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *             example:
 *               id: 550e8400-e29b-41d4-a716-446655440000
 *               roomId: room1
 *               userId: user1
 *               startTime: 2030-01-01T10:00:00.000Z
 *               endTime: 2030-01-01T12:00:00.000Z
 *               createdAt: 2026-01-01T10:00:00.000Z
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               pastTime:
 *                 value:
 *                   error: startTime must be in the future
 *               invalidRange:
 *                 value:
 *                   error: startTime must be less than endTime
 *               overlap:
 *                 value:
 *                   error: Booking overlaps with an existing booking
 *               roomNotFound:
 *                 value:
 *                   error: Room not found
 *       401:
 *         description: Unauthorized - missing x-user-id header
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Missing x-user-id header
 */
router.post('/bookings', authenticate, (req, res) => {
  const { roomId, startTime, endTime } = req.body;

  const bookingData = {
    roomId,
    startTime,
    endTime,
    userId: req.userId
  };

  const validation = validateBookingData(bookingData);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const newBooking = createBooking(bookingData);
  res.status(201).json(newBooking);
});

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: List all bookings
 *     description: Get all bookings in the system (All users only)
 *     security:
 *       - xUserId: []
 *     responses:
 *       200:
 *         description: List of all bookings
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
  *               - id: 550e8400-e29b-41d4-a716-446655440001
  *                 roomId: room2
  *                 userId: user2
  *                 startTime: 2030-01-01T14:00:00.000Z
  *                 endTime: 2030-01-01T16:00:00.000Z
  *                 createdAt: 2026-01-01T10:00:00.000Z
  */
router.get('/bookings', (req, res) => {
  const bookings = getBookings();
  res.status(200).json(bookings);
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Update a booking
 *     description: Update an existing booking (only owner or superuser)
 *     security:
 *       - xUserId: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookingRequest'
 *           example:
 *             startTime: 2030-01-01T14:00:00.000Z
 *             endTime: 2030-01-01T16:00:00.000Z
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *             example:
 *               id: 550e8400-e29b-41d4-a716-446655440000
 *               roomId: room1
 *               userId: user1
 *               startTime: 2030-01-01T14:00:00.000Z
 *               endTime: 2030-01-01T16:00:00.000Z
 *               createdAt: 2026-01-01T10:00:00.000Z
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Booking overlaps with an existing booking
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Missing x-user-id header
 *       403:
 *         description: Forbidden - not owner or superuser
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Not allowed to modify this booking
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Booking not found
 */
router.put('/bookings/:id', authenticate, checkBookingOwnership, (req, res) => {
  const { id } = req.params;
  const { roomId, startTime, endTime } = req.body;

  const booking = getBookingById(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const updateData = {};
  if (roomId) updateData.roomId = roomId;
  if (startTime) updateData.startTime = startTime;
  if (endTime) updateData.endTime = endTime;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'At least one field (roomId, startTime, endTime) must be provided' });
  }

  const validation = validateBookingData(
    {
      roomId: roomId || booking.roomId,
      startTime: startTime || booking.startTime,
      endTime: endTime || booking.endTime,
      userId: booking.userId
    },
    id
  );

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const updatedBooking = updateBooking(id, updateData);
  res.json(updatedBooking);
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     description: Cancel an existing booking (only owner or superuser)
 *     security:
 *       - xUserId: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       204:
 *         description: Booking deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Missing x-user-id header
 *       403:
 *         description: Forbidden - not owner or superuser
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Not allowed to modify this booking
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Booking not found
 */
router.delete('/bookings/:id', authenticate, checkBookingOwnership, (req, res) => {
  const { id } = req.params;

  const deleted = deleteBooking(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.status(204).send();
});

module.exports = router;
