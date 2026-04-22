import path from "path";

import cors from "cors";
import express from "express";

import { isDatabaseReady } from "./config/database.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth.routes.js";
import { cardsRouter } from "./routes/cards.routes.js";
import { datesRouter } from "./routes/dates.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { reviewsRouter } from "./routes/reviews.routes.js";

export const app = express();

const allowedOrigins = new Set(env.clientUrls);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: false
  })
);
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (_req, res) => {
  res.json({
    status: isDatabaseReady() ? "ok" : "degraded",
    database: isDatabaseReady() ? "connected" : "disconnected"
  });
});

app.use("/api", (req, res, next) => {
  if (req.path === "/health") {
    return next();
  }

  if (!isDatabaseReady()) {
    return res.status(503).json({
      message: "Backend is running, but MongoDB is not connected yet."
    });
  }

  next();
});

app.use("/api/auth", authRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/dates", datesRouter);

app.use(notFoundHandler);
app.use(errorHandler);
