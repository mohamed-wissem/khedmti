import { z } from "zod";

const base = z.object({
  code: z.string().trim().min(3).max(40).toUpperCase(),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().int().positive(),
  maxRedemptions: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().optional().nullable(),
  minSpendCents: z.number().int().min(0).optional().nullable(),
  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  active: z.boolean().default(true),
});

export const createCouponSchema = base.refine(
  (d) => d.type !== "PERCENT" || (d.value >= 1 && d.value <= 100),
  { message: "Percent value must be between 1 and 100", path: ["value"] }
);

export const updateCouponSchema = base.partial();

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1).toUpperCase(),
  subtotalCents: z.number().int().min(0),
});
