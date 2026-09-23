import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { usingSupabase } from "@/lib/db";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const ALLOWED = [".pdf", ".txt", ".epub", ".png", ".jpg", ".jpeg", ".webp"];
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  ".pdf": ["application/pdf"],
  ".txt": ["text/plain"],
  ".epub": ["application/epub+zip", "application/octet-stream"],
  ".png": ["image/png"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".webp": ["image/webp"],
};
const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file supplied" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File is larger than 12 MB" }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED.includes(ext)) {
    return NextResponse.json({ error: `Unsupported file type ${ext}. HTML and executable files are not allowed.` }, { status: 400 });
  }

  const validMimes = ALLOWED_MIME_TYPES[ext];
  if (validMimes && file.type && !validMimes.includes(file.type.toLowerCase())) {
    return NextResponse.json({ error: `File MIME type ${file.type} does not match extension ${ext}` }, { status: 400 });
  }

  const base = slugify(path.basename(file.name, ext)).slice(0, 60) || "file";
  const key = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}-${base}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (usingSupabase) {
    const { admin } = await import("@/lib/db/supabase");
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "textbooks";
    const { error } = await admin()
      .storage.from(bucket)
      .upload(key, buffer, { contentType: file.type || "application/octet-stream", upsert: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { data } = admin().storage.from(bucket).getPublicUrl(key);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, key), buffer);
  return NextResponse.json({ ok: true, url: `/uploads/${key}` });
}
