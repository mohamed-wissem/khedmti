import pino, { type LoggerOptions } from "pino";
import { isDevelopment, isTest, env } from "@/config/env";

/**
 * Application logger (pino).
 * - development: pretty, colorized, human-readable
 * - production: structured JSON (one line per event) for log drains
 * - test: silent by default to keep test output clean
 */
const options: LoggerOptions = {
  level: isTest ? "silent" : isDevelopment ? "debug" : "info",
  base: { service: "blackforge-api", env: env.NODE_ENV },
  // Never log secrets/tokens if they ever appear on a request object.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.passwordHash",
      "*.token",
    ],
    censor: "[redacted]",
  },
  ...(isDevelopment
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:HH:MM:ss.l", ignore: "pid,hostname" },
        },
      }
    : {}),
};

export const logger = pino(options);

export type Logger = typeof logger;
