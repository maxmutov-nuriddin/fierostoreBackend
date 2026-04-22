import { Router } from "express";

import { DateRecord } from "../models/DateRecord.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const datesRouter = Router();

datesRouter.get("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const entityType = req.query.entityType ? String(req.query.entityType) : undefined;
  const entityId = req.query.entityId ? String(req.query.entityId) : undefined;
  const kind = req.query.kind ? String(req.query.kind) : undefined;
  const limit = Math.min(Number(req.query.limit ?? 100), 500);

  const filters = {
    ...(entityType ? { entityType } : {}),
    ...(entityId ? { entityId } : {}),
    ...(kind ? { kind } : {})
  };

  const records = await DateRecord.find(filters).sort({ date: -1 }).limit(limit);
  res.json(records);
}));
