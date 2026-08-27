// ---------------------------------------------------------------------------
// Checks the Supabase connection and reports what is (and is not) set up.
//
//   node scripts/check-supabase.mjs
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
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL              :", url || "✖ missing");
console.log("anon key         :", anon ? "✓ set" : "✖ missing");
console.log("service role key :", service ? "✓ set" : "✖ missing");

if (!url || !service) {
  console.log("\nThe app will keep using the local JSON database until both are set.");
  process.exit(0);
}

const P = process.env.SUPABASE_TABLE_PREFIX || "";
const T = (n) => P + n;
const supabase = createClient(url, service, { auth: { persistSession: false }, db: { schema: process.env.SUPABASE_DB_SCHEMA || "public" } });
const tables = [
  "profiles",
  "questions",
  "practice_sessions",
  "session_answers",
  "weakness_reports",
  "textbooks",
  "bookmarks",
  "payments",
  "app_settings",
];

console.log("\nTables:");
let missing = 0;
for (const t of tables) {
  // NOTE: a HEAD+count request does not reliably fail on a missing table,
  // so we issue a real select instead.
  const probe = await supabase.from(T(t)).select("*").limit(1);
  if (probe.error) {
    missing++;
    console.log(`  ✖ ${t.padEnd(18)} ${probe.error.message.slice(0, 70)}`);
    continue;
  }
  const { count } = await supabase.from(T(t)).select("*", { count: "exact", head: true });
  const cols = probe.data?.[0] ? ` [${Object.keys(probe.data[0]).slice(0, 5).join(", ")}…]` : "";
  console.log(`  ✓ ${t.padEnd(18)} ${String(count ?? 0).padStart(5)} rows${cols}`);
}

if (missing) {
  const schema = process.env.SUPABASE_DB_SCHEMA || "public";
  if (schema !== "public") {
    console.log(`\n➜ If you see "Invalid schema: ${schema}", the tables exist but the API`);
    console.log("  is not allowed to read them yet. In the Supabase dashboard go to:");
    console.log("     Project Settings -> API -> Data API -> Exposed schemas");
    console.log(`  and add "${schema}" alongside public and graphql_public, then Save.`);
  } else {
    console.log("\n➜ Run supabase/migrations/0001_init.sql in the Supabase SQL editor.");
  }
} else {
  const { count } = await supabase
    .from(T("profiles"))
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");
  console.log(`\n✅ Schema is ready. Admin accounts: ${count ?? 0}`);
  if (!count) console.log("➜ Create one: node scripts/bootstrap-admin.mjs you@example.com 'Password123' 'Your Name'");

  const bucket = await supabase.storage.getBucket("textbooks");
  if (bucket.error) {
    console.log(`✖ textbooks storage bucket: ${bucket.error.message}`);
    console.log("➜ Run supabase/migrations/0004_fix_textbook_storage.sql in the Supabase SQL editor.");
  } else {
    console.log(`✅ textbooks storage bucket: ${bucket.data.public ? "public" : "private"}`);
    if (!bucket.data.public) console.log("➜ Run supabase/migrations/0004_fix_textbook_storage.sql to enable public file viewing.");
  }
}
