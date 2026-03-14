# User Service

Microservice for user authentication and profile management.

## Features

- User registration and authentication
- JWT-based authentication
- User profile management
- User preferences management
- Role-based access (customer, organizer, admin)

## Endpoints

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile
- `GET /api/users/:userId/preferences` - Get user preferences

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env` file):
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/user-service
JWT_SECRET=your-secret-key
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

Swagger documentation available at: `http://localhost:3001/api-docs`

## Docker

Build and run with Docker:
```bash
docker build -t user-service .
docker run -p 3001:3001 --env-file .env user-service
```
