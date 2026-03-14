# Event Service

Microservice for event management and ticket availability.

## Features

- Event CRUD operations
- Event search and filtering
- Ticket availability checking
- Ticket reservation and release
- Event categorization

## Endpoints

- `GET /api/events` - List all events (with filters)
- `GET /api/events/:eventId` - Get event details
- `POST /api/events` - Create new event
- `PUT /api/events/:eventId` - Update event
- `GET /api/events/:eventId/availability` - Check ticket availability
- `GET /api/events/search?q=query` - Search events
- `POST /api/events/:eventId/reserve` - Reserve tickets (internal)
- `POST /api/events/:eventId/release` - Release tickets (internal)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env` file):
```
PORT=3002
MONGODB_URI=mongodb://localhost:27017/event-service
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

Swagger documentation available at: `http://localhost:3002/api-docs`

## Docker

Build and run with Docker:
```bash
docker build -t event-service .
docker run -p 3002:3002 --env-file .env event-service
```
