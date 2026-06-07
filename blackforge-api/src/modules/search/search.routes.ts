import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import * as ctrl from "@/modules/search/search.controller";
import { searchQuery, suggestQuery } from "@/modules/search/search.validators";

export const searchRouter = Router();

searchRouter.get("/", validate({ query: searchQuery }), asyncHandler(ctrl.search));
searchRouter.get("/suggest", validate({ query: suggestQuery }), asyncHandler(ctrl.suggest));
