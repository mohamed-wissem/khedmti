import { AppError } from "@/utils/apiError";
import { getPageQuery, pageMeta } from "@/utils/pagination";
import { recordAudit } from "@/services/audit.service";
import { findRoleByName } from "@/modules/auth/auth.repository";
import * as repo from "@/modules/admin/admin.repository";

export async function listUsers(q: string | undefined, page: number, limit: number) {
  const { skip, take } = getPageQuery({ page, limit });
  const { items, total } = await repo.listUsers(q, skip, take);
  return { items, meta: pageMeta(total, page, limit) };
}

export async function updateUserRole(userId: string, roleName: string, adminId: string) {
  const user = await repo.findUser(userId);
  if (!user) throw AppError.notFound("User not found");
  const role = await findRoleByName(roleName);
  if (!role) throw AppError.badRequest("Unknown role");

  const updated = await repo.setUserRole(userId, role.id);
  await recordAudit({
    userId: adminId,
    action: "user.role",
    entity: "user",
    entityId: userId,
    metadata: { role: roleName },
  });
  return updated;
}

export async function salesAnalytics(days: number) {
  const [totals, top, byStatus, series] = await Promise.all([
    repo.salesTotals(),
    repo.topProducts(5),
    repo.statusBreakdown(),
    repo.revenueByDay(days),
  ]);
  return {
    totals,
    topProducts: top,
    statusBreakdown: byStatus,
    revenueByDay: series,
    periodDays: days,
  };
}

export async function inventory(threshold: number) {
  const lowStock = await repo.lowStock(threshold);
  return { threshold, lowStockCount: lowStock.length, lowStock };
}

export async function auditLogs(action: string | undefined, page: number, limit: number) {
  const { skip, take } = getPageQuery({ page, limit });
  const { items, total } = await repo.listAuditLogs(action, skip, take);
  return { items, meta: pageMeta(total, page, limit) };
}
