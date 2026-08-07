const fs = require("fs");
const path = require("path");

const nextDir = path.join(process.cwd(), ".next");
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("Removed .next cache");
} else {
  console.log(".next not found, starting fresh");
}