import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/** @type {import("mongoose").ConnectOptions} */
const connectionOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
};

/**
 * @typedef {{ conn: typeof mongoose | null, promise: Promise<typeof mongoose> | null }} MongooseCache
 */

/** @type {MongooseCache} */
const cached = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Reuse a single MongoDB connection across Next.js serverless invocations.
 * @returns {Promise<typeof mongoose>}
 */
export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined. Add it to your environment variables.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, connectionOptions).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * @returns {boolean}
 */
export function isDatabaseConfigured() {
  return Boolean(MONGODB_URI && String(MONGODB_URI).trim());
}

export { connectToDatabase as connectDB };

export default connectToDatabase;