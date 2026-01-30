const request = require('supertest');
const app = require('../src/server');
const { clearBookings } = require('../src/database');

describe('Booking API', () => {
  beforeEach(() => {
    clearBookings();
  });

  describe('GET /api/bookings', () => {
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
          roomId: 'room2',
          startTime: '2030-01-01T14:00:00.000Z',
          endTime: '2030-01-01T16:00:00.000Z'
        });
    });

    it('should return all bookings', async () => {
      const response = await request(app).get('/api/bookings');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when no bookings exist', async () => {
      clearBookings();
      const response = await request(app).get('/api/bookings');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a booking successfully', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room1',
          startTime: '2030-01-01T10:00:00.000Z',
          endTime: '2030-01-01T12:00:00.000Z'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.roomId).toBe('room1');
      expect(response.body.userId).toBe('user1');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should reject booking in the past', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room1',
          startTime: '2020-01-01T10:00:00.000Z',
          endTime: '2020-01-01T12:00:00.000Z'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('future');
    });

    it('should reject invalid time range', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room1',
          startTime: '2030-01-01T12:00:00.000Z',
          endTime: '2030-01-01T10:00:00.000Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('startTime must be less than endTime');
    });

    it('should reject overlapping booking', async () => {
      await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room1',
          startTime: '2030-01-01T10:00:00.000Z',
          endTime: '2030-01-01T12:00:00.000Z'
        });

      const response = await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user2')
        .send({
          roomId: 'room1',
          startTime: '2030-01-01T11:00:00.000Z',
          endTime: '2030-01-01T13:00:00.000Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('overlap');
    });

    it('should reject booking for non-existent room', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room999',
          startTime: '2030-01-01T10:00:00.000Z',
          endTime: '2030-01-01T12:00:00.000Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Room not found');
    });

    it('should reject request with missing userId header', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          roomId: 'room1',
          startTime: '2030-01-01T10:00:00.000Z',
          endTime: '2030-01-01T12:00:00.000Z'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('x-user-id');
    });

    it('should allow back-to-back bookings', async () => {
      await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room1',
          startTime: '2030-01-01T10:00:00.000Z',
          endTime: '2030-01-01T12:00:00.000Z'
        });

      const response = await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user2')
        .send({
          roomId: 'room1',
          startTime: '2030-01-01T12:00:00.000Z',
          endTime: '2030-01-01T14:00:00.000Z'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('PUT /api/bookings/:id', () => {
    let bookingId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room1',
          startTime: '2030-01-01T10:00:00.000Z',
          endTime: '2030-01-01T12:00:00.000Z'
        });
      bookingId = response.body.id;
    });

    it('should allow owner to update their own booking', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('x-user-id', 'user1')
        .send({
          startTime: '2030-01-01T14:00:00.000Z',
          endTime: '2030-01-01T16:00:00.000Z'
        });

      expect(response.status).toBe(200);
      expect(response.body.startTime).toBe('2030-01-01T14:00:00.000Z');
    });

    it('should allow SuperUser to update any booking', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('x-user-id', 'superuser')
        .send({
          startTime: '2030-01-01T14:00:00.000Z',
          endTime: '2030-01-01T16:00:00.000Z'
        });

      expect(response.status).toBe(200);
    });

    it('should reject normal user updating someone else\'s booking', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('x-user-id', 'user2')
        .send({
          startTime: '2030-01-01T14:00:00.000Z',
          endTime: '2030-01-01T16:00:00.000Z'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Not allowed');
    });

    it('should reject request with missing userId header', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .send({
          startTime: '2030-01-01T14:00:00.000Z',
          endTime: '2030-01-01T16:00:00.000Z'
        });

      expect(response.status).toBe(401);
    });

    it('should reject update to non-existent booking', async () => {
      const response = await request(app)
        .put('/api/bookings/non-existent-id')
        .set('x-user-id', 'user1')
        .send({
          startTime: '2030-01-01T14:00:00.000Z',
          endTime: '2030-01-01T16:00:00.000Z'
        });

      expect(response.status).toBe(404);
    });

    it('should reject update that causes overlap', async () => {
      await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user2')
        .send({
          roomId: 'room1',
          startTime: '2030-01-01T12:00:00.000Z',
          endTime: '2030-01-01T14:00:00.000Z'
        });

      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('x-user-id', 'user1')
        .send({
          startTime: '2030-01-01T11:00:00.000Z',
          endTime: '2030-01-01T13:00:00.000Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('overlap');
    });

    it('should reject update with past time', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('x-user-id', 'user1')
        .send({
          startTime: '2020-01-01T10:00:00.000Z',
          endTime: '2020-01-01T12:00:00.000Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('future');
    });

    it('should reject update with invalid time range', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('x-user-id', 'user1')
        .send({
          startTime: '2030-01-01T14:00:00.000Z',
          endTime: '2030-01-01T10:00:00.000Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('less than');
    });

    it('should reject update with non-existent room', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room999'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Room not found');
    });

    it('should reject update with no fields', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('x-user-id', 'user1')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    let bookingId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'user1')
        .send({
          roomId: 'room1',
          startTime: '2030-01-01T10:00:00.000Z',
          endTime: '2030-01-01T12:00:00.000Z'
        });
      bookingId = response.body.id;
    });

    it('should reject request with missing userId header', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`);

      expect(response.status).toBe(401);
    });

    it('should reject normal user canceling someone else\'s booking', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('x-user-id', 'user2');

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Not allowed');
    });

    it('should allow SuperUser to cancel any booking', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('x-user-id', 'superuser');

      expect(response.status).toBe(204);
    });

    it('should allow owner to cancel their own booking', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('x-user-id', 'user1');

      expect(response.status).toBe(204);
    });

    it('should reject deletion of non-existent booking', async () => {
      const response = await request(app)
        .delete('/api/bookings/non-existent-id')
        .set('x-user-id', 'user1');

      expect(response.status).toBe(404);
    });
  });
});
