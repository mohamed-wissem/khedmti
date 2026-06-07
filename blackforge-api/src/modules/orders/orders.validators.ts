import { z } from "zod";

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "FULFILLED",
  "SHIPPED",
  "REFUNDED",
  "CANCELLED",
] as const;

export const createOrderSchema = z.object({
  email: z.string().email().optional(),
  couponCode: z.string().trim().optional(),
  addressId: z.string().min(1).optional(),
});

export const listOrdersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminListQuery = listOrdersQuery.extend({
  status: z.enum(ORDER_STATUSES).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  trackingCode: z.string().trim().max(120).optional(),
});

export const orderIdParam = z.object({ id: z.string().min(1) });
