import type { Category } from "@prisma/client";
import { AppError } from "@/utils/apiError";
import { slugify } from "@/utils/slug";
import * as repo from "@/modules/categories/categories.repository";

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

/** Return categories as a nested tree (roots → children). */
export async function listTree(): Promise<CategoryNode[]> {
  const all = await repo.findAll();
  const byId = new Map<string, CategoryNode>();
  all.forEach((c) => byId.set(c.id, { ...c, children: [] }));
  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

async function uniqueSlug(name: string, explicit?: string): Promise<string> {
  const base = slugify(explicit ?? name) || "category";
  let slug = base;
  let n = 1;
  while (await repo.findBySlug(slug)) slug = `${base}-${++n}`;
  return slug;
}

export async function create(input: {
  name: string;
  slug?: string;
  parentId?: string | null;
}): Promise<Category> {
  if (input.parentId && !(await repo.findById(input.parentId))) {
    throw AppError.badRequest("Parent category does not exist");
  }
  return repo.create({
    name: input.name,
    slug: await uniqueSlug(input.name, input.slug),
    ...(input.parentId ? { parent: { connect: { id: input.parentId } } } : {}),
  });
}

export async function update(
  id: string,
  input: { name?: string; slug?: string; parentId?: string | null }
): Promise<Category> {
  const existing = await repo.findById(id);
  if (!existing) throw AppError.notFound("Category not found");
  if (input.parentId === id) throw AppError.badRequest("A category cannot be its own parent");

  return repo.update(id, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.slug !== undefined ? { slug: slugify(input.slug) } : {}),
    ...(input.parentId !== undefined
      ? input.parentId
        ? { parent: { connect: { id: input.parentId } } }
        : { parent: { disconnect: true } }
      : {}),
  });
}

export async function remove(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw AppError.notFound("Category not found");
  if ((await repo.countProducts(id)) > 0) {
    throw AppError.conflict("Cannot delete a category that still has products");
  }
  await repo.remove(id);
}
