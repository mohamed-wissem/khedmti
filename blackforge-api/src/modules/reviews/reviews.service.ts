import { AppError } from "@/utils/apiError";
import { getPageQuery, pageMeta } from "@/utils/pagination";
import { recordAudit } from "@/services/audit.service";
import * as productsRepo from "@/modules/products/products.repository";
import { PERMISSIONS } from "@/modules/rbac/permissions";
import type { AuthUser } from "@/modules/auth/auth.types";
import * as repo from "@/modules/reviews/reviews.repository";

export async function create(
  userId: string,
  input: { productId: string; rating: number; title?: string; body?: string }
) {
  const product = await productsRepo.findById(input.productId);
  if (!product) throw AppError.notFound("Product not found");
  if (!(await repo.hasPurchased(userId, input.productId))) {
    throw AppError.forbidden("Only verified purchasers can review this product");
  }
  if (await repo.findByUserProduct(userId, input.productId)) {
    throw AppError.conflict("You have already reviewed this product");
  }
  // Created PENDING; visible (and counted) only once moderated.
  return repo.create({
    rating: input.rating,
    title: input.title,
    body: input.body,
    product: { connect: { id: input.productId } },
    user: { connect: { id: userId } },
  });
}

export async function listForProduct(slug: string, page: number, limit: number) {
  const product = await productsRepo.findBySlug(slug);
  if (!product) throw AppError.notFound("Product not found");
  const { skip, take } = getPageQuery({ page, limit });
  const { items, total } = await repo.listApprovedByProduct(product.id, skip, take);
  return { items, meta: pageMeta(total, page, limit) };
}

export async function update(
  userId: string,
  id: string,
  input: { rating?: number; title?: string; body?: string }
) {
  const review = await repo.findById(id);
  if (!review) throw AppError.notFound("Review not found");
  if (review.userId !== userId) throw AppError.forbidden("You can only edit your own review");

  const updated = await repo.update(id, { ...input, status: "PENDING" });
  await repo.recomputeRating(review.productId); // edited review leaves the approved set
  return updated;
}

export async function remove(id: string, user: AuthUser): Promise<void> {
  const review = await repo.findById(id);
  if (!review) throw AppError.notFound("Review not found");
  const isOwner = review.userId === user.id;
  const canModerate = user.permissions.includes(PERMISSIONS.REVIEW_MODERATE);
  if (!isOwner && !canModerate) throw AppError.forbidden("Not allowed");
  await repo.remove(id);
  await repo.recomputeRating(review.productId);
}

export async function listPending(page: number, limit: number) {
  const { skip, take } = getPageQuery({ page, limit });
  const { items, total } = await repo.listPending(skip, take);
  return { items, meta: pageMeta(total, page, limit) };
}

export async function moderate(id: string, status: "APPROVED" | "REJECTED", moderatorId: string) {
  const review = await repo.findById(id);
  if (!review) throw AppError.notFound("Review not found");
  const updated = await repo.update(id, { status });
  await repo.recomputeRating(review.productId);
  await recordAudit({
    userId: moderatorId,
    action: "review.moderate",
    entity: "review",
    entityId: id,
    metadata: { status },
  });
  return updated;
}
