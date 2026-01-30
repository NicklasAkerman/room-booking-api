function validateTimeRange(startTime, endTime) {
  if (!startTime || !endTime) {
    return { valid: false, error: 'startTime and endTime are required' };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid time format. Use ISO 8601 format' };
  }

  if (start >= end) {
    return { valid: false, error: 'startTime must be less than endTime' };
  }

  return { valid: true };
}

function validateFutureTime(startTime) {
  const now = new Date();
  const start = new Date(startTime);

  if (start <= now) {
    return { valid: false, error: 'startTime must be in the future' };
  }

  return { valid: true };
}

function checkOverlap(roomId, startTime, endTime, excludeBookingId = null) {
  const { getBookingsByRoom } = require('./database');
  const existingBookings = getBookingsByRoom(roomId);

  const newStart = new Date(startTime);
  const newEnd = new Date(endTime);

  for (const booking of existingBookings) {
    if (excludeBookingId && booking.id === excludeBookingId) {
      continue;
    }

    const existingStart = new Date(booking.startTime);
    const existingEnd = new Date(booking.endTime);

    if (newStart < existingEnd && newEnd > existingStart) {
      return { valid: false, error: 'Booking overlaps with an existing booking' };
    }
  }

  return { valid: true };
}

function validateRoomExists(roomId) {
  const { getRoomById } = require('./database');
  const room = getRoomById(roomId);

  if (!room) {
    return { valid: false, error: 'Room not found' };
  }

  return { valid: true };
}

function validateBookingExists(bookingId) {
  const { getBookingById } = require('./database');
  const booking = getBookingById(bookingId);

  if (!booking) {
    return { valid: false, error: 'Booking not found' };
  }

  return { valid: true };
}

function validateBookingData(bookingData, excludeBookingId = null) {
  const { roomId, startTime, endTime, userId } = bookingData;

  if (!roomId) {
    return { valid: false, error: 'roomId is required' };
  }

  if (!startTime || !endTime) {
    return { valid: false, error: 'startTime and endTime are required' };
  }

  const roomValidation = validateRoomExists(roomId);
  if (!roomValidation.valid) {
    return roomValidation;
  }

  const timeRangeValidation = validateTimeRange(startTime, endTime);
  if (!timeRangeValidation.valid) {
    return timeRangeValidation;
  }

  const futureTimeValidation = validateFutureTime(startTime);
  if (!futureTimeValidation.valid) {
    return futureTimeValidation;
  }

  const overlapValidation = checkOverlap(roomId, startTime, endTime, excludeBookingId);
  if (!overlapValidation.valid) {
    return overlapValidation;
  }

  return { valid: true };
}

module.exports = {
  validateTimeRange,
  validateFutureTime,
  checkOverlap,
  validateRoomExists,
  validateBookingExists,
  validateBookingData
};
