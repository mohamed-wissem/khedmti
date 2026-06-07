import type { Prisma } from "@prisma/client";
import { prisma } from "@/prisma/client";

export function findAll() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } });
}
export function findById(id: string) {
  return prisma.brand.findUnique({ where: { id } });
}
export function findBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug } });
}
export function create(data: Prisma.BrandCreateInput) {
  return prisma.brand.create({ data });
}
export function update(id: string, data: Prisma.BrandUpdateInput) {
  return prisma.brand.update({ where: { id }, data });
}
export function remove(id: string) {
  return prisma.brand.delete({ where: { id } });
}
export function countProducts(brandId: string) {
  return prisma.product.count({ where: { brandId } });
}
