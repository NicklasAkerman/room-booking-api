const SUPERUSER_ID = 'superuser';

function extractUserId(req) {
  return req.headers['x-user-id'];
}

function isSuperUser(userId) {
  return userId === SUPERUSER_ID;
}

function authenticate(req, res, next) {
  const userId = extractUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Missing x-user-id header' });
  }

  req.userId = userId;
  next();
}

function checkBookingOwnership(req, res, next) {
  const { id } = req.params;
  const { getBookingById } = require('./database');
  const booking = getBookingById(id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (!isSuperUser(req.userId) && booking.userId !== req.userId) {
    return res.status(403).json({ error: 'Not allowed to modify this booking' });
  }

  next();
}


module.exports = {
  authenticate,
  checkBookingOwnership,
  isSuperUser,
  extractUserId
};
