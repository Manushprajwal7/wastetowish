#!/usr/bin/env node

/**
 * Script to set up CORS configuration for Firebase Storage
 * Run this script to apply CORS settings to your Firebase Storage bucket
 */

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const corsConfigPath = path.join(__dirname, "..", "firebase-storage-cors.json");

console.log("Setting up CORS for Firebase Storage...");
console.log("CORS config file:", corsConfigPath);

// Check if the CORS config file exists
if (!fs.existsSync(corsConfigPath)) {
  console.error("CORS config file not found:", corsConfigPath);
  process.exit(1);
}

// Read the CORS configuration
const corsConfig = JSON.parse(fs.readFileSync(corsConfigPath, "utf8"));
console.log("CORS configuration:", JSON.stringify(corsConfig, null, 2));

// Apply CORS configuration using gsutil
const bucketName =
  process.env.FIREBASE_STORAGE_BUCKET || "wastetowish.appspot.com";
const command = `gsutil cors set ${corsConfigPath} gs://${bucketName}`;

console.log(`Running command: ${command}`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error("Error setting CORS:", error);
    console.error("Make sure you have:");
    console.error("1. Google Cloud SDK installed (gsutil)");
    console.error("2. Authenticated with gcloud auth login");
    console.error("3. Proper permissions for the storage bucket");
    return;
  }

  if (stderr) {
    console.warn("Warning:", stderr);
  }

  console.log("CORS configuration applied successfully!");
  console.log("Output:", stdout);
});
