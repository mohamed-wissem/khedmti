import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import * as service from "@/modules/categories/categories.service";

export async function list(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, { categories: await service.listTree() });
}

export async function create(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { category: await service.create(req.body) }, 201);
}

export async function update(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { category: await service.update(req.params.id as string, req.body) });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await service.remove(req.params.id as string);
  sendSuccess(res, { message: "Category deleted" });
}
