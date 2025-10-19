#!/usr/bin/env node

/**
 * Firebase Storage Permissive CORS Setup Script
 * This script creates a permissive CORS configuration to allow all origins
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Firebase Storage Permissive CORS Setup Script");
console.log("================================================");

// Create a permissive CORS config that allows all origins
const corsConfig = [
  {
    origin: ["*"],
    method: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    maxAgeSeconds: 3600,
  },
];

const corsConfigPath = path.join(
  __dirname,
  "..",
  "firebase-storage-cors-permissive.json"
);

// Write the CORS config to a file
fs.writeFileSync(corsConfigPath, JSON.stringify(corsConfig, null, 2));
console.log("✅ Created permissive CORS configuration file:", corsConfigPath);

console.log("\n📝 Manual Setup Instructions:");
console.log("1. Go to Firebase Console: https://console.firebase.google.com");
console.log("2. Select your project: wastetowish");
console.log("3. Go to Storage → Rules");
console.log("4. Update the rules to:");
console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`);

console.log("\n🔧 Apply Permissive CORS Configuration:");
console.log(
  "To apply the permissive CORS configuration, you can use one of these methods:"
);

console.log(
  "\nMethod 1 - Using gsutil (if you have Google Cloud SDK installed):"
);
console.log(`gsutil cors set ${corsConfigPath} gs://wastetowish.appspot.com`);

console.log("\nMethod 2 - Using Firebase CLI:");
console.log("firebase init storage");
console.log("Then modify storage.rules and deploy with:");
console.log("firebase deploy --only storage");

console.log("\n⚠️  Important Security Notes:");
console.log(
  "- Using '*' for origin allows ALL websites to access your storage"
);
console.log("- This is ONLY for development/testing purposes");
console.log("- For production, replace '*' with specific origins like:");
console.log("  ['http://localhost:3000', 'https://yourdomain.com']");
console.log("- The CORS changes may take a few minutes to propagate");

console.log("\n✅ Permissive CORS setup complete!");
console.log("Now try uploading an item again. CORS errors should be resolved.");
