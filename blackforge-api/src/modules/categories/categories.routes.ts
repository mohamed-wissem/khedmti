import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import { authenticate } from "@/middleware/authenticate";
import { requirePermission } from "@/middleware/authorize";
import { PERMISSIONS } from "@/modules/rbac/permissions";
import { idParam } from "@/validators/common";
import * as ctrl from "@/modules/categories/categories.controller";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/modules/categories/categories.validators";

export const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler(ctrl.list));

const admin = [authenticate, requirePermission(PERMISSIONS.CATEGORY_WRITE)];

categoriesRouter.post(
  "/",
  ...admin,
  validate({ body: createCategorySchema }),
  asyncHandler(ctrl.create)
);
categoriesRouter.patch(
  "/:id",
  ...admin,
  validate({ params: idParam, body: updateCategorySchema }),
  asyncHandler(ctrl.update)
);
categoriesRouter.delete("/:id", ...admin, validate({ params: idParam }), asyncHandler(ctrl.remove));
