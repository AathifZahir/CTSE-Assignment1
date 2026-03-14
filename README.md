# Event Ticket Booking System

A microservices-based event ticket booking platform built with Node.js, Express.js, MongoDB, and deployed on AWS.

## Architecture

This system consists of 4 independent microservices:

1. **User Service** - User authentication, profile management
2. **Event Service** - Event creation, listings, and management
3. **Booking Service** - Ticket booking and reservation management
4. **Payment Service** - Payment processing and transaction management

## Technology Stack

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB (MongoDB Atlas) per service
- **Authentication**: JWT tokens
- **Containerization**: Docker
- **Orchestration**: AWS ECS (Fargate)
- **CI/CD**: GitHub Actions
- **Security Scanning**: SonarCloud (free tier)
- **API Documentation**: Swagger/OpenAPI

## Project Structure

```
event-ticket-booking-system/
├── user-service/          # User authentication and profile management
├── event-service/         # Event management and listings
├── booking-service/       # Ticket booking and reservations
├── payment-service/       # Payment processing
└── docs/                  # Documentation and API contracts
```

## Getting Started

Each microservice is independently deployable. See individual service README files for setup instructions.

## Inter-Service Communication

All services communicate via synchronous REST API calls:
- Booking Service ↔ User Service (user validation)
- Booking Service ↔ Event Service (availability checking)
- Booking Service ↔ Payment Service (payment processing)
- Payment Service → Booking Service (payment confirmation)

## Deployment

Services are containerized with Docker and deployed on AWS ECS Fargate. CI/CD pipelines are configured using GitHub Actions.

## License

This project is part of a university assignment.
