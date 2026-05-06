import fs from "fs";
import path from "path";

import mongoose from "mongoose";
import { Router } from "express";

import { Card } from "../models/Card.js";
import { DateRecord } from "../models/DateRecord.js";
import { Review } from "../models/Review.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { asyncHandler } from "../utils/async-handler.js";
import { buildUniqueCardSlug } from "../utils/cards.js";
import { recordDateEvent } from "../utils/date-records.js";
import { parseCsv } from "../utils/formatters.js";

export const cardsRouter = Router();

function buildCardQuery(query) {
  const filters = {};

  if (query.category && query.category !== "All") {
    filters.category = query.category;
  }

  if (query.cardType && query.cardType !== "All") {
    filters.cardType = query.cardType;
  }

  if (query.featured === "true") {
    filters.featured = true;
  }

  if (query.isNewDrop === "true") {
    filters.isNewDrop = true;
  }

  return filters;
}

function buildCardSort(sort) {
  if (sort === "price-low") return { price: 1, createdAt: -1 };
  if (sort === "price-high") return { price: -1, createdAt: -1 };
  if (sort === "priority") return { sortPriority: -1, createdAt: -1 };
  return { createdAt: -1 };
}

async function findCardByIdOrSlug(identifier) {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await Card.findById(identifier);
    if (byId) return byId;
  }

  return Card.findOne({ slug: identifier });
}

function isValidRating(value) {
  return Number.isFinite(value) && value >= 0 && value <= 5;
}

function normalizeCardInput(body) {
  return {
    title: String(body.title ?? "").trim(),
    price: Number(body.price ?? 0),
    images: Array.isArray(body.images) ? body.images : [],
    sizes: Array.isArray(body.sizes) ? body.sizes : parseCsv(body.sizes),
    colors: Array.isArray(body.colors) ? body.colors : parseCsv(body.colors),
    description: String(body.description ?? "").trim(),
    category: String(body.category ?? "").trim() || "T-shirts",
    cardType: String(body.cardType ?? "").trim() || "standard",
    tags: Array.isArray(body.tags) ? body.tags : parseCsv(body.tags),
    featured: Boolean(body.featured),
    isNewDrop: Boolean(body.isNewDrop),
    rating: Number(body.rating ?? 0),
    sortPriority: Number(body.sortPriority ?? 0)
  };
}

cardsRouter.get("/", asyncHandler(async (req, res) => {
  const cards = await Card.find(buildCardQuery(req.query)).sort(buildCardSort(req.query.sort));
  res.json(cards);
}));

cardsRouter.get("/meta/filter-options", asyncHandler(async (_req, res) => {
  const [categories, cardTypes, colors, sizes] = await Promise.all([
    Card.distinct("category"),
    Card.distinct("cardType"),
    Card.distinct("colors"),
    Card.distinct("sizes")
  ]);

  res.json({
    categories: categories.filter(Boolean).sort(),
    cardTypes: cardTypes.filter(Boolean).sort(),
    colors: colors.filter(Boolean),
    sizes: sizes.filter(Boolean)
  });
}));

cardsRouter.get("/:id", asyncHandler(async (req, res) => {
  const card = await findCardByIdOrSlug(req.params.id);

  if (!card) {
    return res.status(404).json({ message: "Card not found." });
  }

  res.json(card);
}));

cardsRouter.post("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const input = normalizeCardInput(req.body);

  if (!input.title || !input.description) {
    return res.status(400).json({ message: "Card title and description are required." });
  }

  if (!isValidRating(input.rating)) {
    return res.status(400).json({ message: "Rating must be between 0 and 5." });
  }

  const card = await Card.create({
    ...input,
    slug: await buildUniqueCardSlug(input.title)
  });

  await recordDateEvent({
    entityType: "card",
    entityId: card.id,
    kind: "created",
    meta: {
      title: card.title,
      cardType: card.cardType
    }
  });

  res.status(201).json(card);
}));

cardsRouter.put("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Card not found." });
  }

  const card = await Card.findById(req.params.id);

  if (!card) {
    return res.status(404).json({ message: "Card not found." });
  }

  const input = normalizeCardInput(req.body);

  if (!isValidRating(input.rating)) {
    return res.status(400).json({ message: "Rating must be between 0 and 5." });
  }

  card.title = input.title || card.title;
  card.slug = await buildUniqueCardSlug(card.title, card.id);
  card.price = Number.isFinite(input.price) ? input.price : card.price;
  card.images = input.images.length ? input.images : card.images;
  card.sizes = input.sizes.length ? input.sizes : card.sizes;
  card.colors = input.colors.length ? input.colors : card.colors;
  card.description = input.description || card.description;
  card.category = input.category || card.category;
  card.cardType = input.cardType || card.cardType;
  card.tags = input.tags;
  card.featured = input.featured;
  card.isNewDrop = input.isNewDrop;
  card.rating = input.rating;
  card.sortPriority = input.sortPriority;
  await card.save();

  await recordDateEvent({
    entityType: "card",
    entityId: card.id,
    kind: "updated",
    meta: {
      title: card.title,
      cardType: card.cardType
    }
  });

  res.json(card);
}));

cardsRouter.delete("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Card not found." });
  }

  const card = await Card.findById(req.params.id);

  if (!card) {
    return res.status(404).json({ message: "Card not found." });
  }

  for (const imagePath of card.images) {
    if (imagePath.startsWith("/uploads/")) {
      try {
        fs.unlinkSync(path.resolve(imagePath.slice(1)));
      } catch {
        // File already gone; continue
      }
    }
  }

  await Review.deleteMany({ cardId: card._id });
  await DateRecord.deleteMany({ entityType: "card", entityId: card.id });
  await card.deleteOne();

  await recordDateEvent({
    entityType: "card",
    entityId: req.params.id,
    kind: "deleted"
  });

  res.json({ success: true });
}));

cardsRouter.post("/:id/images", requireAuth, requireAdmin, upload.array("images", 8), asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    for (const file of req.files ?? []) {
      try { fs.unlinkSync(path.resolve(file.path)); } catch { /* already gone */ }
    }
    return res.status(404).json({ message: "Card not found." });
  }

  const card = await Card.findById(req.params.id);

  if (!card) {
    for (const file of req.files ?? []) {
      try { fs.unlinkSync(path.resolve(file.path)); } catch { /* already gone */ }
    }

    return res.status(404).json({ message: "Card not found." });
  }

  const imagePaths = (req.files ?? []).map((file) => `/uploads/cards/${path.basename(file.path)}`);
  card.images = [...card.images, ...imagePaths];
  await card.save();

  await recordDateEvent({
    entityType: "card",
    entityId: card.id,
    kind: "images-uploaded",
    meta: { count: imagePaths.length }
  });

  res.status(201).json({ images: card.images });
}));
