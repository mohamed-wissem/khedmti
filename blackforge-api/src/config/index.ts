import { env, isDevelopment, isProduction, isTest } from "@/config/env";
import {
  API_BASE_PATH,
  BODY_LIMIT,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from "@/config/constants";

/**
 * Typed, structured application configuration assembled from validated `env`.
 * Import this (not raw `process.env`) everywhere in the app.
 */
export const config = {
  env: env.NODE_ENV,
  isDevelopment,
  isProduction,
  isTest,

  server: {
    port: env.PORT,
    bodyLimit: BODY_LIMIT,
    apiBasePath: API_BASE_PATH,
  },

  cors: {
    // "*" → allow all; otherwise an explicit origin allowlist.
    origins:
      env.CORS_ORIGIN === "*"
        ? ("*" as const)
        : env.CORS_ORIGIN.split(",")
            .map((o) => o.trim())
            .filter(Boolean),
  },

  rateLimit: {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
  },

  database: {
    url: env.DATABASE_URL,
    directUrl: env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL,
  },

  redis: {
    url: env.REDIS_URL,
  },

  jwt: {
    accessSecret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
  },

  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    get enabled(): boolean {
      return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET);
    },
  },

  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
    get enabled(): boolean {
      return Boolean(
        env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
      );
    },
  },
} as const;

export type AppConfig = typeof config;
