# GitHub Actions: ECR Build & Push Setup

This project uses GitHub Actions to build all four microservice images and push them to **Amazon ECR** on every push to `main` or `develop`.

## Workflows

| Workflow | File | When it runs |
|----------|------|----------------|
| **ECR Build and Push (All Services)** | `.github/workflows/ecr-build-push.yml` | Push to `main` or `develop`; also manually via **Actions → Run workflow** |
| Per-service CI/CD (build + ECS deploy) | `user-service/.github/workflows/ci-cd.yml` etc. | Only when files under that service change (`paths: '<service>/**'`) |

The root workflow **builds and pushes all four services** so that a single push updates every image in ECR.

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

**IAM permissions** for the user used by these keys should include at least:

- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:GetDownloadUrlForLayer`
- `ecr:BatchGetImage`
- `ecr:PutImage`
- `ecr:InitiateLayerUpload`
- `ecr:UploadLayerPart`
- `ecr:CompleteLayerUpload`

(Or attach the AWS managed policy **AmazonEC2ContainerRegistryPowerUser** for ECR-only use.)

### 4. Set AWS region (optional)

The workflow uses **`us-east-1`** by default (`env.AWS_REGION` in the workflow). To use another region, edit `.github/workflows/ecr-build-push.yml` and change `AWS_REGION`.

## What runs on push

- **Trigger:** Push to `main` or `develop` (or manual run).
- **Jobs:** Four parallel jobs (one per service). Each job:
  1. Checks out the repo.
  2. Configures AWS with the secrets above.
  3. Logs in to ECR.
  4. Builds the Docker image from the service directory (e.g. `user-service/`).
  5. Tags the image with **git SHA** and **`latest`**.
  6. Pushes both tags to ECR.

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
2. Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in GitHub Actions secrets.
3. Push to `main` or `develop` (or run the workflow manually) to build and push all services to ECR with tags `latest` and `<git-sha>`.
