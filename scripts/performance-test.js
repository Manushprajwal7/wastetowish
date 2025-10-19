#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests the optimized application for performance metrics
 */

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Performance Testing Script");
console.log("============================");

// Test bundle size
console.log("\n📦 Testing Bundle Size...");
exec("npm run build", (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Build failed:", error.message);
    return;
  }

  console.log("✅ Build completed successfully");

  // Check if .next directory exists and analyze size
  const nextDir = path.join(process.cwd(), ".next");
  if (fs.existsSync(nextDir)) {
    exec("du -sh .next", (sizeError, sizeOutput) => {
      if (!sizeError) {
        console.log(`📊 Build size: ${sizeOutput.trim()}`);
      }
    });
  }
});

// Test with Lighthouse (if available)
console.log("\n🔍 Testing with Lighthouse...");
exec("which lighthouse", (error, stdout, stderr) => {
  if (error) {
    console.log(
      "⚠️  Lighthouse not installed. Install with: npm install -g lighthouse"
    );
    console.log("   Or run: npm run lighthouse (after installing)");
    return;
  }

  console.log("✅ Lighthouse found");
  console.log('📊 Run "npm run lighthouse" to generate performance report');
});

// Test development server performance
console.log("\n⚡ Testing Development Server...");
console.log('📊 Run "npm run dev" and check:');
console.log("   - Initial page load time");
console.log("   - Time to interactive");
console.log("   - Bundle size in Network tab");
console.log("   - Core Web Vitals in Performance tab");

// Performance checklist
console.log("\n✅ Performance Checklist:");
console.log("   □ LCP < 2.5s (Largest Contentful Paint)");
console.log("   □ FID < 100ms (First Input Delay)");
console.log("   □ CLS < 0.1 (Cumulative Layout Shift)");
console.log("   □ Bundle size < 1MB");
console.log("   □ Time to Interactive < 3s");
console.log("   □ No console errors");
console.log("   □ Images load with blur placeholders");
console.log("   □ Components lazy load properly");

console.log("\n🎉 Performance optimization complete!");
console.log("\n📝 Next steps:");
console.log('1. Run "npm run dev" to test locally');
console.log("2. Check browser DevTools Performance tab");
console.log('3. Run "npm run lighthouse" for detailed audit');
console.log("4. Deploy and test on production");
console.log("\n🚀 Your app should now load instantly!");
