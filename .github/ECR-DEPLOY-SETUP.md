# GitHub Actions: ECR Build, Push & ECS Deploy

This project uses GitHub Actions to build all four microservice images, push them to **Amazon ECR**, and **deploy to ECS** (update task definition and roll out the service) on every push to `main` or `develop`.

## Workflows

| Workflow | File | When it runs |
|----------|------|----------------|
| **ECR Build, Push & ECS Deploy (All Services)** | `.github/workflows/ecr-build-push.yml` | Push to `main` or `develop`; also manually via **Actions → Run workflow** |
| Per-service CI/CD (build + ECS deploy) | `user-service/.github/workflows/ci-cd.yml` etc. | Only when files under that service change (`paths: '<service>/**'`) |

The root workflow **builds, pushes, and deploys all four services**: ECR images (SHA + `latest`), then ECS task definition update and service deployment so running tasks use the new image.

## One-time setup

### 1. Ensure repository structure

Your **Git repository root** must be the `event-ticket-booking-system` folder, with these directories at the top level:

- `user-service/`
- `event-service/`
- `booking-service/`
- `payment-service/`

So when someone clones the repo, they get:

```
event-ticket-booking-system/
  .github/workflows/ecr-build-push.yml
  user-service/
  event-service/
  booking-service/
  payment-service/
```

### 2. Create ECR repositories (if not already done)

In AWS (e.g. us-east-1), create one repository per service:

- `user-service`
- `event-service`
- `booking-service`
- `payment-service`

No need to create them manually if you already pushed from your machine; the first push from GitHub Actions will use the same names.

### 3. Add GitHub secrets

In your GitHub repo: **Settings → Secrets and variables → Actions**, add:

| Secret name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key with ECR push (and ECS deploy if using per-service workflows) |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |

**IAM permissions** for the user used by these keys must include:

**ECR (push images):**
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`, `ecr:GetDownloadUrlForLayer`, `ecr:BatchGetImage`
- `ecr:PutImage`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`

**ECS (update task definition and service):**
- `ecs:DescribeTaskDefinition`, `ecs:RegisterTaskDefinition`
- `ecs:DescribeServices`, `ecs:UpdateService`
- `ecs:DescribeTasks`, `ecs:ListTasks`
- `iam:PassRole` (for the task execution role used by the task definition)

(You can use **AmazonEC2ContainerRegistryPowerUser** for ECR and attach a custom policy or **AmazonECS_FullAccess** for ECS, or a single custom policy with the above.)

### 4. ECS cluster and task definitions

The workflow deploys to:

- **Cluster:** `event-booking-cluster` (set in the workflow as `ECS_CLUSTER`).
- **Task definitions:** `user-service-task`, `event-service-task`, `booking-service-task`, `payment-service-task`.
- **Services:** `user-service`, `event-service`, `booking-service`, `payment-service` (must exist in the cluster).

Ensure these resources exist in AWS and that the task definitions use the correct ECR image (they will be updated with the new image on each run).

### 5. Set AWS region (optional)

The workflow uses **`us-east-1`** by default (`env.AWS_REGION`). To use another region, edit `.github/workflows/ecr-build-push.yml` and change `AWS_REGION` and ensure your ECR repos and ECS cluster are in that region.

## What runs on push

- **Trigger:** Push to `main` or `develop` (or manual run).
- **Jobs:** Four parallel jobs (one per service). Each job:
  1. Checks out the repo.
  2. Configures AWS credentials.
  3. Logs in to ECR.
  4. Builds the Docker image from the service directory (e.g. `user-service/`).
  5. Tags the image with **git SHA** and **`latest`** and pushes both to ECR.
  6. **Downloads** the current ECS task definition.
  7. **Renders** a new task definition with the new image URI.
  8. **Deploys** to ECS (registers new task definition revision and updates the service; waits for stability).

Image URLs will look like:

- `676096976926.dkr.ecr.us-east-1.amazonaws.com/user-service:latest`
- `676096976926.dkr.ecr.us-east-1.amazonaws.com/user-service:<git-sha>`

(Account ID and region come from your AWS credentials and workflow `AWS_REGION`.)

## Fixing “invalid reference format” when tagging

If you see:

```text
error parsing reference: "/user-service:latest" is not a valid repository/tag
```

or

```text
676096976926.dkr.ecr..amazonaws.com/user-service:latest
```

then the **region** or **account** is missing. In the workflow we use:

- `steps.login-ecr.outputs.registry` (from `amazon-ecr-login`) for the full ECR host.
- `env.AWS_REGION` set to `us-east-1`.

So in GitHub Actions you don’t need to set `AWS_REGION` in the repo secrets unless you want to override the workflow. If you use variables in your own scripts, always set **both** `AWS_ACCOUNT_ID` and `AWS_REGION` (e.g. `us-east-1`) and use:

```powershell
$AWS_REGION = "us-east-1"
docker tag user-service:latest "$($AWS_ACCOUNT_ID).dkr.ecr.$($AWS_REGION).amazonaws.com/user-service:latest"
```

## Building only changed services (optional)

The current workflow builds **all four** services on every run. To build only services whose files changed, you can add a path filter per job or switch to a matrix that’s computed from changed files (e.g. with `dorny/paths-filter`). For most cases, building all four in parallel is acceptable and keeps the workflow simple.

## Summary

1. Repo root = `event-ticket-booking-system` with the four service folders.
2. Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in GitHub Actions secrets (with ECR + ECS permissions).
3. Ensure ECS cluster `event-booking-cluster` and the four services (and task definitions) exist.
4. Push to `main` or `develop` (or run the workflow manually) to build, push to ECR, and deploy all four services to ECS (task and service updated automatically).
