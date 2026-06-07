import type { Request } from "express";
import { prisma } from "@/prisma/client";
import { logger } from "@/utils/logger";

export interface AuditInput {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

/**
 * Record an audit-log entry. Best-effort: failures are logged but never break
 * the calling request.
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        metadata: input.metadata as never,
        ip: input.ip,
        userAgent: input.userAgent,
      },
    });
  } catch (err) {
    logger.warn({ err, action: input.action }, "failed to write audit log");
  }
}

/** Extract client IP + user-agent from a request for audit entries. */
export function auditContext(req: Request): { ip?: string; userAgent?: string } {
  return { ip: req.ip, userAgent: req.headers["user-agent"] };
}
