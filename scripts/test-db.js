/**
 * Test MongoDB connection using MONGODB_URI from .env.local.
 * Usage: npm run test:db
 * Does not print credentials — only connection status and hints.
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

function loadMongoUriFromEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return "";

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  let uri = "";
  let count = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    if (key !== "MONGODB_URI" && key !== "MONGO_URI") continue;

    uri = line.slice(eq + 1).trim();
    count += 1;
  }

  if (count > 1) {
    console.warn(
      "Warning: multiple active MONGODB_URI lines in .env.local — using the last one. Keep only ONE uncommented line.",
    );
  }

  return uri;
}

function describeUri(uri) {
  if (!uri) return "not-configured";
  if (/YOUR_PASSWORD|USER:PASSWORD|<password>/i.test(uri)) return "placeholder-password";
  if (/mongodb\+srv:|\.mongodb\.net/i.test(uri)) return "atlas";
  if (/127\.0\.0\.1|localhost/i.test(uri)) return "local";
  return "remote";
}

function hintForError(error, mode) {
  const msg = String(error?.message ?? error);

  if (mode === "placeholder-password") {
    return "Replace YOUR_PASSWORD in .env.local with your Atlas database user password.";
  }
  if (/authentication failed|bad auth|Invalid credentials/i.test(msg)) {
    return "Wrong username or password. Atlas → Database Access → reset password → update .env.local.";
  }
  if (/ECONNREFUSED|127\.0\.0\.1|localhost/i.test(msg)) {
    return "Still pointing at local MongoDB. Comment the local line and use your Atlas mongodb+srv URI.";
  }
  if (/timed out|Server selection|ENOTFOUND|querySrv/i.test(msg)) {
    return "Network blocked or cluster unreachable. Atlas → Network Access → add your IP (or 0.0.0.0/0 for testing).";
  }
  if (/self signed certificate|TLS|SSL/i.test(msg)) {
    return "TLS issue — prefer mongodb+srv://... from Atlas Connect → Drivers.";
  }
  return "Check .env.local, restart npm run dev, and verify Atlas user + network access.";
}

const envPath = path.join(process.cwd(), ".env.local");
const uri = loadMongoUriFromEnvFile(envPath);
const mode = describeUri(uri);

console.log("MongoDB diagnostic");
console.log("  env file:", envPath);
console.log("  mode:", mode);

if (!uri) {
  console.error("FAIL: No active MONGODB_URI in .env.local");
  process.exit(1);
}

if (mode === "placeholder-password") {
  console.error("FAIL: URI still contains a placeholder password.");
  console.error("Hint:", hintForError(null, mode));
  process.exit(1);
}

try {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20_000,
    socketTimeoutMS: 45_000,
  });

  const dbName = mongoose.connection.db?.databaseName ?? "(unknown)";
  const collections = await mongoose.connection.db.listCollections().toArray();
  const articleCollections = collections.filter((c) => /article/i.test(c.name));

  console.log("OK: Connected");
  console.log("  database:", dbName);
  console.log("  collections:", collections.length ? collections.map((c) => c.name).join(", ") : "(empty — run Collect RSS in Admin)");

  if (articleCollections.length) {
    for (const col of articleCollections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`  ${col.name}: ${count} documents`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error("FAIL:", error.message);
  console.error("Hint:", hintForError(error, mode));
  process.exit(1);
}
