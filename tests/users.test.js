const request = require('supertest');
const app = require('../src/server');
const { clearBookings } = require('../src/database');

describe('Users API', () => {
  beforeEach(() => {
    clearBookings();
  });

  describe('GET /api/users/:userId/bookings', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room1',
          startTime: '2030-01-01T10:00:00.000Z',
          endTime: '2030-01-01T12:00:00.000Z'
        });

      await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room2',
          startTime: '2030-01-02T10:00:00.000Z',
          endTime: '2030-01-02T12:00:00.000Z'
        });

      await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user2')
        .send({
          roomId: 'room3',
          startTime: '2030-01-03T10:00:00.000Z',
          endTime: '2030-01-03T12:00:00.000Z'
        });
    });

    it('should list bookings for existing user', async () => {
      const response = await request(app)
        .get('/api/users/user1/bookings');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.every(b => b.userId === 'user1')).toBe(true);
    });

    it('should list bookings for non-existent user (returns empty array)', async () => {
      const response = await request(app)
        .get('/api/users/nonexistent/bookings');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return bookings sorted by startTime ascending', async () => {
      const response = await request(app)
        .get('/api/users/user1/bookings');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(new Date(response.body[0].startTime).getTime()).toBeLessThan(new Date(response.body[1].startTime).getTime());
    });
  });
});
