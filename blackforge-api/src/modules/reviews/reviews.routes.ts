import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import { authenticate } from "@/middleware/authenticate";
import { requirePermission } from "@/middleware/authorize";
import { PERMISSIONS } from "@/modules/rbac/permissions";
import * as ctrl from "@/modules/reviews/reviews.controller";
import {
  createReviewSchema,
  updateReviewSchema,
  moderateReviewSchema,
  reviewIdParam,
  productSlugParam,
  listReviewsQuery,
} from "@/modules/reviews/reviews.validators";

export const reviewsRouter = Router();

// Public: approved reviews for a product.
reviewsRouter.get(
  "/product/:slug",
  validate({ params: productSlugParam, query: listReviewsQuery }),
  asyncHandler(ctrl.listForProduct)
);

// Moderation queue (declare before "/:id").
reviewsRouter.get(
  "/pending",
  authenticate,
  requirePermission(PERMISSIONS.REVIEW_MODERATE),
  validate({ query: listReviewsQuery }),
  asyncHandler(ctrl.listPending)
);

reviewsRouter.post(
  "/",
  authenticate,
  validate({ body: createReviewSchema }),
  asyncHandler(ctrl.create)
);
reviewsRouter.patch(
  "/:id",
  authenticate,
  validate({ params: reviewIdParam, body: updateReviewSchema }),
  asyncHandler(ctrl.update)
);
reviewsRouter.delete(
  "/:id",
  authenticate,
  validate({ params: reviewIdParam }),
  asyncHandler(ctrl.remove)
);
reviewsRouter.patch(
  "/:id/moderate",
  authenticate,
  requirePermission(PERMISSIONS.REVIEW_MODERATE),
  validate({ params: reviewIdParam, body: moderateReviewSchema }),
  asyncHandler(ctrl.moderate)
);
