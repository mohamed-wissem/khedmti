import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import { authenticate } from "@/middleware/authenticate";
import { requirePermission } from "@/middleware/authorize";
import { PERMISSIONS } from "@/modules/rbac/permissions";
import { idParam } from "@/validators/common";
import * as ctrl from "@/modules/brands/brands.controller";
import { createBrandSchema, updateBrandSchema } from "@/modules/brands/brands.validators";

export const brandsRouter = Router();

brandsRouter.get("/", asyncHandler(ctrl.list));

const admin = [authenticate, requirePermission(PERMISSIONS.BRAND_WRITE)];

brandsRouter.post("/", ...admin, validate({ body: createBrandSchema }), asyncHandler(ctrl.create));
brandsRouter.patch(
  "/:id",
  ...admin,
  validate({ params: idParam, body: updateBrandSchema }),
  asyncHandler(ctrl.update)
);
brandsRouter.delete("/:id", ...admin, validate({ params: idParam }), asyncHandler(ctrl.remove));
