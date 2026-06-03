import { prisma } from "@/lib/prisma";

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserOrderStats(userId: string) {
  const [count, agg] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.aggregate({ where: { userId }, _sum: { totalCents: true } }),
  ]);
  return { count, spentCents: agg._sum.totalCents ?? 0 };
}
