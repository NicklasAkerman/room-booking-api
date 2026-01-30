const request = require('supertest');
const app = require('../src/server');
const { clearBookings } = require('../src/database');

describe('Rooms API', () => {
  beforeEach(() => {
    clearBookings();
  });

  describe('GET /api/rooms', () => {
    it('should list all rooms', async () => {
      const response = await request(app)
        .get('/api/rooms');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(5);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('capacity');
    });
  });

  describe('GET /api/rooms/:roomId/bookings', () => {
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
        .set('x-user-id', 'user2')
        .send({
          roomId: 'room1',
          startTime: '2020-01-01T10:00:00.000Z',
          endTime: '2020-01-01T12:00:00.000Z'
        });
    });

    it('should list bookings for existing room (only future bookings)', async () => {
      const response = await request(app)
        .get('/api/rooms/room1/bookings');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].roomId).toBe('room1');
      expect(response.body[0].startTime).toContain('2030');
    });

    it('should list bookings for non-existent room (returns 404)', async () => {
      const response = await request(app)
        .get('/api/rooms/room999/bookings');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Room not found');
    });

    it('should return bookings sorted by startTime ascending', async () => {
      await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room2',
          startTime: '2030-01-01T14:00:00.000Z',
          endTime: '2030-01-01T16:00:00.000Z'
        });

      await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user2')
        .send({
          roomId: 'room2',
          startTime: '2030-01-01T10:00:00.000Z',
          endTime: '2030-01-01T12:00:00.000Z'
        });

      const response = await request(app)
        .get('/api/rooms/room2/bookings');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(new Date(response.body[0].startTime).getTime()).toBeLessThan(new Date(response.body[1].startTime).getTime());
    });
  });
});
