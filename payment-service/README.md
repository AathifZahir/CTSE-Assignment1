# Payment Service

Microservice for payment processing and transaction management.

## Features

- Payment processing (simulated)
- Payment status tracking
- Refund processing
- Integration with Booking Service

## Endpoints

- `POST /api/payments/process` - Process payment (internal)
- `GET /api/payments/:paymentId` - Get payment details
- `GET /api/payments/booking/:bookingId` - Get payment for booking
- `POST /api/payments/:paymentId/refund` - Process refund

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env` file):
```
PORT=3004
MONGODB_URI=mongodb://localhost:27017/payment-service
BOOKING_SERVICE_URL=http://localhost:3003
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

Swagger documentation available at: `http://localhost:3004/api-docs`

## Docker

Build and run with Docker:
```bash
docker build -t payment-service .
docker run -p 3004:3004 --env-file .env payment-service
```

## Payment Processing

This service simulates payment processing. In production, this would integrate with actual payment gateways like Stripe, PayPal, etc.

## Inter-Service Communication

This service communicates with:
- **Booking Service**: Confirms booking after successful payment
