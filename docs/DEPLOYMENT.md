# Deployment Guide

## Prerequisites

1. AWS Account with Free Tier access
2. MongoDB Atlas account (free tier)
3. GitHub repository
4. AWS CLI configured
5. Docker installed locally (for testing)

## Step 1: MongoDB Atlas Setup

1. Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create 4 separate clusters (one for each service) or use shared cluster with separate databases
3. Configure IP whitelist (allow 0.0.0.0/0 for ECS or specific ECS IPs)
4. Create database users for each service
5. Get connection strings for each service

## Step 2: AWS Infrastructure Setup

### Create ECR Repositories

```bash
aws ecr create-repository --repository-name user-service --region us-east-1
aws ecr create-repository --repository-name event-service --region us-east-1
aws ecr create-repository --repository-name booking-service --region us-east-1
aws ecr create-repository --repository-name payment-service --region us-east-1
```

### Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name event-booking-cluster --region us-east-1
```

### Create VPC and Security Groups

1. Create VPC with public subnets
2. Create security groups:
   - Allow inbound HTTP/HTTPS from API Gateway
   - Allow outbound to MongoDB Atlas
   - Allow inter-service communication on service ports

### Create ECS Task Definitions

Create task definitions for each service with:
- Container image from ECR
- Environment variables (MongoDB URI, service URLs, JWT secret, service token)
- IAM role with minimal permissions
- Port mappings
- Health checks

### Create ECS Services

```bash
aws ecs create-service \
  --cluster event-booking-cluster \
  --service-name user-service \
  --task-definition user-service-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

Repeat for event-service, booking-service, and payment-service.

### Create API Gateway

1. Create REST API in API Gateway
2. Create resources for each service:
   - `/users/*` → User Service
   - `/events/*` → Event Service
   - `/bookings/*` → Booking Service
   - `/payments/*` → Payment Service
3. Deploy API to a stage (e.g., `prod`)

## Step 3: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Step 4: Environment Variables

Configure environment variables in ECS task definitions:

### User Service
```
PORT=3001
MONGODB_URI=<user-service-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
SERVICE_TOKEN=<your-service-token>
NODE_ENV=production
```

### Event Service
```
PORT=3002
MONGODB_URI=<event-service-mongodb-uri>
SERVICE_TOKEN=<your-service-token>
NODE_ENV=production
```

### Booking Service
```
PORT=3003
MONGODB_URI=<booking-service-mongodb-uri>
USER_SERVICE_URL=<user-service-url>
EVENT_SERVICE_URL=<event-service-url>
PAYMENT_SERVICE_URL=<payment-service-url>
SERVICE_TOKEN=<your-service-token>
NODE_ENV=production
```

### Payment Service
```
PORT=3004
MONGODB_URI=<payment-service-mongodb-uri>
BOOKING_SERVICE_URL=<booking-service-url>
SERVICE_TOKEN=<your-service-token>
NODE_ENV=production
```

## Step 5: Deploy

1. Push code to GitHub
2. GitHub Actions will automatically:
   - Build Docker images
   - Push to ECR
   - Deploy to ECS

## Step 6: Verify Deployment

1. Check ECS services are running
2. Test health endpoints:
   - `http://<user-service-url>/health`
   - `http://<event-service-url>/health`
   - `http://<booking-service-url>/health`
   - `http://<payment-service-url>/health`
3. Test API Gateway endpoint
4. Test end-to-end booking flow

## Troubleshooting

- Check CloudWatch logs for each service
- Verify security groups allow traffic
- Check MongoDB Atlas IP whitelist
- Verify environment variables are set correctly
- Check ECS task status and health checks
