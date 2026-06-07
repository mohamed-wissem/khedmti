import type { Prisma } from "@prisma/client";
import { prisma } from "@/prisma/client";

export function findAll() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function findById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export function findBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export function create(data: Prisma.CategoryCreateInput) {
  return prisma.category.create({ data });
}

export function update(id: string, data: Prisma.CategoryUpdateInput) {
  return prisma.category.update({ where: { id }, data });
}

export function remove(id: string) {
  return prisma.category.delete({ where: { id } });
}

export function countProducts(categoryId: string) {
  return prisma.product.count({ where: { categoryId } });
}
