import { AppError } from "@/utils/apiError";
import * as productRepo from "@/modules/products/products.repository";
import * as repo from "@/modules/wishlist/wishlist.repository";

export function list(userId: string) {
  return repo.list(userId);
}

export async function add(userId: string, productId: string) {
  const product = await productRepo.findById(productId);
  if (!product) throw AppError.notFound("Product not found");
  await repo.add(userId, productId);
  return { wishlisted: true };
}

export async function remove(userId: string, productId: string) {
  await repo.remove(userId, productId);
  return { wishlisted: false };
}
