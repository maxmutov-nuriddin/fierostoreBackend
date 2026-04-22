import mongoose from "mongoose";
import { Router } from "express";

import { Card } from "../models/Card.js";
import { Review } from "../models/Review.js";
import { attachUserIfPresent } from "../middleware/auth.js";
import { recordDateEvent } from "../utils/date-records.js";

export const reviewsRouter = Router();

async function syncCardRating(cardId) {
  const stats = await Review.aggregate([
    { $match: { cardId: new mongoose.Types.ObjectId(cardId) } },
    {
      $group: {
        _id: "$cardId",
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  const nextRating = stats[0]?.averageRating ?? 0;
  await Card.findByIdAndUpdate(cardId, { rating: Number(nextRating.toFixed(1)) });
}

reviewsRouter.get("/", async (req, res) => {
  const cardId = String(req.query.cardId ?? "");

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.json([]);
  }

  const reviews = await Review.find({ cardId }).sort({ createdAt: -1 });
  res.json(reviews);
});

reviewsRouter.post("/", attachUserIfPresent, async (req, res) => {
  const cardId = String(req.body.cardId ?? "").trim();
  const author = String(req.body.author ?? "Anonymous").trim() || "Anonymous";
  const rating = Number(req.body.rating ?? 0);
  const comment = String(req.body.comment ?? "").trim();

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: "Valid card id is required." });
  }

  const card = await Card.findById(cardId);
  if (!card) {
    return res.status(404).json({ message: "Card not found." });
  }

  const review = await Review.create({
    cardId,
    userId: req.user?.id ?? null,
    author,
    rating,
    comment
  });

  await syncCardRating(cardId);
  await recordDateEvent({
    entityType: "review",
    entityId: review.id,
    kind: "created",
    meta: { cardId, rating }
  });

  res.status(201).json(review);
});
