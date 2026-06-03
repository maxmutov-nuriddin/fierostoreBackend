import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDatabase } from "./config/database.js";
import { User } from "./models/User.js";
import { normalizePhone } from "./utils/formatters.js";

// Create or update an admin account.
// Usage: node src/create-admin.js <email> <password> [firstName] [lastName] [phone]
// Defaults: admin@fierostore.com / admin123
async function run() {
  const [, , emailArg, passwordArg, firstNameArg, lastNameArg, phoneArg] = process.argv;

  const email = (emailArg ?? "admin@fierostore.com").trim().toLowerCase();
  const password = passwordArg ?? "admin123";
  const firstName = firstNameArg ?? "Fiero";
  const lastName = lastNameArg ?? "Admin";
  const phone = normalizePhone(phoneArg ?? "+998900000000");

  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  await connectDatabase();

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "admin";
    existing.passwordHash = passwordHash;
    existing.firstName = firstName;
    existing.lastName = lastName;
    existing.phone = existing.phone || phone;
    await existing.save();
    console.log(`✓ Updated existing user as admin: ${email}`);
  } else {
    await User.create({ firstName, lastName, phone, email, passwordHash, role: "admin" });
    console.log(`✓ Created new admin: ${email}`);
  }

  console.log("\n  Login at /admin with:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}\n`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((error) => {
  console.error("Failed to create admin:", error.message);
  process.exit(1);
});
