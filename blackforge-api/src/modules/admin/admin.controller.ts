import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/apiError";
import * as service from "@/modules/admin/admin.service";
import type {
  listUsersQuery,
  salesQuery,
  inventoryQuery,
  auditQuery,
} from "@/modules/admin/admin.validators";
import type { z } from "zod";

export async function listUsers(req: Request, res: Response): Promise<void> {
  const { q, page, limit } = req.validated?.query as z.infer<typeof listUsersQuery>;
  const { items, meta } = await service.listUsers(q, page, limit);
  sendSuccess(res, { users: items }, 200, meta);
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const user = await service.updateUserRole(req.params.id as string, req.body.role, req.user.id);
  sendSuccess(res, { user });
}

export async function sales(req: Request, res: Response): Promise<void> {
  const { days } = req.validated?.query as z.infer<typeof salesQuery>;
  sendSuccess(res, await service.salesAnalytics(days));
}

export async function inventory(req: Request, res: Response): Promise<void> {
  const { threshold } = req.validated?.query as z.infer<typeof inventoryQuery>;
  sendSuccess(res, await service.inventory(threshold));
}

export async function auditLogs(req: Request, res: Response): Promise<void> {
  const { action, page, limit } = req.validated?.query as z.infer<typeof auditQuery>;
  const { items, meta } = await service.auditLogs(action, page, limit);
  sendSuccess(res, { auditLogs: items }, 200, meta);
}
