import type { Prisma, Rarity } from "@prisma/client";
import { prisma } from "@/prisma/client";
import type { ListProductsQuery } from "@/modules/products/products.validators";

const detailInclude = {
  brand: true,
  category: true,
  images: { orderBy: { position: "asc" } },
  specs: true,
  variants: { where: { active: true }, orderBy: { sku: "asc" } },
} satisfies Prisma.ProductInclude;

function buildWhere(q: ListProductsQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { active: true };
  if (q.category) where.category = { slug: q.category };
  if (q.brand) where.brand = { slug: q.brand };
  if (q.platform) where.platform = q.platform;
  if (q.rarity) where.rarity = q.rarity as Rarity;
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    where.priceCents = {
      ...(q.minPrice !== undefined ? { gte: q.minPrice } : {}),
      ...(q.maxPrice !== undefined ? { lte: q.maxPrice } : {}),
    };
  }
  if (q.q) {
    where.OR = [
      { title: { contains: q.q, mode: "insensitive" } },
      { description: { contains: q.q, mode: "insensitive" } },
      { platform: { contains: q.q, mode: "insensitive" } },
    ];
  }
  return where;
}

function buildOrderBy(sort: ListProductsQuery["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { priceCents: "asc" };
    case "price-desc":
      return { priceCents: "desc" };
    case "rating":
      return { avgRating: "desc" };
    case "popular":
      return { reviewCount: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export async function list(q: ListProductsQuery, skip: number, take: number) {
  const where = buildWhere(q);
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: buildOrderBy(q.sort),
      skip,
      take,
      include: { brand: true, category: true, images: { take: 1, orderBy: { position: "asc" } } },
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
}

export function findBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug }, include: detailInclude });
}

export function findById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export function related(categoryId: string, excludeId: string, take = 6) {
  return prisma.product.findMany({
    where: { active: true, categoryId, id: { not: excludeId } },
    take,
    orderBy: { avgRating: "desc" },
    include: { images: { take: 1, orderBy: { position: "asc" } } },
  });
}

export function create(data: Prisma.ProductCreateInput) {
  return prisma.product.create({ data, include: detailInclude });
}

export function update(id: string, data: Prisma.ProductUpdateInput) {
  return prisma.product.update({ where: { id }, data, include: detailInclude });
}

export function softDelete(id: string) {
  return prisma.product.update({ where: { id }, data: { active: false } });
}

export function slugExists(slug: string) {
  return prisma.product.findUnique({ where: { slug }, select: { id: true } });
}

// ── Variants ────────────────────────────────────────────────────────────────
export function createVariant(data: Prisma.ProductVariantCreateInput) {
  return prisma.productVariant.create({ data });
}
export function findVariant(id: string, productId: string) {
  return prisma.productVariant.findFirst({ where: { id, productId } });
}
export function updateVariant(id: string, data: Prisma.ProductVariantUpdateInput) {
  return prisma.productVariant.update({ where: { id }, data });
}
export function deleteVariant(id: string) {
  return prisma.productVariant.delete({ where: { id } });
}

// ── Images ──────────────────────────────────────────────────────────────────
export function createImage(data: Prisma.ProductImageCreateInput) {
  return prisma.productImage.create({ data });
}
export function findImage(id: string, productId: string) {
  return prisma.productImage.findFirst({ where: { id, productId } });
}
export function deleteImage(id: string) {
  return prisma.productImage.delete({ where: { id } });
}
export function countImages(productId: string) {
  return prisma.productImage.count({ where: { productId } });
}

// ── Specs ───────────────────────────────────────────────────────────────────
export function replaceSpecs(productId: string, specs: { key: string; value: string }[]) {
  return prisma.$transaction([
    prisma.productSpec.deleteMany({ where: { productId } }),
    prisma.productSpec.createMany({ data: specs.map((s) => ({ ...s, productId })) }),
  ]);
}
