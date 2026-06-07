import type { Product, ProductImage, ProductVariant } from "@prisma/client";
import { AppError } from "@/utils/apiError";
import { slugify } from "@/utils/slug";
import { getPageQuery, pageMeta } from "@/utils/pagination";
import { uploadImage, deleteImage } from "@/services/cloudinary.service";
import * as repo from "@/modules/products/products.repository";
import type { ListProductsQuery } from "@/modules/products/products.validators";

export async function list(q: ListProductsQuery) {
  const { skip, take, page, limit } = getPageQuery(q);
  const { items, total } = await repo.list(q, skip, take);
  return { items, meta: pageMeta(total, page, limit) };
}

export async function getBySlug(slug: string) {
  const product = await repo.findBySlug(slug);
  if (!product || !product.active) throw AppError.notFound("Product not found");
  return product;
}

export async function related(slug: string) {
  const product = await repo.findBySlug(slug);
  if (!product) throw AppError.notFound("Product not found");
  return repo.related(product.categoryId, product.id);
}

async function uniqueSlug(title: string, explicit?: string): Promise<string> {
  const base = slugify(explicit ?? title) || "product";
  let slug = base;
  let n = 1;
  while (await repo.slugExists(slug)) slug = `${base}-${++n}`;
  return slug;
}

export async function create(input: {
  title: string;
  slug?: string;
  description?: string;
  platform?: string;
  categoryId: string;
  brandId?: string | null;
  rarity: "COMMON" | "PREMIUM" | "LEGENDARY";
  priceCents: number;
  compareCents?: number | null;
  instant: boolean;
  active: boolean;
}) {
  return repo.create({
    title: input.title,
    slug: await uniqueSlug(input.title, input.slug),
    description: input.description,
    platform: input.platform,
    rarity: input.rarity,
    priceCents: input.priceCents,
    compareCents: input.compareCents ?? null,
    instant: input.instant,
    active: input.active,
    category: { connect: { id: input.categoryId } },
    ...(input.brandId ? { brand: { connect: { id: input.brandId } } } : {}),
  });
}

export async function update(id: string, input: Record<string, unknown>) {
  if (!(await repo.findById(id))) throw AppError.notFound("Product not found");
  const data: Record<string, unknown> = {};
  for (const key of [
    "title",
    "description",
    "platform",
    "rarity",
    "priceCents",
    "compareCents",
    "instant",
    "active",
  ]) {
    if (input[key] !== undefined) data[key] = input[key];
  }
  if (input.slug !== undefined) data.slug = slugify(String(input.slug));
  if (input.categoryId !== undefined) data.category = { connect: { id: input.categoryId } };
  if (input.brandId !== undefined) {
    data.brand = input.brandId ? { connect: { id: input.brandId } } : { disconnect: true };
  }
  return repo.update(id, data);
}

export async function remove(id: string): Promise<void> {
  if (!(await repo.findById(id))) throw AppError.notFound("Product not found");
  await repo.softDelete(id);
}

// ── Variants ────────────────────────────────────────────────────────────────
export async function addVariant(
  productId: string,
  input: {
    sku: string;
    color?: string | null;
    size?: string | null;
    priceCents?: number | null;
    stock: number;
    active: boolean;
  }
): Promise<ProductVariant> {
  if (!(await repo.findById(productId))) throw AppError.notFound("Product not found");
  return repo.createVariant({
    sku: input.sku,
    color: input.color ?? null,
    size: input.size ?? null,
    priceCents: input.priceCents ?? null,
    stock: input.stock,
    active: input.active,
    product: { connect: { id: productId } },
  });
}

export async function updateVariant(
  productId: string,
  variantId: string,
  input: Record<string, unknown>
): Promise<ProductVariant> {
  if (!(await repo.findVariant(variantId, productId))) throw AppError.notFound("Variant not found");
  return repo.updateVariant(variantId, input);
}

export async function removeVariant(productId: string, variantId: string): Promise<void> {
  if (!(await repo.findVariant(variantId, productId))) throw AppError.notFound("Variant not found");
  await repo.deleteVariant(variantId);
}

// ── Images ──────────────────────────────────────────────────────────────────
export async function addImages(
  productId: string,
  files: { buffer: Buffer }[]
): Promise<ProductImage[]> {
  if (!(await repo.findById(productId))) throw AppError.notFound("Product not found");
  if (!files.length) throw AppError.badRequest("No image files provided");

  let position = await repo.countImages(productId);
  const created: ProductImage[] = [];
  for (const file of files) {
    const { url, publicId } = await uploadImage(file.buffer);
    created.push(
      await repo.createImage({
        url,
        publicId,
        position: position++,
        product: { connect: { id: productId } },
      })
    );
  }
  return created;
}

export async function removeImage(productId: string, imageId: string): Promise<void> {
  const image = await repo.findImage(imageId, productId);
  if (!image) throw AppError.notFound("Image not found");
  await deleteImage(image.publicId).catch(() => undefined); // best-effort remote delete
  await repo.deleteImage(imageId);
}

// ── Specs ───────────────────────────────────────────────────────────────────
export async function setSpecs(
  productId: string,
  specs: { key: string; value: string }[]
): Promise<void> {
  if (!(await repo.findById(productId))) throw AppError.notFound("Product not found");
  await repo.replaceSpecs(productId, specs);
}

export type { Product };
