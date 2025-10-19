#!/usr/bin/env node

/**
 * Comprehensive Firebase Storage Setup Script
 * This script helps set up Firebase Storage with proper CORS configuration
 */

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const corsConfigPath = path.join(__dirname, "..", "firebase-storage-cors.json");

console.log("🔥 Firebase Storage Setup Script");
console.log("================================");

// Check if CORS config exists
if (!fs.existsSync(corsConfigPath)) {
  console.error("❌ CORS config file not found:", corsConfigPath);
  console.error(
    "Please ensure firebase-storage-cors.json exists in the project root."
  );
  process.exit(1);
}

// Read and display CORS config
const corsConfig = JSON.parse(fs.readFileSync(corsConfigPath, "utf8"));
console.log("📋 CORS Configuration:");
console.log(JSON.stringify(corsConfig, null, 2));

// Get bucket name from environment or prompt
const bucketName =
  process.env.FIREBASE_STORAGE_BUCKET || "wastetowish.appspot.com";
console.log(`\n🪣 Target Bucket: ${bucketName}`);

// Check if gsutil is available
console.log("\n🔍 Checking Google Cloud SDK...");
exec("gsutil version", (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Google Cloud SDK (gsutil) not found!");
    console.error("\n📥 Please install Google Cloud SDK:");
    console.error("   Windows: https://cloud.google.com/sdk/docs/install");
    console.error("   macOS: brew install --cask google-cloud-sdk");
    console.error("   Linux: curl https://sdk.cloud.google.com | bash");
    console.error("\n🔐 Then authenticate with: gcloud auth login");
    return;
  }

  console.log("✅ Google Cloud SDK found");
  console.log(`Version: ${stdout.trim()}`);

  // Check authentication
  console.log("\n🔐 Checking authentication...");
  exec(
    'gcloud auth list --filter=status:ACTIVE --format="value(account)"',
    (authError, authStdout, authStderr) => {
      if (authError || !authStdout.trim()) {
        console.error("❌ Not authenticated with Google Cloud!");
        console.error("\n🔑 Please run: gcloud auth login");
        return;
      }

      console.log(`✅ Authenticated as: ${authStdout.trim()}`);

      // Check project
      exec(
        "gcloud config get-value project",
        (projectError, projectStdout, projectStderr) => {
          if (projectError || !projectStdout.trim()) {
            console.error("❌ No project set!");
            console.error(
              "\n🎯 Please set project: gcloud config set project YOUR_PROJECT_ID"
            );
            return;
          }

          console.log(`✅ Project: ${projectStdout.trim()}`);

          // Apply CORS configuration
          console.log("\n🚀 Applying CORS configuration...");
          const command = `gsutil cors set ${corsConfigPath} gs://${bucketName}`;
          console.log(`Command: ${command}`);

          exec(command, (corsError, corsStdout, corsStderr) => {
            if (corsError) {
              console.error("❌ Failed to set CORS configuration:");
              console.error(corsError.message);
              console.error("\n🔧 Troubleshooting:");
              console.error(
                "1. Make sure you have permission to modify the bucket"
              );
              console.error(
                "2. Check if the bucket exists: gsutil ls gs://" + bucketName
              );
              console.error("3. Verify your authentication: gcloud auth list");
              return;
            }

            console.log("✅ CORS configuration applied successfully!");
            if (corsStdout) console.log("Output:", corsStdout);
            if (corsStderr) console.log("Warnings:", corsStderr);

            // Verify CORS configuration
            console.log("\n🔍 Verifying CORS configuration...");
            exec(
              `gsutil cors get gs://${bucketName}`,
              (verifyError, verifyStdout, verifyStderr) => {
                if (verifyError) {
                  console.error("❌ Failed to verify CORS configuration");
                  console.error(verifyError.message);
                  return;
                }

                console.log("✅ CORS configuration verified:");
                console.log(verifyStdout);

                console.log("\n🎉 Setup complete!");
                console.log("\n📝 Next steps:");
                console.log("1. Test the upload functionality in your app");
                console.log(
                  "2. Check browser console for any remaining errors"
                );
                console.log("3. Verify items appear in your dashboard");
                console.log("\n🐛 If you still have issues:");
                console.log("- Check Firebase Console for error logs");
                console.log(
                  "- Verify Firebase Storage rules allow authenticated users"
                );
                console.log("- Test with a small image file first");
              }
            );
          });
        }
      );
    }
  );
});
