import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { ensureAdminUser } from "./utils/seed-admin.js";
import { seedStoreData } from "./utils/seed-data.js";
import { app } from "./app.js";

async function start() {
  if (env.jwtSecret === "change-this-secret") {
    console.warn("[WARN] JWT_SECRET is not set. Using insecure default — never deploy to production without setting JWT_SECRET.");
  }

  if (env.adminPassword === "change-admin-password") {
    console.warn("[WARN] ADMIN_PASSWORD is not set. Using insecure default — set ADMIN_PASSWORD before going to production.");
  }

  app.listen(env.port, () => {
    console.log(`Fierostore backend running on http://localhost:${env.port}`);
  });

  try {
    await connectDatabase();
    await ensureAdminUser();

    // Auto-seed a full demo catalog on a fresh database (no-op if products exist).
    const seedResult = await seedStoreData();
    if (seedResult.skipped) {
      console.log(`Catalog ready (${seedResult.products} products already in DB).`);
    } else {
      console.log(
        `Seeded demo data — ${seedResult.products} products, ${seedResult.reviews} reviews, ${seedResult.orders} orders.`
      );
    }

    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed. API will return 503 until DB is available.", error);
  }
}

start().catch((error) => {
  console.error("Failed to start Fierostore backend.", error);
  process.exit(1);
});
