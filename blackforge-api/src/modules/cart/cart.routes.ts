import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import { authenticate, optionalAuthenticate } from "@/middleware/authenticate";
import * as ctrl from "@/modules/cart/cart.controller";
import {
  addItemSchema,
  updateItemSchema,
  itemIdParam,
  mergeSchema,
} from "@/modules/cart/cart.validators";

export const cartRouter = Router();

// Cart works for guests (via x-cart-id header) and members (via Bearer token).
cartRouter.get("/", optionalAuthenticate, asyncHandler(ctrl.getCart));
cartRouter.post(
  "/items",
  optionalAuthenticate,
  validate({ body: addItemSchema }),
  asyncHandler(ctrl.addItem)
);
cartRouter.patch(
  "/items/:itemId",
  optionalAuthenticate,
  validate({ params: itemIdParam, body: updateItemSchema }),
  asyncHandler(ctrl.updateItem)
);
cartRouter.delete(
  "/items/:itemId",
  optionalAuthenticate,
  validate({ params: itemIdParam }),
  asyncHandler(ctrl.removeItem)
);

// Merge a guest cart into the user's cart after login.
cartRouter.post("/merge", authenticate, validate({ body: mergeSchema }), asyncHandler(ctrl.merge));
