import type { Prisma } from "@prisma/client";
import { prisma } from "@/prisma/client";

const reviewInclude = {
  user: { select: { id: true, name: true, image: true } },
} satisfies Prisma.ReviewInclude;

/** Has the user actually bought this product (paid/fulfilled/shipped order)? */
export async function hasPurchased(userId: string, productId: string): Promise<boolean> {
  const count = await prisma.orderItem.count({
    where: { productId, order: { userId, status: { in: ["PAID", "FULFILLED", "SHIPPED"] } } },
  });
  return count > 0;
}

export function findByUserProduct(userId: string, productId: string) {
  return prisma.review.findUnique({ where: { productId_userId: { productId, userId } } });
}

export function findById(id: string) {
  return prisma.review.findUnique({ where: { id } });
}

export function create(data: Prisma.ReviewCreateInput) {
  return prisma.review.create({ data, include: reviewInclude });
}

export function update(id: string, data: Prisma.ReviewUpdateInput) {
  return prisma.review.update({ where: { id }, data, include: reviewInclude });
}

export function remove(id: string) {
  return prisma.review.delete({ where: { id } });
}

export async function listApprovedByProduct(productId: string, skip: number, take: number) {
  const where = { productId, status: "APPROVED" as const };
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.review.count({ where }),
  ]);
  return { items, total };
}

export async function listPending(skip: number, take: number) {
  const where = { status: "PENDING" as const };
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: { createdAt: "asc" },
      skip,
      take,
    }),
    prisma.review.count({ where }),
  ]);
  return { items, total };
}

/** Recompute a product's denormalized avgRating + reviewCount from APPROVED reviews. */
export async function recomputeRating(productId: string): Promise<void> {
  const agg = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  });
}
