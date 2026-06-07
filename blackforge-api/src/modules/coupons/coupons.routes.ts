import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import { authenticate, optionalAuthenticate } from "@/middleware/authenticate";
import { requirePermission } from "@/middleware/authorize";
import { PERMISSIONS } from "@/modules/rbac/permissions";
import { idParam, paginationQuery } from "@/validators/common";
import * as ctrl from "@/modules/coupons/coupons.controller";
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "@/modules/coupons/coupons.validators";

export const couponsRouter = Router();

// Public (optional auth so per-user limits can be checked when logged in).
couponsRouter.post(
  "/validate",
  optionalAuthenticate,
  validate({ body: validateCouponSchema }),
  asyncHandler(ctrl.validateCoupon)
);

const admin = [authenticate, requirePermission(PERMISSIONS.COUPON_WRITE)];

couponsRouter.get("/", ...admin, validate({ query: paginationQuery }), asyncHandler(ctrl.list));
couponsRouter.post(
  "/",
  ...admin,
  validate({ body: createCouponSchema }),
  asyncHandler(ctrl.create)
);
couponsRouter.patch(
  "/:id",
  ...admin,
  validate({ params: idParam, body: updateCouponSchema }),
  asyncHandler(ctrl.update)
);
couponsRouter.delete("/:id", ...admin, validate({ params: idParam }), asyncHandler(ctrl.remove));
