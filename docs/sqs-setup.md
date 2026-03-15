# Amazon SQS Setup for Booking Confirmation

This document describes how to set up Amazon SQS for the event-ticket-booking-system so that payment completion triggers **asynchronous** booking confirmation (payment-service publishes to a queue, booking-service consumes and confirms).

## 1. Create the SQS Queue

1. In the **AWS Console**, go to **SQS** in the same region as your ECS stack (e.g. `us-east-1`).
2. Click **Create queue**.
3. **Type**: Standard (unless you need strict FIFO ordering).
4. **Name**: e.g. `booking-confirmation-queue`.
5. Leave other settings as default (or set **Visibility timeout** to 60 seconds to allow retries).
6. Create the queue and note the **Queue URL** (e.g. `https://sqs.us-east-1.amazonaws.com/123456789012/booking-confirmation-queue`).

## 2. Environment Variables

Set these in your ECS task definitions (or `.env` for local development) for the services that use SQS.

| Variable        | Service(s)        | Description |
|----------------|-------------------|-------------|
| `AWS_REGION`   | payment-service, booking-service | AWS region (e.g. `us-east-1`). |
| `SQS_QUEUE_URL`| payment-service, booking-service | Full URL of the SQS queue (e.g. `https://sqs.us-east-1.amazonaws.com/123456789012/booking-confirmation-queue`). |

**Local development:** Create the queue in a dev AWS account (or use LocalStack) and set `SQS_QUEUE_URL` and AWS credentials (e.g. `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) in each service’s `.env`. If `SQS_QUEUE_URL` is not set, payment-service skips sending to SQS and booking-service runs without the SQS consumer.

## 3. IAM Permissions

The ECS task roles (or the IAM credentials used by payment-service and booking-service) need the following permissions on the queue.

**Payment service** (publisher) — attach a policy that allows:

- `sqs:SendMessage` on the queue (by queue ARN or resource `*` scoped to the queue).

**Booking service** (consumer) — attach a policy that allows:

- `sqs:ReceiveMessage`
- `sqs:DeleteMessage`
- `sqs:GetQueueAttributes`
- `sqs:ChangeMessageVisibility`

**Example IAM policy** (replace `ACCOUNT_ID` and `booking-confirmation-queue` with your queue name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage"
      ],
      "Resource": "arn:aws:sqs:us-east-1:ACCOUNT_ID:booking-confirmation-queue"
    }
  ]
}
```

For the **booking-service** task role, use the same `Resource` but with actions: `sqs:ReceiveMessage`, `sqs:DeleteMessage`, `sqs:GetQueueAttributes`, `sqs:ChangeMessageVisibility`.

## 4. Flow Summary

- **Payment service:** After a successful payment, it sends a message to the queue with body `{ bookingId, paymentId, userId }`. It does **not** call the booking-service HTTP API for confirmation.
- **Booking service:** A long-polling consumer runs in the same process. It receives messages from the queue, calls the internal `confirmBookingById(bookingId)` logic, and deletes the message on success. On failure, the message is not deleted and becomes visible again after the visibility timeout for retry.

## 5. ECS Task Definitions

Ensure the task definitions for **payment-service** and **booking-service** include:

- Environment: `AWS_REGION`, `SQS_QUEUE_URL`.
- Task role (or execution role) with the SQS permissions above.

No CI/CD workflow changes are required unless you want to inject `SQS_QUEUE_URL` from AWS (e.g. output of a CloudFormation stack) into the task definition at deploy time.
