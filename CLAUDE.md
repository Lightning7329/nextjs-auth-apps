# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This monorepo contains three projects:

- @app — Next.js 16 application with Better Auth
- @authjs-app — Next.js 16 application with Auth.js (next-auth v5)
- @infra — AWS CDK infrastructure for Cognito User Pool

Package manager: **pnpm**

## App Commands (`app/`) — Better Auth

```bash
pnpm dev        # Start dev server (http://localhost:3000)
pnpm build      # Production build
pnpm lint       # Run ESLint
pnpm format     # Run Prettier
```

## Auth.js App Commands (`authjs-app/`) — Auth.js

```bash
pnpm dev        # Start dev server (http://localhost:3001)
pnpm build      # Production build
pnpm lint       # Run ESLint
pnpm format     # Run Prettier
```

## Infra Commands (`infra/`)

```bash
pnpm build      # Compile TypeScript
pnpm test       # Run Jest tests
pnpm cdk synth  # Synthesize CloudFormation templates
pnpm cdk deploy # Deploy to AWS
pnpm cdk diff   # Show diff against deployed stack
```

Run a single infra test: `pnpm test -- --testPathPattern=<pattern>`

## Architecture

### Authentication Flow — @app (Better Auth)

Better Auth (`better-auth`) handles all auth logic. It is configured in `app/src/lib/better-auth/`:

- `auth.ts` — server-side config with Cognito and GitHub OAuth providers
- `auth-client.ts` — client-side auth client

The API route at `app/src/app/api/auth/[...all]/route.ts` delegates all auth requests to Better Auth via `toNextJsHandler`.

### Authentication Flow — @authjs-app (Auth.js)

Auth.js (`next-auth` v5) handles all auth logic. It is configured in @authjs-app/src/lib/auth/ :

- `config.ts` — NextAuth config with Cognito and GitHub OAuth providers
- `auth.ts` — exports `handlers`, `auth`, `signIn`, `signOut` from NextAuth
- `actions.ts` — Server Actions for sign-in / sign-out (called from client components)

The API route at @authjs-app/src/app/api/auth/[...nextauth]/route.ts delegates all auth requests to Auth.js handlers. Session strategy is JWT (no database required).

### OAuth Providers (shared)

- **AWS Cognito** — via Managed Login (custom domain at `nextjs-better-auth.auth.ap-northeast-1.amazoncognito.com`)
- **GitHub** — standard OAuth app

### Route Structure (shared by both apps)

- `/signin` — public sign-in page with OAuth buttons
- `/(authorized)/dashboard` — protected route group; the layout at `(authorized)/layout.tsx` enforces authentication
- `/api/auth/[...all]` — Better Auth API handler (@app)
- `/api/auth/[...nextauth]` — Auth.js API handler (@authjs-app)

### Infrastructure (CDK)

`infra/lib/auth-stack.ts` defines a single `AuthStack` that provisions:

- Cognito User Pool with email as username
- App Client with authorization code grant flow
- Cognito domain with Newer Managed Login branding
- CloudFormation Outputs: User Pool ID, Domain URL, App Client ID

The CDK app entry is `infra/bin/app.ts`. AWS account and region are read from environment variables (`CDK_DEFAULT_ACCOUNT`, `CDK_DEFAULT_REGION`). Resource prefix is `nextjs-better-auth`.

### Environment Variables

Required in `app/.env`:

| Variable | Purpose |
| --- | --- |
| `BETTER_AUTH_SECRET` | Better Auth session secret |
| `BETTER_AUTH_URL` | App base URL (default: `http://localhost:3000`) |
| `COGNITO_CLIENT_ID` | Cognito app client ID |
| `COGNITO_CLIENT_SECRET` | Cognito app client secret |
| `COGNITO_DOMAIN` | Cognito hosted UI domain URL |
| `COGNITO_REGION` | AWS region (e.g., `ap-northeast-1`) |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |

Required in `authjs-app/.env`:

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Auth.js session secret (generate with `npx auth secret`) |
| `AUTH_URL` | App base URL (default: `http://localhost:3001`) |
| `AUTH_COGNITO_ID` | Cognito app client ID |
| `AUTH_COGNITO_SECRET` | Cognito app client secret |
| `AUTH_COGNITO_ISSUER` | Cognito issuer URL (`https://cognito-idp.{region}.amazonaws.com/{userPoolId}`) |
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret |

Cognito values are output by `cdk deploy`. Callback URLs configured in CDK: `http://localhost:3000/api/auth/callback/cognito` and `http://localhost:3001/api/auth/callback/cognito`.
