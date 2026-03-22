# Event Ticket Booking System

Microservices-based event ticket booking platform for **SLIIT CTSE Assignment 1 (2026)**. The system uses Node.js and Express, MongoDB (Atlas) per service, AWS ECS (Fargate) for deployment, and GitHub Actions for CI/CD including static application security testing (SAST) before release.

## Architecture

Four independent services:

1. **User Service** – Authentication and user profiles  
2. **Event Service** – Events, listings, and management  
3. **Booking Service** – Reservations and booking flow  
4. **Payment Service** – Payments and related messaging  

Traffic and data flow at a high level:

```text
Internet
    |
    v
Application Load Balancer (ALB) — only public-facing entry point
    |
    v
ECS tasks (Fargate) — private subnets, no public IP
    |
    +---> MongoDB Atlas (per-service databases)
    +---> Amazon SQS (async booking confirmation flow)
```

### AWS network and access control

ECS tasks run in **private networking** without public IPs, so application containers are not directly reachable from the internet. The **Application Load Balancer** is the sole public component; it terminates external HTTP/HTTPS and forwards to services in the private tier.

**Security groups** are configured for **least privilege**: inbound traffic to the service tasks is allowed **only from the ALB**, not from the open internet. Backend dependencies (MongoDB, SQS) are reached from the private task network according to your VPC and security group rules.

## Technology stack

| Area | Choice |
|------|--------|
| Runtime | Node.js, Express.js |
| Data | MongoDB Atlas (per microservice) |
| Auth | JWT |
| Containers | Docker |
| Orchestration | AWS ECS on Fargate |
| CI/CD | GitHub Actions (per-service workflows) |
| SAST | SonarCloud (scan before build/deploy) |
| APIs | REST; Swagger/OpenAPI where configured |

## Project structure

```text
event-ticket-booking-system/
├── .github/workflows/     # CI/CD: SonarCloud, ECR, ECS deploy per service
├── user-service/
├── event-service/
├── booking-service/
├── payment-service/
├── docs/                  # e.g. SQS setup notes
├── sonar-project.properties
├── docker-compose.yml     # Local development (do not commit real secrets)
└── README.md
```

## CI/CD and DevSecOps (SonarCloud)

Each service workflow runs **SonarCloud analysis first**; **build, push to ECR, and ECS deploy run only if the scan job succeeds**, so SAST is part of the deployment gate.

**GitHub Actions secrets** (repository settings):

- `SONAR_TOKEN` – SonarCloud user token  
- `SONAR_ORGANIZATION` – SonarCloud organization key  
- `SONAR_PROJECT_KEY` – SonarCloud project key for this repository  
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` – AWS credentials used by the pipeline  

Analysis scope is defined in `sonar-project.properties` (all service `src` trees, with standard exclusions such as `node_modules`).

## Getting started

Each microservice can be run and tested locally. See the README inside each service folder for install and run steps. For local multi-service runs, see `docker-compose.yml` (use environment files or placeholders for secrets; never commit production credentials).

## Inter-service communication

- **REST:** Booking Service coordinates with User, Event, and Payment services over HTTP.  
- **Async (SQS):** Payment Service publishes booking confirmation messages to Amazon SQS; Booking Service consumes them to confirm bookings. See [docs/sqs-setup.md](docs/sqs-setup.md) for queue setup, IAM, and environment variables.

## Deployment summary

Images are built in GitHub Actions, pushed to **Amazon ECR**, and deployed to **ECS Fargate** behind the **ALB**, with tasks in private subnets as described above.

## License / academic use

This repository is submitted as coursework for **CTSE Assignment 1 (2026)**.
