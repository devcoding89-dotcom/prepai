import "server-only";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type {
  AppSettings,
  Bookmark,
  Exam,
  Payment,
  PracticeSession,
  Profile,
  Question,
  SessionAnswer,
  TextbookChapter,
  UserRecord,
  WeaknessReport,
} from "@/lib/types";
import { DEFAULT_SETTINGS, type PickSpec, type Repo } from "./repo";
import { seedQuestions, seedTextbooks } from "./seed";

// ---------------------------------------------------------------------------
// A tiny JSON-file database. It exists so the whole platform runs end-to-end
// with zero external services (great for local dev, demos and previews).
// Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to switch to
// Supabase (see src/lib/db/supabase.ts).
// ---------------------------------------------------------------------------

interface DB {
  users: UserRecord[];
  questions: Question[];
  sessions: PracticeSession[];
  answers: SessionAnswer[];
  weaknesses: WeaknessReport[];
  textbooks: TextbookChapter[];
  payments: Payment[];
  bookmarks: Bookmark[];
  settings: AppSettings;
}

// Vercel (and most serverless hosts) ship a read-only filesystem for the
// project root. Write to the OS temp directory instead so the local driver
// keeps working in production without Supabase. (/tmp is writable everywhere.)
const DATA_DIR =
  process.env.PREPAI_DATA_DIR ||
  (process.env.VERCEL === "1" ? path.join(os.tmpdir(), "prepai-data") : path.join(process.cwd(), "data"));
const DB_FILE = path.join(DATA_DIR, "db.json");

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function emptyDB(): DB {
  return {
    users: [],
    questions: [],
    sessions: [],
    answers: [],
    weaknesses: [],
    textbooks: [],
    payments: [],
    bookmarks: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

function buildSeed(): DB {
  const db = emptyDB();
  const ts = now();

  // A single bootstrap admin so a fresh install is reachable. Override with
  // PREPAI_ADMIN_EMAIL / PREPAI_ADMIN_PASSWORD before first run.
  db.users.push({
    id: uid(),
    email: (process.env.PREPAI_ADMIN_EMAIL || "admin@prepai.ng").toLowerCase(),
    password_hash: bcrypt.hashSync(process.env.PREPAI_ADMIN_PASSWORD || "admin1234", 10),
    full_name: "Administrator",
    role: "admin",
    target_exam: "JAMB",
    exam_date: null,
    avatar_url: null,
    subscription_status: "active",
    subscription_expires_at: new Date(Date.now() + 3650 * 864e5).toISOString(),
    created_at: ts,
    updated_at: ts,
  });

  // Starter content is seeded by default so all subjects are available immediately.
  db.questions = seedQuestions().map((q) => ({ ...q, id: uid(), created_at: ts }));
  db.textbooks = seedTextbooks().map((t) => ({ ...t, id: uid(), created_at: ts }));

  return db;
}

let cache: DB | null = null;
let writeChain: Promise<void> = Promise.resolve();

function loadSync(): DB {
  if (cache) return cache;
  try {
    if (fs.existsSync(DB_FILE)) {
      cache = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DB;
      cache.settings = { ...DEFAULT_SETTINGS, ...cache.settings };
      let mutated = false;
      const ts = now();
      if (!cache.questions || cache.questions.length === 0) {
        cache.questions = seedQuestions().map((q) => ({ ...q, id: uid(), created_at: ts }));
        mutated = true;
      }
      if (!cache.textbooks || cache.textbooks.length === 0) {
        cache.textbooks = seedTextbooks().map((t) => ({ ...t, id: uid(), created_at: ts }));
        mutated = true;
      }
      if (mutated) {
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
        } catch (err) {
          console.error("[db] could not persist seeded db.json", err);
        }
      }
      return cache;
    }
  } catch (err) {
    console.error("[db] could not read db.json, reseeding", err);
  }
  cache = buildSeed();
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.error("[db] could not write db.json", err);
  }
  return cache;
}

function persist() {
  const snapshot = JSON.stringify(cache, null, 2);
  writeChain = writeChain
    .then(async () => {
      await fsp.mkdir(DATA_DIR, { recursive: true });
      await fsp.writeFile(DB_FILE, snapshot);
    })
    .catch((e) => console.error("[db] write failed", e));
  return writeChain;
}

async function mutate<T>(fn: (db: DB) => T): Promise<T> {
  const db = loadSync();
  const out = fn(db);
  await persist();
  return out;
}

const stripPw = (u: UserRecord): Profile => {
  const { password_hash: _pw, ...rest } = u;
  void _pw;
  return rest;
};

const matchExam = (v: string, exam?: Exam | "ALL") => !exam || exam === "ALL" || v === exam;

export const localRepo: Repo = {
  driver: "local",

  // ---------------- users ----------------
  async getUserByEmail(email) {
    const db = loadSync();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) ?? null;
  },
  async getProfile(id) {
    const db = loadSync();
    const u = db.users.find((x) => x.id === id);
    return u ? stripPw(u) : null;
  },
  async createUser({ email, password_hash, full_name, role = "student" }) {
    return mutate((db) => {
      const ts = now();
      const user: UserRecord = {
        id: uid(),
        email: email.toLowerCase().trim(),
        password_hash,
        full_name,
        role,
        target_exam: null,
        exam_date: null,
        avatar_url: null,
        subscription_status: "inactive",
        subscription_expires_at: null,
        created_at: ts,
        updated_at: ts,
      };
      db.users.push(user);
      return user;
    });
  },
  async updateProfile(id, patch) {
    return mutate((db) => {
      const u = db.users.find((x) => x.id === id);
      if (!u) return null;
      Object.assign(u, patch, { updated_at: now() });
      return stripPw(u);
    });
  },
  async listProfiles(opts) {
    const db = loadSync();
    let rows = [...db.users].sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (opts?.search) {
      const s = opts.search.toLowerCase();
      rows = rows.filter(
        (u) => u.email.toLowerCase().includes(s) || (u.full_name ?? "").toLowerCase().includes(s),
      );
    }
    return rows.slice(0, opts?.limit ?? 200).map(stripPw);
  },
  async countProfiles() {
    return loadSync().users.length;
  },
  async deleteUser(id: string) {
    await mutate((db) => {
      db.users = db.users.filter((u) => u.id !== id);
      db.sessions = db.sessions.filter((s) => s.user_id !== id);
      db.answers = db.answers.filter((a) => {
        const session = db.sessions.find((s) => s.id === a.session_id);
        return Boolean(session);
      });
      db.weaknesses = db.weaknesses.filter((w) => w.user_id !== id);
      db.bookmarks = db.bookmarks.filter((b) => b.user_id !== id);
      db.payments = db.payments.filter((p) => p.user_id !== id);
    });
  },

  // ---------------- questions ----------------
  async listQuestions(f = {}) {
    const db = loadSync();
    let rows = db.questions.filter((q) => matchExam(q.exam, f.exam));
    if (f.subject) rows = rows.filter((q) => q.subject === f.subject);
    if (f.topic) rows = rows.filter((q) => q.topic === f.topic);
    if (f.difficulty) rows = rows.filter((q) => q.difficulty === f.difficulty);
    if (f.onlyActive) rows = rows.filter((q) => q.is_active);
    if (f.search) {
      const s = f.search.toLowerCase();
      rows = rows.filter(
        (q) =>
          q.question_text.toLowerCase().includes(s) ||
          q.topic.toLowerCase().includes(s) ||
          q.subject.toLowerCase().includes(s),
      );
    }
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const total = rows.length;
    const offset = f.offset ?? 0;
    return { rows: rows.slice(offset, offset + (f.limit ?? 50)), total };
  },
  async getQuestion(id) {
    return loadSync().questions.find((q) => q.id === id) ?? null;
  },
  async createQuestion(q) {
    return mutate((db) => {
      const row: Question = { ...q, id: uid(), created_at: now() };
      db.questions.push(row);
      return row;
    });
  },
  async updateQuestion(id, patch) {
    return mutate((db) => {
      const q = db.questions.find((x) => x.id === id);
      if (!q) return null;
      Object.assign(q, patch);
      return q;
    });
  },
  async deleteQuestion(id) {
    await mutate((db) => {
      db.questions = db.questions.filter((q) => q.id !== id);
    });
  },
  async bulkCreateQuestions(rows) {
    return mutate((db) => {
      const ts = now();
      for (const r of rows) db.questions.push({ ...r, id: uid(), created_at: ts });
      return rows.length;
    });
  },
  async pickQuestions(spec: PickSpec) {
    const db = loadSync();
    let pool = db.questions.filter((q) => q.is_active && q.exam === spec.exam);
    if (spec.subjects?.length) pool = pool.filter((q) => spec.subjects!.includes(q.subject));
    if (spec.topics?.length) pool = pool.filter((q) => spec.topics!.includes(q.topic));
    if (spec.difficulty) pool = pool.filter((q) => q.difficulty === spec.difficulty);
    // even spread across selected subjects
    const bySubject = new Map<string, Question[]>();
    for (const q of pool) {
      const arr = bySubject.get(q.subject) ?? [];
      arr.push(q);
      bySubject.set(q.subject, arr);
    }
    if (spec.shuffle !== false) {
      for (const [k, v] of bySubject) bySubject.set(k, v.sort(() => Math.random() - 0.5));
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
    const db = loadSync();
    const rows = db.questions.filter((q) => matchExam(q.exam, exam));
    const topicsBySubject: Record<string, string[]> = {};
    for (const r of rows) {
      if (!topicsBySubject[r.subject]) topicsBySubject[r.subject] = [];
      if (r.topic && !topicsBySubject[r.subject].includes(r.topic)) {
        topicsBySubject[r.subject].push(r.topic);
      }
    }
    return {
      subjects: [...new Set(rows.map((q) => q.subject))].sort(),
      topics: [...new Set(rows.map((q) => q.topic))].sort(),
      topicsBySubject,
    };
  },
  async questionCountsBySubject(exam) {
    const db = loadSync();
    const map = new Map<string, number>();
    for (const q of db.questions.filter((x) => matchExam(x.exam, exam) && x.is_active)) {
      map.set(q.subject, (map.get(q.subject) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count);
  },

  // ---------------- sessions ----------------
  async createSession(s) {
    return mutate((db) => {
      const row: PracticeSession = { ...s, id: uid() };
      db.sessions.push(row);
      return row;
    });
  },
  async getSession(id) {
    return loadSync().sessions.find((s) => s.id === id) ?? null;
  },
  async updateSession(id, patch) {
    return mutate((db) => {
      const s = db.sessions.find((x) => x.id === id);
      if (!s) return null;
      Object.assign(s, patch);
      return s;
    });
  },
  async listSessions(userId, limit = 100) {
    return loadSync()
      .sessions.filter((s) => s.user_id === userId)
      .sort((a, b) => b.started_at.localeCompare(a.started_at))
      .slice(0, limit);
  },
  async listAllSessions(limit = 100) {
    return loadSync()
      .sessions.slice()
      .sort((a, b) => b.started_at.localeCompare(a.started_at))
      .slice(0, limit);
  },
  async upsertAnswer(a) {
    return mutate((db) => {
      const existing = db.answers.find(
        (x) => x.session_id === a.session_id && x.question_id === a.question_id,
      );
      if (existing) {
        Object.assign(existing, a);
        return existing;
      }
      const row: SessionAnswer = { ...a, id: uid() };
      db.answers.push(row);
      return row;
    });
  },
  async listAnswers(sessionId) {
    return loadSync().answers.filter((a) => a.session_id === sessionId);
  },

  // ---------------- weaknesses ----------------
  async insertWeaknesses(rows) {
    return mutate((db) => {
      const ts = now();
      const created = rows.map((r) => ({ ...r, id: uid(), created_at: ts }));
      db.weaknesses.push(...created);
      return created;
    });
  },
  async listWeaknesses(userId, limit = 200) {
    return loadSync()
      .weaknesses.filter((w) => w.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  },
  async listWeaknessesBySession(sessionId) {
    return loadSync()
      .weaknesses.filter((w) => w.session_id === sessionId)
      .sort((a, b) => b.weakness_score - a.weakness_score);
  },

  // ---------------- textbooks ----------------
  async listTextbooks(f = {}) {
    const db = loadSync();
    let rows = db.textbooks.filter((t) => matchExam(t.exam, f.exam));
    if (f.onlyPublished) rows = rows.filter((t) => t.is_published);
    if (f.subject && f.subject !== "All") rows = rows.filter((t) => t.subject === f.subject);
    if (f.topic) rows = rows.filter((t) => t.topic_tags.includes(f.topic!));
    if (f.search) {
      const s = f.search.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.book_title.toLowerCase().includes(s) ||
          t.topic_tags.join(" ").toLowerCase().includes(s),
      );
    }
    return rows.sort(
      (a, b) =>
        a.subject.localeCompare(b.subject) || (a.chapter_number ?? 0) - (b.chapter_number ?? 0),
    );
  },
  async getTextbook(id) {
    return loadSync().textbooks.find((t) => t.id === id) ?? null;
  },
  async createTextbook(t) {
    return mutate((db) => {
      const row: TextbookChapter = { ...t, id: uid(), created_at: now() };
      db.textbooks.push(row);
      return row;
    });
  },
  async updateTextbook(id, patch) {
    return mutate((db) => {
      const t = db.textbooks.find((x) => x.id === id);
      if (!t) return null;
      Object.assign(t, patch);
      return t;
    });
  },
  async deleteTextbook(id) {
    await mutate((db) => {
      db.textbooks = db.textbooks.filter((t) => t.id !== id);
    });
  },
  async findTextbookForTopic(exam, subject, topic) {
    const db = loadSync();
    const pool = db.textbooks.filter((t) => t.is_published);
    return (
      pool.find((t) => t.exam === exam && t.subject === subject && t.topic_tags.includes(topic)) ??
      pool.find((t) => t.subject === subject && t.topic_tags.includes(topic)) ??
      pool.find((t) => t.topic_tags.includes(topic)) ??
      pool.find((t) => t.exam === exam && t.subject === subject) ??
      null
    );
  },

  // ---------------- bookmarks ----------------
  async toggleBookmark(userId, textbookId) {
    return mutate((db) => {
      const idx = db.bookmarks.findIndex((b) => b.user_id === userId && b.textbook_id === textbookId);
      if (idx >= 0) {
        db.bookmarks.splice(idx, 1);
        return false;
      }
      db.bookmarks.push({ id: uid(), user_id: userId, textbook_id: textbookId, created_at: now() });
      return true;
    });
  },
  async listBookmarks(userId) {
    return loadSync().bookmarks.filter((b) => b.user_id === userId);
  },

  // ---------------- payments ----------------
  async createPayment(p) {
    return mutate((db) => {
      const row: Payment = { ...p, id: uid(), created_at: now() };
      db.payments.push(row);
      return row;
    });
  },
  async getPaymentByRef(ref) {
    return loadSync().payments.find((p) => p.paystack_ref === ref) ?? null;
  },
  async updatePaymentByRef(ref, patch) {
    return mutate((db) => {
      const p = db.payments.find((x) => x.paystack_ref === ref);
      if (!p) return null;
      Object.assign(p, patch);
      return p;
    });
  },
  async listPayments(userId, limit = 200) {
    let rows = loadSync().payments.slice();
    if (userId) rows = rows.filter((p) => p.user_id === userId);
    return rows.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
  },

  // ---------------- settings ----------------
  async getSettings() {
    return { ...DEFAULT_SETTINGS, ...loadSync().settings };
  },
  async updateSettings(patch) {
    return mutate((db) => {
      db.settings = { ...db.settings, ...patch };
      return db.settings;
    });
  },
};
