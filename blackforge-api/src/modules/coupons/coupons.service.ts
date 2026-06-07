import type { Coupon, CouponType } from "@prisma/client";
import { AppError } from "@/utils/apiError";
import { getPageQuery, pageMeta } from "@/utils/pagination";
import * as repo from "@/modules/coupons/coupons.repository";

/** Pure discount math — exported for unit testing. */
export function computeDiscount(type: CouponType, value: number, subtotalCents: number): number {
  const raw = type === "PERCENT" ? Math.floor((subtotalCents * value) / 100) : value;
  return Math.max(0, Math.min(raw, subtotalCents));
}

export interface CouponEvaluation {
  coupon: Coupon;
  discountCents: number;
}

/**
 * Validate a coupon against a subtotal (and optionally a user) and compute the
 * discount. Throws an AppError when the coupon can't be applied.
 */
export async function evaluate(
  code: string,
  subtotalCents: number,
  userId?: string
): Promise<CouponEvaluation> {
  const coupon = await repo.findByCode(code.toUpperCase());
  if (!coupon || !coupon.active) throw AppError.badRequest("Invalid coupon code", { code });

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now)
    throw AppError.badRequest("Coupon is not active yet");
  if (coupon.expiresAt && coupon.expiresAt < now)
    throw AppError.badRequest("This coupon has expired");
  if (coupon.minSpendCents && subtotalCents < coupon.minSpendCents) {
    throw AppError.badRequest("Order subtotal is below the coupon minimum", {
      minSpendCents: coupon.minSpendCents,
    });
  }
  if (coupon.maxRedemptions !== null && coupon.redeemedCount >= coupon.maxRedemptions) {
    throw AppError.badRequest("This coupon has reached its redemption limit");
  }
  if (coupon.perUserLimit !== null && userId) {
    const used = await repo.countUserRedemptions(coupon.id, userId);
    if (used >= coupon.perUserLimit) {
      throw AppError.badRequest("You have already used this coupon the maximum number of times");
    }
  }

  return { coupon, discountCents: computeDiscount(coupon.type, coupon.value, subtotalCents) };
}

export async function validatePreview(code: string, subtotalCents: number, userId?: string) {
  const { coupon, discountCents } = await evaluate(code, subtotalCents, userId);
  return {
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discountCents,
    totalCents: subtotalCents - discountCents,
  };
}

// ── Admin ─────────────────────────────────────────────────────────────────
export async function list(page: number, limit: number) {
  const { skip, take } = getPageQuery({ page, limit });
  const { items, total } = await repo.list(skip, take);
  return { items, meta: pageMeta(total, page, limit) };
}

export async function create(input: {
  code: string;
  type: CouponType;
  value: number;
  maxRedemptions?: number | null;
  perUserLimit?: number | null;
  minSpendCents?: number | null;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  active: boolean;
}): Promise<Coupon> {
  if (await repo.findByCode(input.code)) throw AppError.conflict("Coupon code already exists");
  return repo.create(input);
}

export async function update(id: string, input: Record<string, unknown>): Promise<Coupon> {
  if (!(await repo.findById(id))) throw AppError.notFound("Coupon not found");
  return repo.update(id, input);
}

export async function remove(id: string): Promise<void> {
  if (!(await repo.findById(id))) throw AppError.notFound("Coupon not found");
  await repo.remove(id);
}

/** Record redemption at order time (Sprint 4). */
export function redeem(couponId: string, userId: string, orderId: string) {
  return repo.redeem(couponId, userId, orderId);
}
