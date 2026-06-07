import type { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/prisma/client";

export const orderInclude = {
  items: true,
  payment: true,
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export function create(data: Prisma.OrderCreateInput) {
  return prisma.order.create({ data, include: orderInclude });
}

export function findById(id: string) {
  return prisma.order.findUnique({ where: { id }, include: orderInclude });
}

export function numberExists(number: string) {
  return prisma.order.findUnique({ where: { number }, select: { id: true } });
}

export async function listByUser(userId: string, skip: number, take: number) {
  const where = { userId };
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);
  return { items, total };
}

export async function listAll(filter: { status?: OrderStatus }, skip: number, take: number) {
  const where: Prisma.OrderWhereInput = {};
  if (filter.status) where.status = filter.status;
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);
  return { items, total };
}

export function countUserOrders(userId: string, excludeId?: string) {
  return prisma.order.count({
    where: { userId, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
}

export function updateStatus(id: string, status: OrderStatus, trackingCode?: string) {
  return prisma.order.update({
    where: { id },
    data: { status, ...(trackingCode !== undefined ? { trackingCode } : {}) },
    include: orderInclude,
  });
}

/** Items joined with product.instant + variantId, for fulfillment. */
export function itemsForFulfillment(orderId: string) {
  return prisma.orderItem.findMany({
    where: { orderId },
    include: { product: { select: { instant: true } } },
  });
}

export function setDeliveredKey(orderItemId: string, key: string) {
  return prisma.orderItem.update({ where: { id: orderItemId }, data: { deliveredKey: key } });
}
