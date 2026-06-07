import { randomBytes } from "node:crypto";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/prisma/client";
import { AppError } from "@/utils/apiError";
import { getPageQuery, pageMeta } from "@/utils/pagination";
import { logger } from "@/utils/logger";
import { stripeEnabled, createPaymentIntent } from "@/services/stripe.service";
import { recordAudit } from "@/services/audit.service";
import * as couponsService from "@/modules/coupons/coupons.service";
import * as paymentsRepo from "@/modules/payments/payments.repository";
import {
  xpForOrder,
  creditForOrder,
  levelForXp,
  REFERRAL_BONUS_CENTS,
  REFERRAL_XP,
} from "@/modules/gamification/gamification.rules";
import * as repo from "@/modules/orders/orders.repository";
import type { AuthUser } from "@/modules/auth/auth.types";
import { PERMISSIONS } from "@/modules/rbac/permissions";

function mockDeliveredKey(): string {
  const seg = () => randomBytes(2).toString("hex").toUpperCase();
  return `BF-${seg()}-${seg()}-${seg()}`;
}

async function uniqueOrderNumber(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const n = `BF-${randomBytes(4).toString("hex").toUpperCase()}`;
    if (!(await repo.numberExists(n))) return n;
  }
  return `BF-${Date.now().toString(36).toUpperCase()}`;
}

export interface CheckoutContext {
  userId?: string;
  guestId?: string;
}

export interface CheckoutInput {
  email?: string;
  couponCode?: string;
  addressId?: string;
}

export interface CheckoutResult {
  order: repo.OrderWithRelations;
  clientSecret: string | null;
  mock: boolean;
}

export async function createOrder(
  ctx: CheckoutContext,
  input: CheckoutInput
): Promise<CheckoutResult> {
  const cart = ctx.userId
    ? await prisma.cart.findUnique({
        where: { userId: ctx.userId },
        include: { items: { include: { product: true, variant: true } } },
      })
    : ctx.guestId
      ? await prisma.cart.findUnique({
          where: { guestId: ctx.guestId },
          include: { items: { include: { product: true, variant: true } } },
        })
      : null;

  if (!cart || cart.items.length === 0) throw AppError.badRequest("Your cart is empty");

  // Resolve the customer email.
  let email = input.email?.trim().toLowerCase();
  if (ctx.userId && !email) {
    const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
    email = user?.email;
  }
  if (!email) throw AppError.badRequest("An email is required to place an order");

  // Re-price every line from the database (never trust the client).
  const lines = cart.items.map((item) => {
    if (!item.product.active) throw AppError.badRequest(`"${item.product.title}" is unavailable`);
    const unit = item.variant?.priceCents ?? item.product.priceCents;
    const label = [item.product.title, item.variant?.color, item.variant?.size]
      .filter(Boolean)
      .join(" · ");
    return {
      productId: item.productId,
      variantId: item.variantId,
      title: label,
      quantity: item.quantity,
      priceCents: unit,
    };
  });
  const subtotalCents = lines.reduce((n, l) => n + l.priceCents * l.quantity, 0);

  // Apply coupon (server-validated).
  let discountCents = 0;
  let couponId: string | undefined;
  if (input.couponCode) {
    const evalResult = await couponsService.evaluate(input.couponCode, subtotalCents, ctx.userId);
    discountCents = evalResult.discountCents;
    couponId = evalResult.coupon.id;
  }
  const totalCents = Math.max(0, subtotalCents - discountCents);

  // Validate address ownership (members only).
  if (input.addressId && ctx.userId) {
    const address = await prisma.address.findFirst({
      where: { id: input.addressId, userId: ctx.userId },
    });
    if (!address) throw AppError.badRequest("Invalid address");
  }

  const order = await repo.create({
    number: await uniqueOrderNumber(),
    email,
    status: "PENDING",
    subtotalCents,
    discountCents,
    totalCents,
    ...(ctx.userId ? { user: { connect: { id: ctx.userId } } } : {}),
    ...(couponId ? { coupon: { connect: { id: couponId } } } : {}),
    ...(input.addressId && ctx.userId ? { address: { connect: { id: input.addressId } } } : {}),
    items: { create: lines },
    payment: { create: { amountCents: totalCents, status: "REQUIRES_PAYMENT" } },
  });

  // The cart's contents are now captured in the order.
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  // Stripe path: create a PaymentIntent and wait for the webhook to fulfill.
  if (stripeEnabled() && totalCents > 0) {
    const intent = await createPaymentIntent(totalCents, "usd", { orderId: order.id });
    await paymentsRepo.updateByOrderId(order.id, {
      stripePaymentIntentId: intent.id,
      status: "PROCESSING",
    });
    return {
      order: (await repo.findById(order.id))!,
      clientSecret: intent.client_secret,
      mock: false,
    };
  }

  // Mock path (no Stripe / free order): fulfill immediately.
  await fulfillOrder(order.id);
  return { order: (await repo.findById(order.id))!, clientSecret: null, mock: true };
}

/**
 * Mark an order paid + fulfilled and run all side-effects. Idempotent: safe to
 * call from the mock path and (repeatedly) from the Stripe webhook.
 */
export async function fulfillOrder(orderId: string): Promise<void> {
  const order = await repo.findById(orderId);
  if (!order) return;
  if (order.status !== "PENDING" && order.status !== "PAID") return; // already handled

  const items = await repo.itemsForFulfillment(orderId);
  for (const item of items) {
    if (item.product.instant && !item.deliveredKey) {
      await repo.setDeliveredKey(item.id, mockDeliveredKey());
    }
    if (item.variantId) {
      await prisma.productVariant
        .update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } })
        .catch(() => undefined);
    }
  }

  await paymentsRepo.updateByOrderId(orderId, { status: "SUCCEEDED" }).catch(() => undefined);
  await repo.updateStatus(orderId, "FULFILLED");

  await awardGamification(order.userId, order.totalCents, orderId);
  if (order.couponId && order.userId) {
    await couponsService.redeem(order.couponId, order.userId, orderId).catch(() => undefined);
  }
  logger.info({ orderId, number: order.number }, "order fulfilled");
}

async function awardGamification(
  userId: string | null,
  totalCents: number,
  orderId: string
): Promise<void> {
  if (!userId) return;
  const prior = await repo.countUserOrders(userId, orderId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const newXp = user.xp + xpForOrder(totalCents);
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: levelForXp(newXp),
      creditCents: { increment: creditForOrder(totalCents) },
    },
  });

  // First order from a referred user pays the referrer.
  if (prior === 0 && user.referredById) {
    const ref = await prisma.user.findUnique({ where: { id: user.referredById } });
    if (ref) {
      await prisma.user.update({
        where: { id: ref.id },
        data: {
          creditCents: { increment: REFERRAL_BONUS_CENTS },
          xp: { increment: REFERRAL_XP },
          level: levelForXp(ref.xp + REFERRAL_XP),
        },
      });
    }
  }
}

// ── Reads ────────────────────────────────────────────────────────────────────
export async function listForUser(userId: string, page: number, limit: number) {
  const { skip, take } = getPageQuery({ page, limit });
  const { items, total } = await repo.listByUser(userId, skip, take);
  return { items, meta: pageMeta(total, page, limit) };
}

export async function listAll(page: number, limit: number, status?: OrderStatus) {
  const { skip, take } = getPageQuery({ page, limit });
  const { items, total } = await repo.listAll({ status }, skip, take);
  return { items, meta: pageMeta(total, page, limit) };
}

function ensureCanView(order: repo.OrderWithRelations, user?: AuthUser): void {
  const isOwner = user && order.userId === user.id;
  const isStaff = user?.permissions.includes(PERMISSIONS.ORDER_READ_ALL);
  if (!isOwner && !isStaff) throw AppError.forbidden("You cannot view this order");
}

export async function getById(id: string, user?: AuthUser) {
  const order = await repo.findById(id);
  if (!order) throw AppError.notFound("Order not found");
  ensureCanView(order, user);
  return order;
}

export async function track(id: string, user?: AuthUser) {
  const order = await getById(id, user);
  return { number: order.number, status: order.status, trackingCode: order.trackingCode };
}

export async function cancel(id: string, user: AuthUser) {
  const order = await repo.findById(id);
  if (!order) throw AppError.notFound("Order not found");
  if (order.userId !== user.id) throw AppError.forbidden("You cannot cancel this order");
  if (order.status !== "PENDING") {
    throw AppError.badRequest("Only pending orders can be cancelled");
  }
  const updated = await repo.updateStatus(id, "CANCELLED");
  await recordAudit({ userId: user.id, action: "order.cancel", entity: "order", entityId: id });
  return updated;
}

export async function updateStatus(
  id: string,
  status: OrderStatus,
  trackingCode: string | undefined,
  adminId: string
) {
  if (!(await repo.findById(id))) throw AppError.notFound("Order not found");
  const updated = await repo.updateStatus(id, status, trackingCode);
  await recordAudit({
    userId: adminId,
    action: "order.status",
    entity: "order",
    entityId: id,
    metadata: { status, trackingCode },
  });
  return updated;
}
