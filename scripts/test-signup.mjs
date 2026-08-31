import { createClient } from "@supabase/supabase-js";
import WebSocketImpl from "ws";
if (typeof globalThis.WebSocket === "undefined") globalThis.WebSocket = WebSocketImpl;
import fs from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const schema = process.env.SUPABASE_DB_SCHEMA || "prepai";

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema },
});

async function run() {
  const testEmail = `test_student_${Date.now()}@example.com`;
  const testPassword = "Password123!";
  const fullName = "Test Student";

  console.log(`Attempting auth.admin.createUser with email: ${testEmail}...`);
  const { data, error } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    console.error("❌ admin.createUser failed:", error);
  } else {
    console.log("✅ admin.createUser succeeded! User ID:", data.user.id);
    
    // Clean up test user
    console.log("Cleaning up test user...");
    await admin.auth.admin.deleteUser(data.user.id);
    console.log("Cleaned up.");
  }
}

run().catch(console.error);
