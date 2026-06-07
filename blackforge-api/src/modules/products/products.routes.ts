import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import { authenticate } from "@/middleware/authenticate";
import { requirePermission } from "@/middleware/authorize";
import { imageUpload } from "@/middleware/upload";
import { PERMISSIONS } from "@/modules/rbac/permissions";
import { slugParam } from "@/validators/common";
import * as ctrl from "@/modules/products/products.controller";
import {
  listProductsQuery,
  createProductSchema,
  updateProductSchema,
  variantSchema,
  variantUpdateSchema,
  specsSchema,
  productIdParam,
  variantIdParam,
  imageIdParam,
} from "@/modules/products/products.validators";

export const productsRouter = Router();

const admin = [authenticate, requirePermission(PERMISSIONS.PRODUCT_WRITE)];

// ── Public ────────────────────────────────────────────────────────────────
productsRouter.get("/", validate({ query: listProductsQuery }), asyncHandler(ctrl.list));
productsRouter.get("/:slug", validate({ params: slugParam }), asyncHandler(ctrl.getBySlug));
productsRouter.get("/:slug/related", validate({ params: slugParam }), asyncHandler(ctrl.related));

// ── Admin: products ─────────────────────────────────────────────────────────
productsRouter.post(
  "/",
  ...admin,
  validate({ body: createProductSchema }),
  asyncHandler(ctrl.create)
);
productsRouter.patch(
  "/:id",
  ...admin,
  validate({ params: productIdParam, body: updateProductSchema }),
  asyncHandler(ctrl.update)
);
productsRouter.delete(
  "/:id",
  ...admin,
  validate({ params: productIdParam }),
  asyncHandler(ctrl.remove)
);

// ── Admin: variants ─────────────────────────────────────────────────────────
productsRouter.post(
  "/:id/variants",
  ...admin,
  validate({ params: productIdParam, body: variantSchema }),
  asyncHandler(ctrl.addVariant)
);
productsRouter.patch(
  "/:id/variants/:variantId",
  ...admin,
  validate({ params: variantIdParam, body: variantUpdateSchema }),
  asyncHandler(ctrl.updateVariant)
);
productsRouter.delete(
  "/:id/variants/:variantId",
  ...admin,
  validate({ params: variantIdParam }),
  asyncHandler(ctrl.removeVariant)
);

// ── Admin: images & specs ───────────────────────────────────────────────────
productsRouter.post(
  "/:id/images",
  ...admin,
  validate({ params: productIdParam }),
  imageUpload.array("images", 8),
  asyncHandler(ctrl.uploadImages)
);
productsRouter.delete(
  "/:id/images/:imageId",
  ...admin,
  validate({ params: imageIdParam }),
  asyncHandler(ctrl.removeImage)
);
productsRouter.put(
  "/:id/specs",
  ...admin,
  validate({ params: productIdParam, body: specsSchema }),
  asyncHandler(ctrl.setSpecs)
);
