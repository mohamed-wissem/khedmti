import { pingDatabase } from "@/prisma/client";
import { pingRedis } from "@/config/redis";
import { env } from "@/config/env";

export interface DependencyStatus {
  status: "up" | "down";
}

export interface ReadinessReport {
  status: "ok" | "degraded";
  checks: {
    database: DependencyStatus;
    redis: DependencyStatus;
  };
}

export interface LivenessReport {
  status: "ok";
  uptime: number;
  timestamp: string;
  env: string;
}

/** Liveness — process is up and the event loop is responsive. No I/O. */
export function getLiveness(): LivenessReport {
  return {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  };
}

/** Readiness — every critical dependency is reachable. */
export async function getReadiness(): Promise<ReadinessReport> {
  const [dbUp, redisUp] = await Promise.all([pingDatabase(), pingRedis()]);

  return {
    status: dbUp && redisUp ? "ok" : "degraded",
    checks: {
      database: { status: dbUp ? "up" : "down" },
      redis: { status: redisUp ? "up" : "down" },
    },
  };
}
