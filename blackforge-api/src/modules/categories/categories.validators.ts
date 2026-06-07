import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80).optional(),
  parentId: z.string().min(1).optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();
