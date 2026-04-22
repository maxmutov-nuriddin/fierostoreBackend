import dotenv from "dotenv";

dotenv.config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toList(value, fallback) {
  if (!value) return fallback;

  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
}

const defaultClientUrls = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001"
];

export const env = {
  port: toNumber(process.env.PORT, 5051),
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/fierostore",
  clientUrls: toList(process.env.CLIENT_URL, defaultClientUrls),
  jwtSecret: process.env.JWT_SECRET ?? "change-this-secret",
  adminEmail: (process.env.ADMIN_EMAIL ?? "admin@fierostore.com").toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD ?? "change-admin-password",
  adminPhone: process.env.ADMIN_PHONE ?? "998900000000"
};
