import type { Server } from "node:http";
import { createApp } from "@/app";
import { config } from "@/config";
import { logger } from "@/utils/logger";
import { SHUTDOWN_TIMEOUT_MS } from "@/config/constants";
import { disconnectDatabase } from "@/prisma/client";
import { disconnectRedis } from "@/config/redis";

const app = createApp();

const server: Server = app.listen(config.server.port, () => {
  logger.info(
    { port: config.server.port, env: config.env, base: config.server.apiBasePath },
    `🚀 BLACKFORGE API listening on http://localhost:${config.server.port}`
  );
});

/** Close the HTTP server + all external connections, then exit. */
async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "shutting down gracefully");

  const forceExit = setTimeout(() => {
    logger.error("graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  server.close(async (err) => {
    if (err) logger.error({ err }, "error closing http server");
    await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
    clearTimeout(forceExit);
    logger.info("shutdown complete");
    process.exit(err ? 1 : 0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "unhandled promise rejection");
});
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaught exception — exiting");
  process.exit(1);
});

export { server };
