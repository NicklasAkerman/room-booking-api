const { v4: uuidv4 } = require('uuid');

const rooms = [
  { id: "room1", name: "Conference Room A", capacity: 10 },
  { id: "room2", name: "Conference Room B", capacity: 8 },
  { id: "room3", name: "Meeting Room 1", capacity: 6 },
  { id: "room4", name: "Meeting Room 2", capacity: 4 },
  { id: "room5", name: "Board Room", capacity: 12 },
];

const bookings = [];

function initializeBookings() {
  const now = new Date();
  const year2027 = new Date('2027-01-01T10:00:00.000Z');

  const bookingData = [
    { roomId: "room1", userId: "user1", startTime: new Date('2027-01-01T10:00:00.000Z'), endTime: new Date('2027-01-01T12:00:00.000Z') },
    { roomId: "room2", userId: "user2", startTime: new Date('2027-01-02T10:00:00.000Z'), endTime: new Date('2027-01-02T12:00:00.000Z') },
    { roomId: "room3", userId: "user3", startTime: new Date('2027-01-03T10:00:00.000Z'), endTime: new Date('2027-01-03T12:00:00.000Z') },
    { roomId: "room3", userId: "user1", startTime: new Date('2027-01-04T10:00:00.000Z'), endTime: new Date('2027-01-04T12:00:00.000Z') },
    { roomId: "room4", userId: "user2", startTime: new Date('2027-01-05T10:00:00.000Z'), endTime: new Date('2027-01-05T12:00:00.000Z') },
  ];

  bookingData.forEach(data => {
    bookings.push({
      id: uuidv4(),
      roomId: data.roomId,
      userId: data.userId,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
      createdAt: new Date().toISOString()
    });
  });
}

initializeBookings();

function getRooms() {
  return rooms;
}

function getRoomById(roomId) {
  return rooms.find(room => room.id === roomId);
}

function getBookings() {
  return bookings;
}

function getBookingById(bookingId) {
  return bookings.find(booking => booking.id === bookingId);
}

function getBookingsByRoom(roomId) {
  const now = new Date().toISOString();
  return bookings
    .filter(booking => booking.roomId === roomId && booking.startTime > now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

function getBookingsByUser(userId) {
  return bookings
    .filter(booking => booking.userId === userId)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

function createBooking(bookingData) {
  const newBooking = {
    id: uuidv4(),
    roomId: bookingData.roomId,
    userId: bookingData.userId,
    startTime: bookingData.startTime,
    endTime: bookingData.endTime,
    createdAt: new Date().toISOString()
  };
  bookings.push(newBooking);
  return newBooking;
}

function updateBooking(bookingId, updateData) {
  const booking = getBookingById(bookingId);
  if (!booking) return null;

  if (updateData.startTime) booking.startTime = updateData.startTime;
  if (updateData.endTime) booking.endTime = updateData.endTime;
  if (updateData.roomId) booking.roomId = updateData.roomId;

  return booking;
}

function deleteBooking(bookingId) {
  const index = bookings.findIndex(booking => booking.id === bookingId);
  if (index === -1) return false;
  bookings.splice(index, 1);
  return true;
}

function clearBookings() {
  bookings.length = 0;
}

module.exports = {
  getRooms,
  getRoomById,
  getBookings,
  getBookingById,
  getBookingsByRoom,
  getBookingsByUser,
  createBooking,
  updateBooking,
  deleteBooking,
  clearBookings
};
