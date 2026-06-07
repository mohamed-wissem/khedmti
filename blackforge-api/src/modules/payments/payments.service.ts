import { AppError } from "@/utils/apiError";
import { logger } from "@/utils/logger";
import { getPageQuery, pageMeta } from "@/utils/pagination";
import {
  stripeEnabled,
  createPaymentIntent,
  constructEvent,
  createRefund,
} from "@/services/stripe.service";
import { recordAudit } from "@/services/audit.service";
import * as ordersService from "@/modules/orders/orders.service";
import * as ordersRepo from "@/modules/orders/orders.repository";
import * as repo from "@/modules/payments/payments.repository";

/** Create (or refresh) a Stripe PaymentIntent for an order the user owns. */
export async function createIntent(
  orderId: string,
  userId: string
): Promise<{ clientSecret: string }> {
  if (!stripeEnabled()) throw AppError.serviceUnavailable("Stripe is not configured");
  const order = await ordersRepo.findById(orderId);
  if (!order) throw AppError.notFound("Order not found");
  if (order.userId !== userId) throw AppError.forbidden("You cannot pay for this order");
  if (order.status !== "PENDING") throw AppError.badRequest("Order is not awaiting payment");

  const intent = await createPaymentIntent(order.totalCents, "usd", { orderId: order.id });
  await repo.updateByOrderId(order.id, { stripePaymentIntentId: intent.id, status: "PROCESSING" });
  if (!intent.client_secret) throw AppError.internal("Stripe did not return a client secret");
  return { clientSecret: intent.client_secret };
}

interface PaymentIntentLike {
  id: string;
  latest_charge?: string | null;
}

/** Process a verified Stripe webhook event. Idempotent. */
export async function handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
  const event = constructEvent(rawBody, signature);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as PaymentIntentLike;
      const payment = await repo.findByIntentId(pi.id);
      if (!payment) break;
      await repo.updateByOrderId(payment.orderId, {
        status: "SUCCEEDED",
        stripeChargeId: typeof pi.latest_charge === "string" ? pi.latest_charge : null,
        rawEvent: event as unknown as object,
      });
      await ordersService.fulfillOrder(payment.orderId);
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object as PaymentIntentLike;
      const payment = await repo.findByIntentId(pi.id);
      if (payment) await repo.updateByOrderId(payment.orderId, { status: "FAILED" });
      break;
    }
    default:
      logger.debug({ type: event.type }, "unhandled stripe event");
  }
}

export async function history(userId: string, page: number, limit: number) {
  const { skip, take } = getPageQuery({ page, limit });
  const { items, total } = await repo.listByUser(userId, skip, take);
  return { items, meta: pageMeta(total, page, limit) };
}

/** Refund an order (admin). Falls back to a DB-only refund when Stripe is off. */
export async function refund(orderId: string, amountCents: number | undefined, adminId: string) {
  const order = await ordersRepo.findById(orderId);
  if (!order) throw AppError.notFound("Order not found");
  const payment = await repo.findByOrderId(orderId);
  if (!payment) throw AppError.notFound("No payment for this order");

  const refundAmount = amountCents ?? payment.amountCents - payment.refundedCents;
  if (refundAmount <= 0) throw AppError.badRequest("Nothing left to refund");
  if (refundAmount > payment.amountCents - payment.refundedCents) {
    throw AppError.badRequest("Refund exceeds the remaining payment amount");
  }

  if (stripeEnabled() && payment.stripePaymentIntentId) {
    await createRefund(payment.stripePaymentIntentId, refundAmount);
  }

  const totalRefunded = payment.refundedCents + refundAmount;
  const fullyRefunded = totalRefunded >= payment.amountCents;
  await repo.updateByOrderId(orderId, {
    refundedCents: totalRefunded,
    status: fullyRefunded ? "REFUNDED" : "PARTIALLY_REFUNDED",
  });
  const updated = await ordersRepo.updateStatus(orderId, "REFUNDED");

  await recordAudit({
    userId: adminId,
    action: "order.refund",
    entity: "order",
    entityId: orderId,
    metadata: { refundAmount, fullyRefunded },
  });
  return updated;
}
