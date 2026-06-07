import { z } from "zod";

export const createIntentSchema = z.object({ orderId: z.string().min(1) });

export const refundSchema = z.object({
  amountCents: z.number().int().positive().optional(),
});

export const orderIdParam = z.object({ orderId: z.string().min(1) });

export const historyQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
