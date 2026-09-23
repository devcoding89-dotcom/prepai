import "server-only";
import { cookies, headers } from "next/headers";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { repo, usingSupabase } from "@/lib/db";
import { hit, reset, getClientIp } from "@/lib/rate-limit";
import type { Profile } from "@/lib/types";

const COOKIE = "prepai_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const GUEST_EMAIL = "guest@prepai.local";

function guestModeEnabled() {
  return false;
}

let guestProfilePromise: Promise<Profile> | null = null;
async function getGuestProfile(): Promise<Profile> {
  if (!guestProfilePromise) {
    guestProfilePromise = (async () => {
      let guestId: string = crypto.randomUUID();
      if (usingSupabase) {
        const { admin } = await import("@/lib/db/supabase");
        const created = await admin().auth.admin.createUser({
          email: GUEST_EMAIL,
          password: crypto.randomBytes(24).toString("base64url"),
          email_confirm: true,
          user_metadata: { full_name: "Guest Student" },
        });
        if (created.data.user) guestId = created.data.user.id;
        else if (/already been registered|already exists/i.test(created.error?.message ?? "")) {
          const users = await admin().auth.admin.listUsers({ page: 1, perPage: 1000 });
          const existing = users.data.users.find((user) => user.email === GUEST_EMAIL);
          if (!existing) throw new Error("Guest Auth user could not be found.");
          guestId = existing.id;
        } else {
          throw new Error(`Guest Auth setup failed: ${created.error?.message ?? "unknown error"}`);
        }
      }
      const profile: Profile = {
        id: guestId,
        email: GUEST_EMAIL,
        full_name: "Guest Student",
        role: "student",
        target_exam: null,
        exam_date: null,
        avatar_url: null,
        subscription_status: "active",
        subscription_expires_at: new Date(Date.now() + 3650 * 864e5).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (usingSupabase) {
        const { admin, T } = await import("@/lib/db/supabase");
        const { error } = await admin().from(T("profiles")).upsert(profile, { onConflict: "id" });
        if (error) throw new Error(`Guest profile setup failed: ${error.message}`);
      }
      return profile;
    })();
  }
  return guestProfilePromise;
}

let _ephemeralSecret: string | null = null;
function secret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV !== "production") return "prepai-dev-secret-change-me";
  // In production without AUTH_SECRET, use a deterministic key derived from
  // SUPABASE_SERVICE_ROLE_KEY so sessions are shared across serverless instances.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return crypto.createHash("sha256").update(process.env.SUPABASE_SERVICE_ROLE_KEY).digest("hex");
  }
  if (!_ephemeralSecret) {
    console.error(
      "CRITICAL SECURITY WARNING: AUTH_SECRET is not set in production! Generating an ephemeral secret key. Set AUTH_SECRET to prevent session invalidation.",
    );
    _ephemeralSecret = crypto.randomBytes(32).toString("hex");
  }
  return _ephemeralSecret;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encode(userId: string) {
  const body = Buffer.from(JSON.stringify({ uid: userId, iat: Date.now() })).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string | undefined): string | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as { uid: string; iat: number };
    if (Date.now() - parsed.iat > MAX_AGE * 1000) return null;
    return parsed.uid;
  } catch {
    return null;
  }
}

/** Signs a battle participant token bound to the specific room */
export function signBattleToken(roomId: string, participantId: string): string {
  const payload = `${roomId}:${participantId}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${participantId}.${sig}`;
}

/** Verifies that a battle participant token is genuine for the room and participant */
export function verifyBattleToken(roomId: string, participantId: string, token: string | undefined): boolean {
  if (!token) return false;
  const [tokenPid, sig] = token.split(".");
  if (!tokenPid || !sig || tokenPid !== participantId) return false;
  const expectedSig = crypto
    .createHmac("sha256", secret())
    .update(`${roomId}:${participantId}`)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function setSessionCookie(userId: string) {
  const jar = await cookies();
  const h = await headers();
  // Over HTTPS we default to SameSite=Lax for robust CSRF defense.
  // ALLOW_IFRAME_EMBED=true allows SameSite=None + Partitioned if the app is embedded in an external iframe preview.
  const isHttps = (h.get("x-forwarded-proto") ?? "http").split(",")[0].trim() === "https";
  const allowIframe = process.env.ALLOW_IFRAME_EMBED === "true";
  jar.set(COOKIE, encode(userId), {
    httpOnly: true,
    sameSite: allowIframe && isHttps ? "none" : "lax",
    secure: isHttps,
    ...(allowIframe && isHttps ? { partitioned: true } : {}),
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Current signed-in user (or null). Cached per request. */
export async function getCurrentUser(): Promise<Profile | null> {
  if (guestModeEnabled()) return getGuestProfile();
  const jar = await cookies();
  const uid = decode(jar.get(COOKIE)?.value);
  if (!uid) return null;
  const profile = await repo.getProfile(uid);
  if (!profile) return null;
  return normaliseSubscription(profile);
}

/** Flip 'active' → 'expired' once the expiry date has passed. */
function normaliseSubscription(p: Profile): Profile {
  if (
    p.subscription_status === "active" &&
    p.subscription_expires_at &&
    new Date(p.subscription_expires_at).getTime() < Date.now()
  ) {
    void repo.updateProfile(p.id, { subscription_status: "expired" });
    return { ...p, subscription_status: "expired" };
  }
  return p;
}

export function isSubscribed(p: Profile | null): boolean {
  if (!p) return false;
  if (p.role === "admin") return true;
  if (p.subscription_status !== "active") return false;
  if (!p.subscription_expires_at) return false;
  return new Date(p.subscription_expires_at).getTime() > Date.now();
}

/**
 * Whether this user may use paid features (practice sessions, textbooks).
 *
 * When the paywall is switched off in Admin -> Settings, everyone gets full
 * access regardless of subscription status. Prefer this over isSubscribed()
 * for gating features; use isSubscribed() only to describe billing state.
 */
export async function canAccessPaidFeatures(p: Profile | null): Promise<boolean> {
  if (!p) return false;
  if (guestModeEnabled() && p.email === GUEST_EMAIL) return true;
  const settings = await repo.getSettings();
  if (!settings.paywall_enabled) return true;
  return isSubscribed(p);
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  user?: Profile;
}

export async function signUp(input: {
  email: string;
  password: string;
  full_name: string;
}): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (input.password.length < 8) return { ok: false, error: "Password must be at least 8 characters long." };
  if (!input.full_name.trim()) return { ok: false, error: "Please enter your full name." };

  const clientIp = await getClientIp();
  const rl = hit(`signup:${clientIp}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Too many registration attempts. Please try again in ${Math.ceil(rl.retryAfterSeconds / 60)} minutes.`,
    };
  }

  if (usingSupabase) {
    const { admin, T } = await import("@/lib/db/supabase");
    // NO EMAIL IS EVER SENT TO THE STUDENT.
    //
    // We deliberately use the admin API with email_confirm: true instead of
    // the client-side supabase.auth.signUp(). signUp() would trigger a
    // "Confirm your email" message from Supabase; admin.createUser() creates
    // the account already confirmed and sends nothing.
    //
    // Do not swap this for signUp() unless you actually want confirmation
    // emails — see README section "Email behaviour".
    const { data, error } = await admin().auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true, // pre-confirmed => no verification email
      user_metadata: { full_name: input.full_name },
    });
    if (error || !data.user) {
      if (error?.message?.includes("Database error creating new user")) {
        console.error("[auth:signUp] Database error creating new user. A Postgres trigger on auth.users failed. Please run migration 0008_fix_auth_profile.sql in the Supabase SQL editor.");
        return { ok: false, error: "Database error creating user. Please ensure migration 0008_fix_auth_profile.sql has been executed in your Supabase SQL editor." };
      }
      return { ok: false, error: error?.message ?? "Could not create account." };
    }
    // Create the profile row ourselves rather than relying on a database
    // trigger — safer when the Supabase project is shared with another app.
    let profile = await repo.getProfile(data.user.id);
    if (!profile) {
      const now = new Date().toISOString();
      const { error: profileError } = await admin()
        .from(T("profiles"))
        .upsert(
          {
            id: data.user.id,
            email,
            full_name: input.full_name.trim(),
            role: "student",
            subscription_status: "inactive",
            created_at: now,
            updated_at: now,
          },
          { onConflict: "id" },
        );
      if (profileError) {
        console.error("[auth:signUp] Profile upsert failed:", profileError.message, profileError);
        return { ok: false, error: `Account created, but your profile could not be set up. Details: ${profileError.message}` };
      }
      profile = await repo.getProfile(data.user.id);
    }
    await setSessionCookie(data.user.id);
    return { ok: true, user: profile ?? undefined };
  }

  const existing = await repo.getUserByEmail(email);
  if (existing) return { ok: false, error: "An account with this email already exists." };
  const user = await repo.createUser({
    email,
    password_hash: bcrypt.hashSync(input.password, 10),
    full_name: input.full_name.trim(),
  });
  await setSessionCookie(user.id);
  const { password_hash: _pw, ...profile } = user;
  void _pw;
  return { ok: true, user: profile };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const mail = email.trim().toLowerCase();
  const clientIp = await getClientIp();

  // IP-level credential stuffing protection: max 40 attempts per IP per 15 minutes
  const ipRl = hit(`login-ip:${clientIp}`, 40, 15 * 60 * 1000);
  if (!ipRl.ok) {
    return {
      ok: false,
      error: `Too many login attempts from this network. Please try again in ${Math.ceil(ipRl.retryAfterSeconds / 60)} minutes.`,
    };
  }

  // Brute-force brake: 8 failed attempts per email per 15 minutes. The check
  // runs before any password verification so locked accounts cannot be probed.
  const rl = hit(`login:${mail}`, 8, 15 * 60 * 1000);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Too many failed attempts for this account. Please try again in ${Math.ceil(rl.retryAfterSeconds / 60)} minute${
        Math.ceil(rl.retryAfterSeconds / 60) === 1 ? "" : "s"
      }.`,
    };
  }

  if (usingSupabase) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } },
      );
      const { data, error } = await client.auth.signInWithPassword({ email: mail, password });
      if (error || !data.user) return { ok: false, error: "Incorrect email or password." };
      let profile = await repo.getProfile(data.user.id);
      if (!profile) {
        const { admin, T } = await import("@/lib/db/supabase");
        const { data: authUser } = await admin().auth.admin.getUserById(data.user.id);
        const now = new Date().toISOString();
        const { error: profileError } = await admin()
          .from(T("profiles"))
          .upsert(
            {
              id: data.user.id,
              email: mail,
              full_name: String(authUser.user?.user_metadata?.full_name ?? ""),
              role: "student",
              subscription_status: "inactive",
              created_at: now,
              updated_at: now,
            },
            { onConflict: "id" },
          );
        if (profileError) {
          console.error("[auth:signIn] Profile upsert failed:", profileError.message, profileError);
          return { ok: false, error: `Your account exists, but its profile could not be set up. Details: ${profileError.message}` };
        }
        profile = await repo.getProfile(data.user.id);
      }
      if (!profile) return { ok: false, error: "Your account profile is not ready. Please try again." };
      reset(`login:${mail}`);
      await setSessionCookie(data.user.id);
      return { ok: true, user: profile };
    } catch (error) {
      console.error("[auth] Supabase sign-in failed", error);
      return { ok: false, error: "Login is temporarily unavailable. Please check your connection and try again." };
    }
  }

  const user = await repo.getUserByEmail(mail);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return { ok: false, error: "Incorrect email or password." };
  }
  reset(`login:${mail}`);
  await setSessionCookie(user.id);
  const { password_hash: _pw, ...profile } = user;
  void _pw;
  return { ok: true, user: profile };
}

export async function signOut() {
  await clearSessionCookie();
}
