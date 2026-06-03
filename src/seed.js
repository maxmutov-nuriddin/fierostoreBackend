import mongoose from "mongoose";

import { connectDatabase } from "./config/database.js";
import { ensureAdminUser } from "./utils/seed-admin.js";
import { seedStoreData } from "./utils/seed-data.js";

// Standalone seeder: `npm run seed`.
// Wipes demo products/reviews/orders and re-inserts a full mock catalog.
async function run() {
  await connectDatabase();
  await ensureAdminUser();

  const result = await seedStoreData({ force: true });

  console.log("✓ Seed complete:");
  console.log(`  Products: ${result.products}`);
  console.log(`  Reviews:  ${result.reviews}`);
  console.log(`  Orders:   ${result.orders}`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
