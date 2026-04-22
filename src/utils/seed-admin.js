import bcrypt from "bcryptjs";

import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { phoneToEmail } from "./formatters.js";

export async function ensureAdminUser() {
  if (!env.adminEmail || !env.adminPassword) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  const existing = await User.findOne({ email: env.adminEmail });

  if (!existing) {
    await User.create({
      firstName: "Fiero",
      lastName: "Admin",
      phone: env.adminPhone,
      email: env.adminEmail,
      passwordHash,
      role: "admin"
    });
    return;
  }

  existing.role = "admin";
  existing.passwordHash = passwordHash;
  existing.phone = existing.phone || env.adminPhone;
  existing.email = env.adminEmail || phoneToEmail(existing.phone);
  await existing.save();
}
