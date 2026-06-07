import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { getLiveness, getReadiness } from "@/modules/health/health.service";

/** GET /health — basic liveness summary (also used as the default probe). */
export function health(_req: Request, res: Response): void {
  sendSuccess(res, getLiveness());
}

/** GET /health/live — Kubernetes-style liveness probe. Always 200 if process is up. */
export function live(_req: Request, res: Response): void {
  sendSuccess(res, getLiveness());
}

/** GET /health/ready — readiness probe. 200 when all deps are up, 503 otherwise. */
export async function ready(_req: Request, res: Response): Promise<void> {
  const report = await getReadiness();
  const status = report.status === "ok" ? 200 : 503;
  sendSuccess(res, report, status);
}
