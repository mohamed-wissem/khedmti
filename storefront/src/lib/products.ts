import type { Prisma, ProductCategory, Rarity } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductSort = "popular" | "price-asc" | "price-desc" | "newest";

export interface ProductFilters {
  category?: ProductCategory;
  platform?: string;
  rarity?: Rarity;
  maxPriceCents?: number;
  sort?: ProductSort;
  search?: string;
}

const orderByFor = (sort?: ProductSort): Prisma.ProductOrderByWithRelationInput => {
  switch (sort) {
    case "price-asc":
      return { priceCents: "asc" };
    case "price-desc":
      return { priceCents: "desc" };
    case "newest":
      return { createdAt: "desc" };
    default:
      // "popular" — placeholder until real order/view metrics exist
      return { createdAt: "desc" };
  }
};

export async function listProducts(filters: ProductFilters = {}) {
  const where: Prisma.ProductWhereInput = { active: true };
  if (filters.category) where.category = filters.category;
  if (filters.platform) where.platform = filters.platform;
  if (filters.rarity) where.rarity = filters.rarity;
  if (filters.maxPriceCents) where.priceCents = { lte: filters.maxPriceCents };
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { platform: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  return prisma.product.findMany({ where, orderBy: orderByFor(filters.sort) });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

/** Same-category products, excluding the current one. */
export async function getRelatedProducts(category: ProductCategory, excludeId: string, take = 5) {
  return prisma.product.findMany({
    where: { active: true, category, id: { not: excludeId } },
    take,
    orderBy: { createdAt: "desc" },
  });
}

/** Distinct platform values for the filter rail. */
export async function listPlatforms(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, platform: { not: null } },
    distinct: ["platform"],
    select: { platform: true },
    orderBy: { platform: "asc" },
  });
  return rows.map((r) => r.platform!).filter(Boolean);
}

export async function searchProducts(q: string, take = 8) {
  if (!q.trim()) return [];
  return prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { platform: { contains: q, mode: "insensitive" } },
      ],
    },
    take,
    orderBy: { createdAt: "desc" },
  });
}
