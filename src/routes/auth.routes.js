import bcrypt from "bcryptjs";
import { Router } from "express";

import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { buildSessionPayload } from "../utils/auth.js";
import { recordDateEvent } from "../utils/date-records.js";
import { normalizePhone, phoneToEmail } from "../utils/formatters.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const firstName = String(req.body.firstName ?? "").trim();
  const lastName = String(req.body.lastName ?? "").trim();
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password ?? "");

  if (!firstName || !lastName || !phone || password.length < 4) {
    return res.status(400).json({ message: "First name, last name, phone, and password are required." });
  }

  const existing = await User.findOne({
    $or: [{ phone }, { email: phoneToEmail(phone) }]
  });

  if (existing) {
    return res.status(409).json({ message: "This phone number is already registered." });
  }

  const user = await User.create({
    firstName,
    lastName,
    phone,
    email: phoneToEmail(phone),
    passwordHash: await bcrypt.hash(password, 10),
    role: "customer"
  });

  await recordDateEvent({
    entityType: "user",
    entityId: user.id,
    kind: "registered",
    meta: { phone: user.phone }
  });

  res.status(201).json(buildSessionPayload(user));
});

authRouter.post("/login", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password ?? "");

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone and password are required." });
  }

  const user = await User.findOne({
    $or: [{ phone }, { email: phoneToEmail(phone) }]
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Incorrect phone number or password." });
  }

  user.lastLoginAt = new Date();
  await user.save();

  await recordDateEvent({
    entityType: "user",
    entityId: user.id,
    kind: "login",
    meta: { role: user.role }
  });

  res.json(buildSessionPayload(user));
});

authRouter.post("/admin/login", async (req, res) => {
  const email = String(req.body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email, role: "admin" });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Admin email or password is incorrect." });
  }

  user.lastLoginAt = new Date();
  await user.save();

  await recordDateEvent({
    entityType: "user",
    entityId: user.id,
    kind: "admin-login",
    meta: { role: "admin" }
  });

  res.json(buildSessionPayload(user));
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json(buildSessionPayload(req.user));
});

authRouter.post("/logout", (_req, res) => {
  res.json({ success: true });
});
