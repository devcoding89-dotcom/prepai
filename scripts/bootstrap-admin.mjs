// ---------------------------------------------------------------------------
// Creates (or promotes) an admin account in Supabase.
//
//   node scripts/bootstrap-admin.mjs you@example.com "YourPassword123" "Your Name"
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
// ---------------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";
import WebSocketImpl from "ws";
if (typeof globalThis.WebSocket === "undefined") globalThis.WebSocket = WebSocketImpl;

import fs from "node:fs";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✖ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const [email, password, fullName = "Administrator"] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node scripts/bootstrap-admin.mjs <email> <password> ["Full Name"]');
  process.exit(1);
}

const P = process.env.SUPABASE_TABLE_PREFIX || "";
const T = (n) => P + n;
const supabase = createClient(url, key, { auth: { persistSession: false }, db: { schema: process.env.SUPABASE_DB_SCHEMA || "public" } });

let userId;
const { data: created, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
});

if (error) {
  if (!/already been registered|already exists/i.test(error.message)) {
    console.error("✖ Could not create user:", error.message);
    process.exit(1);
  }
  console.log("• User already exists — promoting to admin instead.");
  const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!found) {
    console.error("✖ User exists but could not be found via listUsers.");
    process.exit(1);
  }
  userId = found.id;
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (updateError) {
    console.error("✖ Could not update the existing admin password:", updateError.message);
    process.exit(1);
  }
  console.log("✓ Existing admin password updated.");
} else {
  userId = created.user.id;
  console.log("✓ Auth user created.");
}

// the handle_new_user trigger creates the profile row; make sure it is there
const { error: upsertErr } = await supabase.from(T("profiles")).upsert(
  {
    id: userId,
    email,
    full_name: fullName,
    role: "admin",
    target_exam: "JAMB",
    subscription_status: "active",
    subscription_expires_at: new Date(Date.now() + 3650 * 864e5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  { onConflict: "id" },
);

if (upsertErr) {
  console.error("✖ Could not write profile:", upsertErr.message);
  console.error("  Did you run supabase/migrations/0001_init.sql yet?");
  process.exit(1);
}

console.log(`\n✅ Admin ready\n   email: ${email}\n   id:    ${userId}\n\nLog in at /auth/login and you will land on /admin.\n`);
