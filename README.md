# nextjs-auth-apps

A monorepo comparing different authentication libraries (Better Auth / Auth.js) with Next.js 16. Uses AWS Cognito and GitHub as OAuth providers, with infrastructure managed by AWS CDK.

## Project Structure

```
nextjs-auth-apps/
├── better-auth-app/   # Next.js 16 + Better Auth
├── authjs-app/        # Next.js 16 + Auth.js (next-auth v5)
└── infra/             # AWS CDK (Cognito User Pool, DynamoDB Session Table)
```

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16, React 19 |
| Auth (better-auth-app) | Better Auth |
| Auth (authjs-app) | Auth.js (next-auth v5) + DynamoDB Adapter |
| OAuth Providers | AWS Cognito (Managed Login), GitHub |
| Styling | Tailwind CSS v4 |
| Infrastructure | AWS CDK, Cognito User Pool, DynamoDB |
| Package Manager | pnpm |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- AWS CLI (required for infrastructure deployment)

### Deploy Infrastructure

```bash
cd infra
pnpm install
pnpm cdk deploy --all
```

Cognito values are available in the CloudFormation Outputs after deployment.

### better-auth-app

```bash
cd better-auth-app
pnpm install
cp .env.sample .env   # Configure environment variables
pnpm dev              # http://localhost:3000
```

Required environment variables:

| Variable | Description |
| --- | --- |
| `BETTER_AUTH_SECRET` | Session secret |
| `BETTER_AUTH_URL` | App base URL (default: `http://localhost:3000`) |
| `COGNITO_CLIENT_ID` | Cognito app client ID |
| `COGNITO_CLIENT_SECRET` | Cognito app client secret |
| `COGNITO_DOMAIN` | Cognito domain URL |
| `COGNITO_REGION` | AWS region |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

### authjs-app

```bash
cd authjs-app
pnpm install
cp .env.sample .env   # Configure environment variables
pnpm dev              # http://localhost:3001
```

Required environment variables:

| Variable | Description |
| --- | --- |
| `AUTH_SECRET` | Session secret (generate with `npx auth secret`) |
| `AUTH_URL` | App base URL (default: `http://localhost:3001`) |
| `AUTH_COGNITO_ID` | Cognito app client ID |
| `AUTH_COGNITO_SECRET` | Cognito app client secret |
| `AUTH_COGNITO_ISSUER` | Cognito issuer URL |
| `AUTH_GITHUB_ID` | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth client secret |
| `AUTH_DYNAMODB_TABLE_NAME` | DynamoDB table name |
| `AUTH_DYNAMODB_REGION` | DynamoDB region |

## Commands

### Apps (better-auth-app / authjs-app)

```bash
pnpm dev       # Start dev server
pnpm build     # Production build
pnpm lint      # Run ESLint
pnpm format    # Run Prettier
```

### Infrastructure (infra/)

```bash
pnpm build      # Compile TypeScript
pnpm test       # Run Jest tests
pnpm cdk synth  # Synthesize CloudFormation templates
pnpm cdk deploy # Deploy to AWS
pnpm cdk diff   # Show diff against deployed stack
```

## Architecture

### Route Structure (shared by both apps)

- `/signin` — Sign-in page with OAuth buttons
- `/(authorized)/dashboard` — Protected dashboard (authentication enforced by layout)
- `/api/auth/[...all]` — Better Auth API handler (better-auth-app)
- `/api/auth/[...nextauth]` — Auth.js API handler (authjs-app)

### Authentication Flow

Both apps implement authentication using AWS Cognito Managed Login and GitHub OAuth.

- **better-auth-app**: Better Auth handles all auth logic, integrated with Next.js API Routes via `toNextJsHandler`.
- **authjs-app**: Auth.js (next-auth v5) handles all auth logic with DynamoDB Adapter for session management (`database` strategy).

### Infrastructure (CDK)

- **AuthStack** — Cognito User Pool, App Client, Managed Login domain
- **SessionStack** — DynamoDB session table (PK/SK + GSI1, TTL enabled)
