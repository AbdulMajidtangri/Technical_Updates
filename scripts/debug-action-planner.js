import { readFileSync } from "fs";
import { connectDB } from "../lib/db.js";
import Article from "../models/Article.js";
import { runActionPlanner } from "../lib/intelligence/actionPlanner/runActionPlanner.js";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
}

await connectDB();
const doc = await Article.findOne({ isDuplicate: { $ne: true } }).select("_id title").lean();
if (!doc) {
  console.log("No articles found");
  process.exit(1);
}

console.log("Article:", String(doc._id), doc.title?.slice(0, 80));
try {
  const result = await runActionPlanner(String(doc._id), { force: true });
  console.log("Result:", JSON.stringify({ success: result.success, error: result.error, status: result.data?.status }, null, 2));
} catch (err) {
  console.error("THROW:", err);
  process.exit(1);
}
