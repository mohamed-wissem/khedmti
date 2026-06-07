# syntax=docker/dockerfile:1

# ---- Base ---------------------------------------------------------------------
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- Builder (installs all deps, generates Prisma client, compiles TS) --------
FROM base AS builder
ENV NODE_ENV=development
COPY package*.json ./
COPY prisma ./prisma
# postinstall runs `prisma generate` (needs the schema, copied above).
RUN npm ci
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# ---- Runner (prod-only deps + compiled output) -------------------------------
FROM base AS runner
# Prisma's query engine needs OpenSSL at runtime.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
# --ignore-scripts: skip postinstall (prisma CLI is a devDep, absent here).
RUN npm ci --omit=dev --ignore-scripts

# Bring the generated Prisma client over from the builder.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
