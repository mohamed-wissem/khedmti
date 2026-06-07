import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/apiError";
import { logger } from "@/utils/logger";
import * as service from "@/modules/payments/payments.service";
import type { historyQuery } from "@/modules/payments/payments.validators";
import type { z } from "zod";

export async function createIntent(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  sendSuccess(res, await service.createIntent(req.body.orderId, req.user.id), 201);
}

/** Stripe webhook — requires the raw request body + signature header. */
export async function webhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    throw AppError.badRequest("Missing Stripe signature");
  }
  if (!req.rawBody) throw AppError.internal("Raw body unavailable for webhook verification");

  try {
    await service.handleWebhook(req.rawBody, signature);
  } catch (err) {
    logger.warn({ err }, "stripe webhook verification/handling failed");
    throw AppError.badRequest("Webhook error");
  }
  res.json({ received: true });
}

export async function history(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const { page, limit } = req.validated?.query as z.infer<typeof historyQuery>;
  const { items, meta } = await service.history(req.user.id, page, limit);
  sendSuccess(res, { payments: items }, 200, meta);
}

export async function refund(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const order = await service.refund(
    req.params.orderId as string,
    req.body.amountCents,
    req.user.id
  );
  sendSuccess(res, { order });
}
