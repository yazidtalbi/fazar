#!/usr/bin/env tsx
/**
 * Setup Verification Script
 * Verifies that all critical infrastructure is properly configured
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface VerificationResult {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
}

const results: VerificationResult[] = [];

function addResult(name: string, status: "pass" | "fail" | "warning", message: string) {
  results.push({ name, status, message });
}

async function verifyEnvironmentVariables() {
  console.log("🔍 Verifying environment variables...\n");

  if (!supabaseUrl) {
    addResult("NEXT_PUBLIC_SUPABASE_URL", "fail", "Missing environment variable");
  } else if (!supabaseUrl.startsWith("http")) {
    addResult("NEXT_PUBLIC_SUPABASE_URL", "fail", "Invalid URL format");
  } else {
    addResult("NEXT_PUBLIC_SUPABASE_URL", "pass", "✓ Set correctly");
  }

  if (!supabaseAnonKey) {
    addResult("NEXT_PUBLIC_SUPABASE_ANON_KEY", "fail", "Missing environment variable");
  } else if (supabaseAnonKey.length < 100) {
    addResult("NEXT_PUBLIC_SUPABASE_ANON_KEY", "fail", "Key appears to be invalid");
  } else {
    addResult("NEXT_PUBLIC_SUPABASE_ANON_KEY", "pass", "✓ Set correctly");
  }

  if (!supabaseServiceKey) {
    addResult("SUPABASE_SERVICE_ROLE_KEY", "fail", "Missing environment variable (required for server-side operations)");
  } else if (supabaseServiceKey.length < 100) {
    addResult("SUPABASE_SERVICE_ROLE_KEY", "fail", "Key appears to be invalid");
  } else {
    addResult("SUPABASE_SERVICE_ROLE_KEY", "pass", "✓ Set correctly");
  }

  // Check if service key is in .gitignore
  const fs = require("fs");
  const gitignorePath = path.join(process.cwd(), ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, "utf-8");
    if (gitignore.includes(".env.local") || gitignore.includes(".env")) {
      addResult("Git Security", "pass", "✓ .env files are in .gitignore");
    } else {
      addResult("Git Security", "warning", "⚠ .env files may not be ignored");
    }
  }
}

async function verifySupabaseConnection() {
  console.log("\n🔍 Verifying Supabase connection...\n");

  if (!supabaseUrl || !supabaseAnonKey) {
    addResult("Supabase Connection", "fail", "Cannot test - missing credentials");
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.from("categories").select("id").limit(1);

    if (error) {
      addResult("Supabase Connection", "fail", `Connection failed: ${error.message}`);
    } else {
      addResult("Supabase Connection", "pass", "✓ Successfully connected");
    }
  } catch (error: any) {
    addResult("Supabase Connection", "fail", `Connection error: ${error.message}`);
  }
}

async function verifyStorageBuckets() {
  console.log("\n🔍 Verifying storage buckets...\n");

  if (!supabaseUrl || !supabaseServiceKey) {
    addResult("Storage Buckets", "fail", "Cannot test - missing credentials");
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      addResult("Storage Buckets", "fail", `Failed to list buckets: ${error.message}`);
      return;
    }

    const requiredBuckets = ["product-media", "review-images", "store-media"];
    const existingBuckets = buckets?.map((b) => b.name) || [];

    for (const bucketName of requiredBuckets) {
      if (existingBuckets.includes(bucketName)) {
        addResult(`Bucket: ${bucketName}`, "pass", "✓ Exists");
      } else {
        addResult(`Bucket: ${bucketName}`, "fail", "✗ Missing - run migration 019_storage_setup.sql");
      }
    }
  } catch (error: any) {
    addResult("Storage Buckets", "fail", `Error checking buckets: ${error.message}`);
  }
}

async function verifyDatabaseTables() {
  console.log("\n🔍 Verifying database tables...\n");

  if (!supabaseUrl || !supabaseServiceKey) {
    addResult("Database Tables", "fail", "Cannot test - missing credentials");
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const requiredTables = [
      "buyer_profiles",
      "seller_profiles",
      "stores",
      "products",
      "product_media",
      "categories",
      "orders",
      "order_items",
      "cart_items",
      "reviews",
    ];

    for (const tableName of requiredTables) {
      const { error } = await supabase.from(tableName).select("id").limit(1);
      if (error) {
        if (error.code === "42P01") {
          addResult(`Table: ${tableName}`, "fail", "✗ Table does not exist");
        } else {
          addResult(`Table: ${tableName}`, "warning", `⚠ ${error.message}`);
        }
      } else {
        addResult(`Table: ${tableName}`, "pass", "✓ Exists");
      }
    }
  } catch (error: any) {
    addResult("Database Tables", "fail", `Error checking tables: ${error.message}`);
  }
}

function printResults() {
  console.log("\n" + "=".repeat(60));
  console.log("VERIFICATION RESULTS");
  console.log("=".repeat(60) + "\n");

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const warnings = results.filter((r) => r.status === "warning").length;

  results.forEach((result) => {
    const icon = result.status === "pass" ? "✓" : result.status === "fail" ? "✗" : "⚠";
    const color = result.status === "pass" ? "\x1b[32m" : result.status === "fail" ? "\x1b[31m" : "\x1b[33m";
    console.log(`${color}${icon}\x1b[0m ${result.name}: ${result.message}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log(`Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
  console.log("=".repeat(60) + "\n");

  if (failed > 0) {
    console.log("❌ Some critical checks failed. Please fix them before launching.\n");
    process.exit(1);
  } else if (warnings > 0) {
    console.log("⚠️  Some warnings were found. Review them before launching.\n");
    process.exit(0);
  } else {
    console.log("✅ All checks passed!\n");
    process.exit(0);
  }
}

async function main() {
  console.log("🚀 Afus Marketplace - Setup Verification\n");

  await verifyEnvironmentVariables();
  await verifySupabaseConnection();
  await verifyStorageBuckets();
  await verifyDatabaseTables();
  printResults();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

