import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import { authenticate, optionalAuthenticate } from "@/middleware/authenticate";
import { requirePermission } from "@/middleware/authorize";
import { PERMISSIONS } from "@/modules/rbac/permissions";
import * as ctrl from "@/modules/orders/orders.controller";
import {
  createOrderSchema,
  listOrdersQuery,
  adminListQuery,
  updateStatusSchema,
  orderIdParam,
} from "@/modules/orders/orders.validators";

export const ordersRouter = Router();

// Checkout — members (Bearer) or guests (x-cart-id header).
ordersRouter.post(
  "/",
  optionalAuthenticate,
  validate({ body: createOrderSchema }),
  asyncHandler(ctrl.create)
);

// Admin listing must be declared before "/:id".
ordersRouter.get(
  "/all",
  authenticate,
  requirePermission(PERMISSIONS.ORDER_READ_ALL),
  validate({ query: adminListQuery }),
  asyncHandler(ctrl.listAll)
);

ordersRouter.get("/", authenticate, validate({ query: listOrdersQuery }), asyncHandler(ctrl.list));
ordersRouter.get("/:id", authenticate, validate({ params: orderIdParam }), asyncHandler(ctrl.get));
ordersRouter.get(
  "/:id/track",
  authenticate,
  validate({ params: orderIdParam }),
  asyncHandler(ctrl.track)
);
ordersRouter.post(
  "/:id/cancel",
  authenticate,
  validate({ params: orderIdParam }),
  asyncHandler(ctrl.cancel)
);
ordersRouter.patch(
  "/:id/status",
  authenticate,
  requirePermission(PERMISSIONS.ORDER_UPDATE),
  validate({ params: orderIdParam, body: updateStatusSchema }),
  asyncHandler(ctrl.updateStatus)
);
