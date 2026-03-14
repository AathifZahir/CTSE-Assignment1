# Booking Service

Microservice for ticket booking and reservation management. This service orchestrates communication between User, Event, and Payment services.

## Features

- Ticket booking creation
- Booking history management
- Booking cancellation
- Integration with User, Event, and Payment services

## Endpoints

- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:bookingId` - Get booking details
- `GET /api/bookings/user/:userId` - Get user's booking history
- `PUT /api/bookings/:bookingId/cancel` - Cancel booking
- `POST /api/bookings/:bookingId/confirm` - Confirm booking (internal)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env` file):
```
PORT=3003
MONGODB_URI=mongodb://localhost:27017/booking-service
USER_SERVICE_URL=http://localhost:3001
EVENT_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3004
SERVICE_TOKEN=your-service-token
NODE_ENV=development
```

3. Run the service:
```bash
npm start
# or for development
npm run dev
```

## API Documentation

Swagger documentation available at: `http://localhost:3003/api-docs`

## Docker

Build and run with Docker:
```bash
docker build -t booking-service .
docker run -p 3003:3003 --env-file .env booking-service
```

## Inter-Service Communication

This service communicates with:
- **User Service**: Validates users and fetches user details
- **Event Service**: Checks availability and reserves/releases tickets
- **Payment Service**: Initiates payment processing
