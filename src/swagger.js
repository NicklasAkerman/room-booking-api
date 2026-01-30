const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Meeting Room Booking API',
      version: '1.0.0',
      description: 'MVP Meeting Room Booking REST API for managing room reservations',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        xUserId: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-id',
          description: 'User ID for authentication. Use "superuser" for admin access.',
        },
      },
      schemas: {
        Room: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'room1' },
            name: { type: 'string', example: 'Conference Room A' },
            capacity: { type: 'number', example: 10 },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            roomId: { type: 'string', example: 'room1' },
            userId: { type: 'string', example: 'user1' },
            startTime: { type: 'string', format: 'date-time', example: '2030-01-01T10:00:00.000Z' },
            endTime: { type: 'string', format: 'date-time', example: '2030-01-01T12:00:00.000Z' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-01-01T10:00:00.000Z' },
          },
        },
        CreateBookingRequest: {
          type: 'object',
          required: ['roomId', 'startTime', 'endTime'],
          properties: {
            roomId: { type: 'string', example: 'room1' },
            startTime: { type: 'string', format: 'date-time', example: '2030-01-01T10:00:00.000Z' },
            endTime: { type: 'string', format: 'date-time', example: '2030-01-01T12:00:00.000Z' },
          },
        },
        UpdateBookingRequest: {
          type: 'object',
          properties: {
            roomId: { type: 'string', example: 'room2' },
            startTime: { type: 'string', format: 'date-time', example: '2030-01-01T14:00:00.000Z' },
            endTime: { type: 'string', format: 'date-time', example: '2030-01-01T16:00:00.000Z' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Room not found' },
          },
        },
      },
    },
    security: [
      {
        xUserId: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/server.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
