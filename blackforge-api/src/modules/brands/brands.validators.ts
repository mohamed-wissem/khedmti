import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80).optional(),
  logoUrl: z.string().url().max(500).optional().nullable(),
});

export const updateBrandSchema = createBrandSchema.partial();
