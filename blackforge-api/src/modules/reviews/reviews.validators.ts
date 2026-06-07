import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().max(4000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().max(4000).optional(),
});

export const moderateReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const reviewIdParam = z.object({ id: z.string().min(1) });
export const productSlugParam = z.object({ slug: z.string().min(1) });

export const listReviewsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
