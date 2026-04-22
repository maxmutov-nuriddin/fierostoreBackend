import mongoose from "mongoose";

import { env } from "./env.js";

let databaseReady = false;

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  mongoose.set("bufferCommands", false);

  mongoose.connection.on("connected", () => {
    databaseReady = true;
  });

  mongoose.connection.on("disconnected", () => {
    databaseReady = false;
  });

  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 5000
  });
}

export function isDatabaseReady() {
  return databaseReady;
}
