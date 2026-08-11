import mongoose from "mongoose";

function resolveMongoUri() {
  return (process.env.MONGODB_URI ?? process.env.MONGO_URI ?? "").trim();
}

/** @returns {import("mongoose").ConnectOptions} */
function getConnectionOptions(uri) {
  const isAtlas = /mongodb\+srv:|\.mongodb\.net/i.test(uri);
  return {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: isAtlas ? 20_000 : 10_000,
    socketTimeoutMS: 45_000,
    ...(isAtlas && !uri.startsWith("mongodb+srv://") ? { tls: true } : {}),
  };
}

/**
 * @typedef {{ conn: typeof mongoose | null, promise: Promise<typeof mongoose> | null, uri: string | null }} MongooseCache
 */

/** @type {MongooseCache} */
const cached = global.mongoose ?? { conn: null, promise: null, uri: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function resetConnection() {
  if (cached.conn || cached.promise) {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore disconnect errors during URI switch
    }
  }
  cached.conn = null;
  cached.promise = null;
  cached.uri = null;
}

/**
 * Reuse a single MongoDB connection across Next.js serverless invocations.
 * Reconnects automatically if MONGODB_URI changes (local ↔ Atlas switch).
 * @returns {Promise<typeof mongoose>}
 */
export async function connectToDatabase() {
  const uri = resolveMongoUri();

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to .env.local (MONGO_URI also works as a fallback).",
    );
  }

  if (cached.uri && cached.uri !== uri) {
    await resetConnection();
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.uri = uri;
    cached.promise = mongoose
      .connect(uri, getConnectionOptions(uri))
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    cached.uri = null;
    throw error;
  }

  return cached.conn;
}

/**
 * @returns {boolean}
 */
export function isDatabaseConfigured() {
  return Boolean(resolveMongoUri());
}

/**
 * Human-readable hint for admin UI when DB fails.
 */
export function getDatabaseMode() {
  const uri = resolveMongoUri();
  if (!uri) return "not-configured";
  if (/mongodb\+srv:|\.mongodb\.net/i.test(uri)) return "atlas";
  if (/127\.0\.0\.1|localhost/i.test(uri)) return "local";
  return "remote";
}

export { connectToDatabase as connectDB };

export default connectToDatabase;
