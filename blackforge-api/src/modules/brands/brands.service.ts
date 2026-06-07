import type { Brand } from "@prisma/client";
import { AppError } from "@/utils/apiError";
import { slugify } from "@/utils/slug";
import * as repo from "@/modules/brands/brands.repository";

export function list(): Promise<Brand[]> {
  return repo.findAll();
}

async function uniqueSlug(name: string, explicit?: string): Promise<string> {
  const base = slugify(explicit ?? name) || "brand";
  let slug = base;
  let n = 1;
  while (await repo.findBySlug(slug)) slug = `${base}-${++n}`;
  return slug;
}

export async function create(input: {
  name: string;
  slug?: string;
  logoUrl?: string | null;
}): Promise<Brand> {
  return repo.create({
    name: input.name,
    slug: await uniqueSlug(input.name, input.slug),
    logoUrl: input.logoUrl ?? null,
  });
}

export async function update(
  id: string,
  input: { name?: string; slug?: string; logoUrl?: string | null }
): Promise<Brand> {
  if (!(await repo.findById(id))) throw AppError.notFound("Brand not found");
  return repo.update(id, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.slug !== undefined ? { slug: slugify(input.slug) } : {}),
    ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
  });
}

export async function remove(id: string): Promise<void> {
  if (!(await repo.findById(id))) throw AppError.notFound("Brand not found");
  if ((await repo.countProducts(id)) > 0) {
    throw AppError.conflict("Cannot delete a brand that still has products");
  }
  await repo.remove(id);
}
