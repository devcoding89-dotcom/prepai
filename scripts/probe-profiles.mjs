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

const clientPublic = createClient(url, service, {
  auth: { persistSession: false },
  db: { schema: "public" },
});

const clientPrepai = createClient(url, service, {
  auth: { persistSession: false },
  db: { schema: "prepai" },
});

async function run() {
  console.log("Checking public.profiles...");
  const pub = await clientPublic.from("profiles").select("*").limit(5);
  console.log("public.profiles result:", pub.error ? pub.error.message : pub.data);

  console.log("Checking prepai.profiles...");
  const prep = await clientPrepai.from("profiles").select("*").limit(5);
  console.log("prepai.profiles result:", prep.error ? prep.error.message : prep.data);
}

run().catch(console.error);
