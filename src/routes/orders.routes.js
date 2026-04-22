import { Router } from "express";

import { Order } from "../models/Order.js";
import { attachUserIfPresent, requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { recordDateEvent } from "../utils/date-records.js";
import { normalizePhone } from "../utils/formatters.js";

export const ordersRouter = Router();

ordersRouter.get("/", requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
}));

ordersRouter.post("/", attachUserIfPresent, asyncHandler(async (req, res) => {
  const customerName = String(req.body.customerName ?? "").trim();
  const phone = normalizePhone(req.body.phone);
  const address = String(req.body.address ?? "").trim();
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const totalPrice = Number(req.body.totalPrice ?? 0);
  const status = String(req.body.status ?? "new");

  if (!customerName || !phone || !address || !items.length) {
    return res.status(400).json({ message: "Name, phone, address, and items are required." });
  }

  const order = await Order.create({
    userId: req.user?.id ?? null,
    customerName,
    phone,
    address,
    items,
    totalPrice,
    status
  });

  await recordDateEvent({
    entityType: "order",
    entityId: order.id,
    kind: "created",
    meta: {
      totalPrice: order.totalPrice,
      items: order.items.length
    }
  });

  res.status(201).json(order);
}));

ordersRouter.patch("/:id/status", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const nextStatus = String(req.body.status ?? "");
  const allowed = ["new", "confirmed", "shipped", "delivered"];

  if (!allowed.includes(nextStatus)) {
    return res.status(400).json({ message: "Invalid order status." });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  order.status = nextStatus;
  await order.save();

  await recordDateEvent({
    entityType: "order",
    entityId: order.id,
    kind: "status-changed",
    meta: { status: nextStatus }
  });

  res.json(order);
}));
