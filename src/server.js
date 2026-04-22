import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { ensureAdminUser } from "./utils/seed-admin.js";
import { app } from "./app.js";

async function start() {
  app.listen(env.port, () => {
    console.log(`Fierostore backend running on http://localhost:${env.port}`);
  });

  try {
    await connectDatabase();
    await ensureAdminUser();
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed. API will return 503 until DB is available.", error);
  }
}

start().catch((error) => {
  console.error("Failed to start Fierostore backend.", error);
  process.exit(1);
});
