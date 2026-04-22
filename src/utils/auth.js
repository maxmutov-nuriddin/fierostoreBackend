import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email
    },
    env.jwtSecret,
    {
      expiresIn: "7d"
    }
  );
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt ?? null
  };
}

export function buildSessionPayload(user) {
  const profile = sanitizeUser(user);

  return {
    token: signToken(user),
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role
    },
    profile
  };
}
