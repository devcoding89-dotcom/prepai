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

async function run() {
  // Let's test inserting into public.profiles with email vs without email
  const fakeId = "00000000-0000-0000-0000-000000000001";
  
  console.log("Testing insert into public.profiles WITH email...");
  const withEmail = await clientPublic.from("profiles").insert({
    id: fakeId,
    email: "test@example.com",
    full_name: "Test User"
  });
  console.log("Insert with email error:", withEmail.error);

  console.log("Testing insert into public.profiles WITHOUT email...");
  const withoutEmail = await clientPublic.from("profiles").insert({
    id: fakeId,
    full_name: "Test User"
  });
  console.log("Insert without email error:", withoutEmail.error);
}

run().catch(console.error);
