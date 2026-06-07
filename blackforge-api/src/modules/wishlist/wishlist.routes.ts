import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import * as ctrl from "@/modules/wishlist/wishlist.controller";

const productIdParam = z.object({ productId: z.string().min(1) });

// Mounted under the users router, which already requires authentication.
export const wishlistRouter = Router();

wishlistRouter.get("/", asyncHandler(ctrl.list));
wishlistRouter.post("/:productId", validate({ params: productIdParam }), asyncHandler(ctrl.add));
wishlistRouter.delete(
  "/:productId",
  validate({ params: productIdParam }),
  asyncHandler(ctrl.remove)
);
