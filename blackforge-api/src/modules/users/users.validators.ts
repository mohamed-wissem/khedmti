import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  image: z.string().url().max(500).optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const addressSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING"]).default("SHIPPING"),
  fullName: z.string().trim().min(1).max(120),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().max(120).optional(),
  postalCode: z.string().trim().min(1).max(32),
  country: z.string().trim().min(2).max(2).toUpperCase(),
  phone: z.string().trim().max(32).optional(),
  isDefault: z.boolean().default(false),
});

export const addressUpdateSchema = addressSchema.partial();

export const idParamSchema = z.object({ id: z.string().min(1) });
