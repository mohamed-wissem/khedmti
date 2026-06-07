import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import { authenticate } from "@/middleware/authenticate";
import { requirePermission } from "@/middleware/authorize";
import { PERMISSIONS } from "@/modules/rbac/permissions";
import * as ctrl from "@/modules/payments/payments.controller";
import {
  createIntentSchema,
  refundSchema,
  orderIdParam,
  historyQuery,
} from "@/modules/payments/payments.validators";

export const paymentsRouter = Router();

// Stripe webhook — public; verified via signature + raw body (captured in app.ts).
paymentsRouter.post("/webhook", asyncHandler(ctrl.webhook));

paymentsRouter.post(
  "/intent",
  authenticate,
  validate({ body: createIntentSchema }),
  asyncHandler(ctrl.createIntent)
);

paymentsRouter.get(
  "/history",
  authenticate,
  validate({ query: historyQuery }),
  asyncHandler(ctrl.history)
);

paymentsRouter.post(
  "/:orderId/refund",
  authenticate,
  requirePermission(PERMISSIONS.ORDER_REFUND),
  validate({ params: orderIdParam, body: refundSchema }),
  asyncHandler(ctrl.refund)
);
