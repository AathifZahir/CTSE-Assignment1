# API Contracts

This directory contains API documentation for all microservices.

## Accessing API Documentation

Each microservice provides Swagger/OpenAPI documentation at:
- User Service: `http://localhost:3001/api-docs`
- Event Service: `http://localhost:3002/api-docs`
- Booking Service: `http://localhost:3003/api-docs`
- Payment Service: `http://localhost:3004/api-docs`

## Service Endpoints

### User Service (Port 3001)

**Base URL**: `http://localhost:3001/api/users`

- `POST /register` - Register new user
- `POST /login` - User login
- `GET /:userId` - Get user profile
- `PUT /:userId` - Update user profile
- `GET /:userId/preferences` - Get user preferences

### Event Service (Port 3002)

**Base URL**: `http://localhost:3002/api/events`

- `GET /` - List all events (with filters)
- `GET /:eventId` - Get event details
- `POST /` - Create new event
- `PUT /:eventId` - Update event
- `GET /:eventId/availability` - Check ticket availability
- `GET /search?q=query` - Search events
- `POST /:eventId/reserve` - Reserve tickets (internal)
- `POST /:eventId/release` - Release tickets (internal)

### Booking Service (Port 3003)

**Base URL**: `http://localhost:3003/api/bookings`

- `POST /` - Create new booking
- `GET /:bookingId` - Get booking details
- `GET /user/:userId` - Get user's booking history
- `PUT /:bookingId/cancel` - Cancel booking
- `POST /:bookingId/confirm` - Confirm booking (internal)

### Payment Service (Port 3004)

**Base URL**: `http://localhost:3004/api/payments`

- `POST /process` - Process payment (internal)
- `GET /:paymentId` - Get payment details
- `GET /booking/:bookingId` - Get payment for booking
- `POST /:paymentId/refund` - Process refund

## Authentication

### User Authentication
- JWT tokens issued on login
- Include in header: `Authorization: Bearer <token>`

### Service-to-Service Authentication
- Service token required for internal endpoints
- Include in header: `x-service-token: <service-token>`

## Example Requests

### Register User
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Create Booking
```bash
curl -X POST http://localhost:3003/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "userId": "user-id",
    "eventId": "event-id",
    "quantity": 2
  }'
```
