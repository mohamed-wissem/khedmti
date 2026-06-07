# BLACKFORGE API

Production-grade backend that powers the [BLACKFORGE storefront](https://khedmti-storefront.vercel.app).
Node.js · TypeScript · Express · Prisma · PostgreSQL (Neon) · Redis.

> **Status: Sprints 0–7 complete.** Foundation, auth + RBAC, catalog, cart +
> coupons, orders + Stripe payments, reviews + gamification, admin + analytics,
> and hardening are all implemented. See [`ARCHITECTURE.md`](./ARCHITECTURE.md)
> for the full plan and [`docs/PRODUCTION.md`](./docs/PRODUCTION.md) for the
> deployment runbook. Full API reference at `/docs` (Swagger UI).

## Feature map

| Area | Endpoints |
| --- | --- |
| Auth & RBAC | `/auth/*` (register, login, refresh, logout, verify, reset, Google OAuth) |
| Users | `/users/me`, addresses, wishlist, gamification, referral |
| Catalog | `/products`, `/categories`, `/brands`, `/search` |
| Commerce | `/cart`, `/coupons`, `/orders`, `/payments` (Stripe + webhook) |
| Community | `/reviews` (verified-purchase + moderation) |
| Admin | `/admin/users`, `/admin/analytics/*`, `/admin/audit-logs` |

## Requirements

- Node.js ≥ 20 (developed on 22)
- Docker + Docker Compose (for the local Postgres/Redis stack)
- A PostgreSQL database (local via compose, or Neon). The API owns the **`bfapi`**
  schema and never touches `public` (Django) or `blackforge` (storefront).

## Quick start

```bash
npm install                 # installs deps + generates the Prisma client
cp .env.example .env        # then fill in DATABASE_URL, REDIS_URL, JWT secrets

# Option A — services in Docker, API on host (fast reloads):
docker compose up -d postgres redis
npm run dev                 # http://localhost:4000

# Option B — full containerized stack:
docker compose up --build
```

Verify it's up:

```bash
curl http://localhost:4000/health         # liveness summary
curl http://localhost:4000/health/ready   # checks Postgres + Redis
open  http://localhost:4000/docs          # Swagger UI
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with hot reload (tsx) |
| `npm run build` | Compile TS → `dist/` (tsc + tsc-alias) |
| `npm start` | Run the compiled server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm test` / `test:watch` / `test:coverage` | Vitest |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Create/apply a dev migration (Sprint 1+) |
| `npm run prisma:deploy` | Apply migrations in prod/CI |
| `npm run prisma:seed` | Seed RBAC roles/permissions (+ optional admin) |
| `npm run create:admin` | Create/promote an admin user (args, env, or prompt) |

## Environment variables

Validated once at boot by `src/config/env.ts` (the app exits if required vars are
missing/invalid). See [`.env.example`](./.env.example).

| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | no | `development` \| `test` \| `production` |
| `PORT` | no | default `4000` |
| `CORS_ORIGIN` | no | comma-separated allowlist, or `*` |
| `DATABASE_URL` | **yes** | Neon/Postgres, `?schema=bfapi` |
| `DATABASE_URL_UNPOOLED` | no | direct URL for migrations |
| `REDIS_URL` | **yes** | |
| `JWT_SECRET` | **yes** | ≥ 16 chars |
| `JWT_REFRESH_SECRET` | **yes** | ≥ 16 chars |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | no | required from Sprint 4 |
| `CLOUDINARY_*` | no | required from Sprint 2 |

## Project structure

```
src/
├── config/      env validation, typed config, redis, swagger, constants
├── prisma/      PrismaClient singleton (schema lives in /prisma)
├── utils/       logger, AppError, response envelopes, asyncHandler
├── middleware/  request logging, rate limit, 404, error handler
├── modules/     feature-first (Sprint 0: health only)
├── routes/      mounts the /api/v1 router
├── app.ts       Express app (no listen — imported by tests)
└── server.ts    listen + graceful shutdown
```

## Health endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | summary (status, uptime, env) |
| `GET /health/live` | liveness — process is up |
| `GET /health/ready` | readiness — verifies Postgres + Redis (503 if any down) |

## API responses

Success: `{ "success": true, "data": ..., "meta"?: ... }`
Error: `{ "success": false, "message": "...", "code": "...", "details"?: ... }`
