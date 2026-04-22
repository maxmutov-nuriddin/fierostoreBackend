import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/User.js";

function readBearerToken(header = "") {
  if (!header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice(7);
}

async function resolveUserFromRequest(req) {
  const token = readBearerToken(req.headers.authorization);
  if (!token) return null;

  const payload = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(payload.sub);
  return user ?? null;
}

export async function attachUserIfPresent(req, _res, next) {
  try {
    req.user = await resolveUserFromRequest(req);
    next();
  } catch (_error) {
    req.user = null;
    next();
  }
}

export async function requireAuth(req, res, next) {
  try {
    const user = await resolveUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  next();
}
