const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const bookingRoutes = require('./routes/bookings');
const roomRoutes = require('./routes/rooms');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  const endpoints = `http://localhost:3000/api/bookings
http://localhost:3000/api/rooms
http://localhost:3000/api/rooms/:roomId/bookings
http://localhost:3000/api/users/:userId/bookings`;
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(endpoints);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', bookingRoutes);
app.use('/api', roomRoutes);
app.use('/api', userRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
