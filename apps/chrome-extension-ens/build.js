const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

console.log("Building ENS Walrus Resolver extension...");

// Load environment variables
require("dotenv").config();

try {
  // Clean dist directory
  console.log("Cleaning dist directory...");
  execSync("npm run clean", { stdio: "inherit" });

  // Build TypeScript
  console.log("Compiling TypeScript...");
  execSync("npm run compile", { stdio: "inherit" });

  // Replace environment variables in content.js if needed
  const contentPath = "dist/content.js";
  if (fs.existsSync(contentPath)) {
    console.log("Processing content.js...");
    let content = fs.readFileSync(contentPath, "utf8");

    // Replace Infura project ID if environment variable is set
    if (process.env.INFURA_PROJECT_ID) {
      content = content.replace(
        "be8624a1718b4e8ea027b9de83e0b42d",
        process.env.INFURA_PROJECT_ID
      );
      fs.writeFileSync(contentPath, content);
      console.log("Updated Infura project ID in content.js");
    }
  }

  // Copy manifest
  console.log("Copying manifest...");
  execSync("npm run copy-manifest", { stdio: "inherit" });

  // Verify build
  const requiredFiles = ["background.js", "content.js", "manifest.json"];
  let allFilesExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join("dist", file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing required file: ${filePath}`);
      allFilesExist = false;
    } else {
      console.log(`✅ Built: ${filePath}`);
    }
  }

  if (allFilesExist) {
    console.log("\n🎉 Build completed successfully!");
    console.log("📁 Extension files are ready in the 'dist' directory");
    console.log("📖 Load the 'dist' directory as an unpacked extension in Chrome");
  } else {
    console.error("\n❌ Build failed - missing required files");
    process.exit(1);
  }

} catch (error) {
  console.error("Build failed:", error.message);
  process.exit(1);
}
