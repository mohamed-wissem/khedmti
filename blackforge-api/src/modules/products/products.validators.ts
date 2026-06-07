import { z } from "zod";

export const productSort = z.enum(["popular", "newest", "price-asc", "price-desc", "rating"]);

export const listProductsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(), // category slug
  brand: z.string().optional(), // brand slug
  platform: z.string().optional(),
  rarity: z.enum(["COMMON", "PREMIUM", "LEGENDARY"]).optional(),
  minPrice: z.coerce.number().int().min(0).optional(), // cents
  maxPrice: z.coerce.number().int().min(0).optional(), // cents
  sort: productSort.default("newest"),
  q: z.string().trim().optional(),
});

export const createProductSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(80).optional(),
  description: z.string().max(5000).optional(),
  platform: z.string().max(80).optional(),
  categoryId: z.string().min(1),
  brandId: z.string().min(1).optional().nullable(),
  rarity: z.enum(["COMMON", "PREMIUM", "LEGENDARY"]).default("COMMON"),
  priceCents: z.number().int().min(0),
  compareCents: z.number().int().min(0).optional().nullable(),
  instant: z.boolean().default(true),
  active: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const variantSchema = z.object({
  sku: z.string().trim().min(1).max(80),
  color: z.string().trim().max(40).optional().nullable(),
  size: z.string().trim().max(40).optional().nullable(),
  priceCents: z.number().int().min(0).optional().nullable(),
  stock: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const variantUpdateSchema = variantSchema.partial();

export const specsSchema = z.object({
  specs: z
    .array(
      z.object({ key: z.string().trim().min(1).max(80), value: z.string().trim().min(1).max(500) })
    )
    .max(50),
});

export const productIdParam = z.object({ id: z.string().min(1) });
export const variantIdParam = z.object({ id: z.string().min(1), variantId: z.string().min(1) });
export const imageIdParam = z.object({ id: z.string().min(1), imageId: z.string().min(1) });

export type ListProductsQuery = z.infer<typeof listProductsQuery>;
