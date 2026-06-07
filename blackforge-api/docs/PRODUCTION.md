# BLACKFORGE API — Production Runbook

Operational guide for deploying and running the API in production.

## Pre-deploy checklist

- [ ] All env vars set (see `.env.example`); secrets are real and rotated:
      `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL(_UNPOOLED)`, `REDIS_URL`,
      `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLOUDINARY_*`.
- [ ] `CORS_ORIGIN` is an explicit allowlist (never `*` in production).
- [ ] `NODE_ENV=production` (enables Redis-backed rate limiting + HSTS + JSON logs).
- [ ] Database migrations applied: `npm run prisma:deploy`.
- [ ] RBAC + admin seeded: `npm run prisma:seed` (with `ADMIN_EMAIL`/`ADMIN_PASSWORD`).
- [ ] Stripe webhook endpoint registered → `https://<host>/api/v1/payments/webhook`,
      and `STRIPE_WEBHOOK_SECRET` matches.
- [ ] `/health/ready` returns 200 against prod Postgres + Redis.

## Deploy (zero-downtime)

1. Build image: `docker build -t blackforge-api .`
2. Run migrations as a release step: `npm run prisma:deploy`
   (expand/contract — additive migrations are safe to run before the new code).
3. Rolling-deploy the new image; the orchestrator gates on the container
   `HEALTHCHECK` (`/health/live`) and you should additionally gate traffic on
   `/health/ready`.
4. Verify: hit `/health/ready`, place a Stripe test-mode order end-to-end.

## Runtime topology

- Stateless API containers behind a load balancer (scale horizontally).
- One managed Postgres (pooled — use `DATABASE_URL` for the app, `DATABASE_URL_UNPOOLED`
  for migrations).
- One managed Redis (rate-limit store; future: cache + queues).
- Stripe → API via the signed webhook.

## Security posture (Sprint 7)

- `helmet` (CSP/HSTS/no-sniff/frameguard), explicit CORS allowlist, `hpp`.
- Zod validation on every body/query/param; free text sanitized (`sanitize-html`).
- bcrypt password hashing; short-lived access JWT + rotating, hashed refresh
  tokens with reuse detection.
- Tiered rate limiting (global + strict auth bucket), Redis-backed in prod.
- Audit logging of sensitive mutations; secrets redacted in logs.
- Prisma parameterized queries throughout (raw SQL uses tagged templates).

## Rollback

- Redeploy the previous image tag. Migrations are additive; a code rollback does
  not require a DB rollback. If a destructive migration must be reverted, restore
  from a Postgres point-in-time backup.

## Observability

- Structured pino logs (ship to a drain). Every request carries `x-request-id`.
- Probes: `/health` (summary), `/health/live` (liveness), `/health/ready`
  (Postgres + Redis).
- Recommended: wire Sentry for error tracking and watch the Stripe dashboard for
  webhook delivery failures.
