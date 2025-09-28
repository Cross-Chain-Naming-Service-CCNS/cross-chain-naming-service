const fs = require("fs");
const { execSync } = require("child_process");

// Load environment variables
require("dotenv").config();

// Build TypeScript
execSync("tsc", { stdio: "inherit" });

// Replace environment variables in content.js
const contentPath = "dist/content.js";
let content = fs.readFileSync(contentPath, "utf8");
content = content.replace(
  "YOUR_INFURA_PROJECT_ID",
  process.env.INFURA_PROJECT_ID || "YOUR_INFURA_PROJECT_ID"
);
fs.writeFileSync(contentPath, content);

// Copy manifest
execSync("npm run copy-manifest", { stdio: "inherit" });
