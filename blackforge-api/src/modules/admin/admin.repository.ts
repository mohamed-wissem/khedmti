import { Prisma, type OrderStatus } from "@prisma/client";
import { prisma } from "@/prisma/client";

const PAID_STATUSES: OrderStatus[] = ["PAID", "FULFILLED", "SHIPPED"];

// ── Users ─────────────────────────────────────────────────────────────────
export async function listUsers(q: string | undefined, skip: number, take: number) {
  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        level: true,
        xp: true,
        creditCents: true,
        createdAt: true,
        role: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total };
}

export function findUser(id: string) {
  return prisma.user.findUnique({ where: { id }, include: { role: true } });
}

export function setUserRole(id: string, roleId: string) {
  return prisma.user.update({
    where: { id },
    data: { roleId },
    select: { id: true, email: true, role: { select: { name: true } } },
  });
}

// ── Analytics ───────────────────────────────────────────────────────────────
export async function salesTotals() {
  const agg = await prisma.order.aggregate({
    where: { status: { in: PAID_STATUSES } },
    _count: true,
    _sum: { totalCents: true },
  });
  const revenue = agg._sum.totalCents ?? 0;
  const orders = agg._count;
  return { revenueCents: revenue, orders, aovCents: orders ? Math.round(revenue / orders) : 0 };
}

export async function topProducts(limit = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { in: PAID_STATUSES } } },
    _sum: { quantity: true, priceCents: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, title: true, slug: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  return grouped.map((g) => ({
    productId: g.productId,
    title: byId.get(g.productId)?.title ?? "(deleted)",
    slug: byId.get(g.productId)?.slug ?? null,
    unitsSold: g._sum.quantity ?? 0,
  }));
}

export async function statusBreakdown() {
  const grouped = await prisma.order.groupBy({ by: ["status"], _count: true });
  return grouped.map((g) => ({ status: g.status, count: g._count }));
}

export function revenueByDay(days: number) {
  return prisma.$queryRaw<{ day: string; revenue: number; orders: number }[]>`
    SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
           sum("totalCents")::int AS revenue,
           count(*)::int AS orders
    FROM bfapi."order"
    WHERE status IN ('PAID', 'FULFILLED', 'SHIPPED')
      AND "createdAt" >= now() - make_interval(days => ${days})
    GROUP BY day
    ORDER BY day`;
}

export async function lowStock(threshold: number) {
  const variants = await prisma.productVariant.findMany({
    where: { active: true, stock: { lte: threshold } },
    select: {
      id: true,
      sku: true,
      stock: true,
      color: true,
      size: true,
      product: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { stock: "asc" },
    take: 100,
  });
  return variants;
}

// ── Audit ───────────────────────────────────────────────────────────────────
export async function listAuditLogs(action: string | undefined, skip: number, take: number) {
  const where: Prisma.AuditLogWhereInput = action ? { action } : {};
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, total };
}
