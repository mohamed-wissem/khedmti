import type { Prisma } from "@prisma/client";
import { prisma } from "@/prisma/client";

export function findByOrderId(orderId: string) {
  return prisma.payment.findUnique({ where: { orderId } });
}

export function findByIntentId(intentId: string) {
  return prisma.payment.findUnique({
    where: { stripePaymentIntentId: intentId },
    include: { order: true },
  });
}

export function updateByOrderId(orderId: string, data: Prisma.PaymentUpdateInput) {
  return prisma.payment.update({ where: { orderId }, data });
}

export async function listByUser(userId: string, skip: number, take: number) {
  const where = { order: { userId } };
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { order: { select: { number: true, status: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.payment.count({ where }),
  ]);
  return { items, total };
}
