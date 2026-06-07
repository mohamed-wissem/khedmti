import type { Prisma } from "@prisma/client";
import { prisma } from "@/prisma/client";

export function findByCode(code: string) {
  return prisma.coupon.findUnique({ where: { code } });
}

export function findById(id: string) {
  return prisma.coupon.findUnique({ where: { id } });
}

export async function list(skip: number, take: number) {
  const [items, total] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, skip, take }),
    prisma.coupon.count(),
  ]);
  return { items, total };
}

export function create(data: Prisma.CouponCreateInput) {
  return prisma.coupon.create({ data });
}

export function update(id: string, data: Prisma.CouponUpdateInput) {
  return prisma.coupon.update({ where: { id }, data });
}

export function remove(id: string) {
  return prisma.coupon.delete({ where: { id } });
}

export function countUserRedemptions(couponId: string, userId: string) {
  return prisma.couponRedemption.count({ where: { couponId, userId } });
}

/** Atomically record a redemption + bump the counter (called at order time). */
export function redeem(couponId: string, userId: string, orderId: string) {
  return prisma.$transaction([
    prisma.coupon.update({ where: { id: couponId }, data: { redeemedCount: { increment: 1 } } }),
    prisma.couponRedemption.create({ data: { couponId, userId, orderId } }),
  ]);
}
