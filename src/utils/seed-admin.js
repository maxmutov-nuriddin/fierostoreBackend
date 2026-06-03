import bcrypt from "bcryptjs";

import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { normalizePhone, phoneToEmail } from "./formatters.js";

export async function ensureAdminUser() {
  if (!env.adminEmail || !env.adminPassword) {
    return;
  }

  // Store the phone in normalized (digits-only) form so the admin can sign in
  // through the ordinary phone-based login — no separate admin login needed.
  const adminPhone = normalizePhone(env.adminPhone);
  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  const existing = await User.findOne({ email: env.adminEmail });

  if (!existing) {
    await User.create({
      firstName: "Fiero",
      lastName: "Admin",
      phone: adminPhone,
      email: env.adminEmail,
      passwordHash,
      role: "admin"
    });
    return;
  }

  existing.role = "admin";
  existing.passwordHash = passwordHash;
  existing.phone = adminPhone || existing.phone;
  existing.email = env.adminEmail || phoneToEmail(existing.phone);
  await existing.save();
}
