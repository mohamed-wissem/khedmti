import { config as loadDotenv } from "dotenv";
import { z } from "zod";

// Load .env into process.env (no-op if the file is absent, e.g. in Docker/CI
// where vars are injected directly).
loadDotenv();

/**
 * Schema for all environment variables. Validated ONCE at process boot so the
 * rest of the app can rely on `env` being present and correctly typed.
 *
 * Sprint 0 policy: DATABASE_URL, REDIS_URL and the JWT secrets are required.
 * Stripe/Cloudinary are optional until the sprints that use them, so the app
 * can boot locally without third-party credentials.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  // Comma-separated list of allowed origins (or "*").
  CORS_ORIGIN: z.string().default("*"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  // Direct/unpooled URL for migrations; falls back to DATABASE_URL if unset.
  DATABASE_URL_UNPOOLED: z.string().optional(),

  // Redis
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // Auth secrets
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),

  // Public app URL (used in verification / reset email links)
  APP_URL: z.string().default("http://localhost:3000"),

  // Outbound email (optional — falls back to logging the message in dev)
  SMTP_URL: z.string().optional(),
  EMAIL_FROM: z.string().default("BLACKFORGE <no-reply@blackforge.gg>"),

  // Seed admin (optional — used by `prisma db seed`)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),

  // Google OAuth (optional until configured)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  // Stripe (optional until Sprint 4)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Cloudinary (optional until Sprint 2)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    // Logger isn't available this early; write directly and exit.
    // eslint-disable-next-line no-console
    console.error(`\n❌ Invalid environment configuration:\n${issues}\n`);
    process.exit(1);
  }
  return parsed.data;
}

export const env: Env = parseEnv();

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
