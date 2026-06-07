import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/apiError";
import * as service from "@/modules/products/products.service";
import type { ListProductsQuery } from "@/modules/products/products.validators";

export async function list(req: Request, res: Response): Promise<void> {
  const query = req.validated?.query as ListProductsQuery;
  const { items, meta } = await service.list(query);
  sendSuccess(res, { products: items }, 200, meta);
}

export async function getBySlug(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { product: await service.getBySlug(req.params.slug as string) });
}

export async function related(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { products: await service.related(req.params.slug as string) });
}

export async function create(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { product: await service.create(req.body) }, 201);
}

export async function update(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { product: await service.update(req.params.id as string, req.body) });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await service.remove(req.params.id as string);
  sendSuccess(res, { message: "Product archived" });
}

export async function addVariant(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { variant: await service.addVariant(req.params.id as string, req.body) }, 201);
}

export async function updateVariant(req: Request, res: Response): Promise<void> {
  const variant = await service.updateVariant(
    req.params.id as string,
    req.params.variantId as string,
    req.body
  );
  sendSuccess(res, { variant });
}

export async function removeVariant(req: Request, res: Response): Promise<void> {
  await service.removeVariant(req.params.id as string, req.params.variantId as string);
  sendSuccess(res, { message: "Variant deleted" });
}

export async function uploadImages(req: Request, res: Response): Promise<void> {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) throw AppError.badRequest("Attach one or more files under the 'images' field");
  const images = await service.addImages(
    req.params.id as string,
    files.map((f) => ({ buffer: f.buffer }))
  );
  sendSuccess(res, { images }, 201);
}

export async function removeImage(req: Request, res: Response): Promise<void> {
  await service.removeImage(req.params.id as string, req.params.imageId as string);
  sendSuccess(res, { message: "Image removed" });
}

export async function setSpecs(req: Request, res: Response): Promise<void> {
  await service.setSpecs(req.params.id as string, req.body.specs);
  sendSuccess(res, { message: "Specs updated" });
}
