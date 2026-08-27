import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocketImpl from "ws";

// supabase-js instantiates a realtime client on construction, which needs a
// global WebSocket. Node 22+ ships one; on Node 18/20 we polyfill it so the
// driver works on every runtime.
if (typeof (globalThis as { WebSocket?: unknown }).WebSocket === "undefined") {
  (globalThis as { WebSocket?: unknown }).WebSocket = WebSocketImpl;
}

import type {
  AppSettings,
  Bookmark,
  Payment,
  PracticeSession,
  Profile,
  Question,
  SessionAnswer,
  TextbookChapter,
  WeaknessReport,
} from "@/lib/types";
import { DEFAULT_SETTINGS, type PickSpec, type QuestionFilter, type Repo, type TextbookFilter } from "./repo";

// ---------------------------------------------------------------------------
// Supabase driver. Activated automatically when NEXT_PUBLIC_SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are present. Runs server-side only; the browser
// never sees the service key. RLS policies (see supabase/migrations) still
// protect direct client access.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any, any, any>;


/**
 * Table-name resolver. Set SUPABASE_TABLE_PREFIX=prepai_ to install PrepAI's
 * tables alongside another app inside the shared `public` schema.
 */
const PREFIX = process.env.SUPABASE_TABLE_PREFIX ?? "";
export const T = (name: string) => `${PREFIX}${name}`;

let _admin: AnyClient | null = null;
export function admin(): AnyClient {
  if (_admin) return _admin;
  _admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      // Set SUPABASE_DB_SCHEMA=prepai to keep PrepAI's tables in their own
      // Postgres schema — required when the project is shared with another app.
      db: { schema: process.env.SUPABASE_DB_SCHEMA || "public" },
    },
  );
  return _admin;
}

function unwrap<T>(res: { data: T | null; error: { message: string } | null }, label: string): T {
  if (res.error) throw new Error(`[supabase:${label}] ${res.error.message}`);
  return res.data as T;
}

const SETTINGS_ID = "singleton";

export const supabaseRepo: Repo = {
  driver: "supabase",

  // ---------------- users ----------------
  async getUserByEmail() {
    // Passwords live in Supabase Auth — see src/lib/auth.ts
    return null;
  },
  async getProfile(id) {
    const { data } = await admin().from(T("profiles")).select("*").eq("id", id).maybeSingle();
    return (data as Profile) ?? null;
  },
  async createUser() {
    throw new Error("createUser is handled by Supabase Auth in supabase mode");
  },
  async updateProfile(id, patch) {
    const res = await admin()
      .from(T("profiles"))
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    return unwrap(res, "updateProfile") as Profile;
  },
  async listProfiles(opts) {
    let q = admin().from(T("profiles")).select("*").order("created_at", { ascending: false });
    if (opts?.search) q = q.or(`email.ilike.%${opts.search}%,full_name.ilike.%${opts.search}%`);
    const res = await q.limit(opts?.limit ?? 200);
    return unwrap(res, "listProfiles") as Profile[];
  },
  async countProfiles() {
    const { count } = await admin().from(T("profiles")).select("*", { count: "exact", head: true });
    return count ?? 0;
  },

  // ---------------- questions ----------------
  async listQuestions(f: QuestionFilter = {}) {
    let q = admin().from(T("questions")).select("*", { count: "exact" });
    if (f.exam && f.exam !== "ALL") q = q.eq("exam", f.exam);
    if (f.subject) q = q.eq("subject", f.subject);
    if (f.topic) q = q.eq("topic", f.topic);
    if (f.difficulty) q = q.eq("difficulty", f.difficulty);
    if (f.onlyActive) q = q.eq("is_active", true);
    if (f.search) q = q.or(`question_text.ilike.%${f.search}%,topic.ilike.%${f.search}%`);
    const offset = f.offset ?? 0;
    const res = await q
      .order("created_at", { ascending: false })
      .range(offset, offset + (f.limit ?? 50) - 1);
    if (res.error) throw new Error(res.error.message);
    return { rows: (res.data ?? []) as Question[], total: res.count ?? 0 };
  },
  async getQuestion(id) {
    const { data } = await admin().from(T("questions")).select("*").eq("id", id).maybeSingle();
    return (data as Question) ?? null;
  },
  async createQuestion(q) {
    const res = await admin().from(T("questions")).insert(q).select().single();
    return unwrap(res, "createQuestion") as Question;
  },
  async updateQuestion(id, patch) {
    const res = await admin().from(T("questions")).update(patch).eq("id", id).select().maybeSingle();
    return unwrap(res, "updateQuestion") as Question;
  },
  async deleteQuestion(id) {
    const { error } = await admin().from(T("questions")).delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
  async bulkCreateQuestions(rows) {
    if (!rows.length) return 0;
    const { error } = await admin().from(T("questions")).insert(rows);
    if (error) throw new Error(error.message);
    return rows.length;
  },
  async pickQuestions(spec: PickSpec) {
    let q = admin().from(T("questions")).select("*").eq("exam", spec.exam).eq("is_active", true);
    if (spec.subjects?.length) q = q.in("subject", spec.subjects);
    if (spec.topics?.length) q = q.in("topic", spec.topics);
    if (spec.difficulty) q = q.eq("difficulty", spec.difficulty);
    const res = await q.limit(Math.max(spec.count * 6, 200));
    const pool = (unwrap(res, "pickQuestions") ?? []) as Question[];
    // even spread across subjects, then shuffle
    const bySubject = new Map<string, Question[]>();
    const orderedPool = spec.shuffle === false ? pool : pool.sort(() => Math.random() - 0.5);
    for (const item of orderedPool) {
      const arr = bySubject.get(item.subject) ?? [];
      arr.push(item);
      bySubject.set(item.subject, arr);
    }
    const out: Question[] = [];
    let exhausted = false;
    while (out.length < spec.count && !exhausted) {
      exhausted = true;
      for (const arr of bySubject.values()) {
        const next = arr.pop();
        if (next) {
          out.push(next);
          exhausted = false;
          if (out.length >= spec.count) break;
        }
      }
    }
    return spec.shuffle === false ? out : out.sort(() => Math.random() - 0.5);
  },
  async questionFacets(exam) {
    let q = admin().from(T("questions")).select("subject,topic");
    if (exam && exam !== "ALL") q = q.eq("exam", exam);
    const rows = (unwrap(await q.limit(10000), "facets") ?? []) as { subject: string; topic: string }[];
    return {
      subjects: [...new Set(rows.map((r) => r.subject))].sort(),
      topics: [...new Set(rows.map((r) => r.topic))].sort(),
    };
  },
  async questionCountsBySubject(exam) {
    let q = admin().from(T("questions")).select("subject").eq("is_active", true);
    if (exam && exam !== "ALL") q = q.eq("exam", exam);
    const rows = (unwrap(await q.limit(10000), "counts") ?? []) as { subject: string }[];
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.subject, (map.get(r.subject) ?? 0) + 1);
    return [...map.entries()].map(([subject, count]) => ({ subject, count })).sort((a, b) => b.count - a.count);
  },

  // ---------------- sessions ----------------
  async createSession(s) {
    const res = await admin().from(T("practice_sessions")).insert(s).select().single();
    return unwrap(res, "createSession") as PracticeSession;
  },
  async getSession(id) {
    const { data } = await admin().from(T("practice_sessions")).select("*").eq("id", id).maybeSingle();
    return (data as PracticeSession) ?? null;
  },
  async updateSession(id, patch) {
    const res = await admin().from(T("practice_sessions")).update(patch).eq("id", id).select().maybeSingle();
    return unwrap(res, "updateSession") as PracticeSession;
  },
  async listSessions(userId, limit = 100) {
    const res = await admin()
      .from(T("practice_sessions"))
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(limit);
    return (unwrap(res, "listSessions") ?? []) as PracticeSession[];
  },
  async listAllSessions(limit = 100) {
    const res = await admin()
      .from(T("practice_sessions"))
      .select("*")
      .order("started_at", { ascending: false })
      .limit(limit);
    return (unwrap(res, "listAllSessions") ?? []) as PracticeSession[];
  },
  async upsertAnswer(a) {
    const res = await admin()
      .from(T("session_answers"))
      .upsert(a, { onConflict: "session_id,question_id" })
      .select()
      .single();
    return unwrap(res, "upsertAnswer") as SessionAnswer;
  },
  async listAnswers(sessionId) {
    const res = await admin().from(T("session_answers")).select("*").eq("session_id", sessionId);
    return (unwrap(res, "listAnswers") ?? []) as SessionAnswer[];
  },

  // ---------------- weaknesses ----------------
  async insertWeaknesses(rows) {
    if (!rows.length) return [];
    const res = await admin().from(T("weakness_reports")).insert(rows).select();
    return (unwrap(res, "insertWeaknesses") ?? []) as WeaknessReport[];
  },
  async listWeaknesses(userId, limit = 200) {
    const res = await admin()
      .from(T("weakness_reports"))
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (unwrap(res, "listWeaknesses") ?? []) as WeaknessReport[];
  },
  async listWeaknessesBySession(sessionId) {
    const res = await admin()
      .from(T("weakness_reports"))
      .select("*")
      .eq("session_id", sessionId)
      .order("weakness_score", { ascending: false });
    return (unwrap(res, "listWeaknessesBySession") ?? []) as WeaknessReport[];
  },

  // ---------------- textbooks ----------------
  async listTextbooks(f: TextbookFilter = {}) {
    let q = admin().from(T("textbooks")).select("*");
    if (f.exam && f.exam !== "ALL") q = q.eq("exam", f.exam);
    if (f.onlyPublished) q = q.eq("is_published", true);
    if (f.subject && f.subject !== "All") q = q.eq("subject", f.subject);
    if (f.topic) q = q.contains("topic_tags", [f.topic]);
    if (f.search) q = q.or(`title.ilike.%${f.search}%,book_title.ilike.%${f.search}%`);
    const res = await q.order("subject").order("chapter_number");
    return (unwrap(res, "listTextbooks") ?? []) as TextbookChapter[];
  },
  async getTextbook(id) {
    const { data } = await admin().from(T("textbooks")).select("*").eq("id", id).maybeSingle();
    return (data as TextbookChapter) ?? null;
  },
  async createTextbook(t) {
    const res = await admin().from(T("textbooks")).insert(t).select().single();
    return unwrap(res, "createTextbook") as TextbookChapter;
  },
  async updateTextbook(id, patch) {
    const res = await admin().from(T("textbooks")).update(patch).eq("id", id).select().maybeSingle();
    return unwrap(res, "updateTextbook") as TextbookChapter;
  },
  async deleteTextbook(id) {
    const { error } = await admin().from(T("textbooks")).delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
  async findTextbookForTopic(exam, subject, topic) {
    const byTopic = await admin()
      .from(T("textbooks"))
      .select("*")
      .eq("is_published", true)
      .contains("topic_tags", [topic])
      .limit(5);
    const rows = (byTopic.data ?? []) as TextbookChapter[];
    return (
      rows.find((t) => t.exam === exam && t.subject === subject) ??
      rows.find((t) => t.subject === subject) ??
      rows[0] ??
      null
    );
  },

  // ---------------- bookmarks ----------------
  async toggleBookmark(userId, textbookId) {
    const { data } = await admin()
      .from(T("bookmarks"))
      .select("id")
      .eq("user_id", userId)
      .eq("textbook_id", textbookId)
      .maybeSingle();
    if (data) {
      await admin().from(T("bookmarks")).delete().eq("id", (data as { id: string }).id);
      return false;
    }
    await admin().from(T("bookmarks")).insert({ user_id: userId, textbook_id: textbookId });
    return true;
  },
  async listBookmarks(userId) {
    const res = await admin().from(T("bookmarks")).select("*").eq("user_id", userId);
    return (unwrap(res, "listBookmarks") ?? []) as Bookmark[];
  },

  // ---------------- payments ----------------
  async createPayment(p) {
    const res = await admin().from(T("payments")).insert(p).select().single();
    return unwrap(res, "createPayment") as Payment;
  },
  async getPaymentByRef(ref) {
    const { data } = await admin().from(T("payments")).select("*").eq("paystack_ref", ref).maybeSingle();
    return (data as Payment) ?? null;
  },
  async updatePaymentByRef(ref, patch) {
    const res = await admin().from(T("payments")).update(patch).eq("paystack_ref", ref).select().maybeSingle();
    return unwrap(res, "updatePaymentByRef") as Payment;
  },
  async listPayments(userId, limit = 200) {
    let q = admin().from(T("payments")).select("*");
    if (userId) q = q.eq("user_id", userId);
    const res = await q.order("created_at", { ascending: false }).limit(limit);
    return (unwrap(res, "listPayments") ?? []) as Payment[];
  },

  // ---------------- settings ----------------
  async getSettings() {
    const { data } = await admin().from(T("app_settings")).select("*").eq("id", SETTINGS_ID).maybeSingle();
    return { ...DEFAULT_SETTINGS, ...((data as Partial<AppSettings>) ?? {}) };
  },
  async updateSettings(patch) {
    const current = await this.getSettings();
    const next = { ...current, ...patch };
    await admin().from(T("app_settings")).upsert({ id: SETTINGS_ID, ...next });
    return next;
  },
};
