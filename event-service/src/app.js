const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const eventRoutes = require('./routes/eventRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 3002;
const BASE_PATH = '/events';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Service API',
      version: '1.0.0',
      description: 'API documentation for Event Service',
    },
    servers: [
      {
        url: BASE_PATH,
        description: 'ALB routed path',
      },
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Swagger UI
app.use(`${BASE_PATH}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use(`${BASE_PATH}/api/events`, eventRoutes);

// Health check
app.get(`${BASE_PATH}/health`, (req, res) => {
  res.status(200).json({ status: 'OK', service: 'event-service' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'event-service' });
});

// Error handling
app.use(errorHandler);

// Log service configuration on startup
console.log('========================================');
console.log('EVENT SERVICE STARTING');
console.log('========================================');
console.log(`Port: ${PORT}`);
console.log(`Base Path: ${BASE_PATH}`);
console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
console.log('========================================');

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Event Service running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}${BASE_PATH}/api-docs`);
      console.log(`Health Check: http://localhost:${PORT}${BASE_PATH}/health`);
      console.log('========================================');
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;