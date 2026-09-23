import "server-only";
import crypto from "node:crypto";
import { repo } from "@/lib/db";
import type { Payment } from "@/lib/types";

// ---------------------------------------------------------------------------
// Paystack integration.
// If PAYSTACK_SECRET_KEY is not set the platform runs in SIMULATION mode:
// checkout redirects to an internal mock page so the whole subscription flow
// (paywall → pay → webhook → access) can be tested end to end without keys.
// ---------------------------------------------------------------------------

export const paystackEnabled = Boolean(process.env.PAYSTACK_SECRET_KEY);
const API = "https://api.paystack.co";

export const SUBSCRIPTION_DAYS = 30;

export function newRef() {
  return `prepai_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

export function expiryFrom(base: Date = new Date()) {
  return new Date(base.getTime() + SUBSCRIPTION_DAYS * 864e5).toISOString();
}

export interface InitResult {
  ok: boolean;
  authorization_url?: string;
  reference?: string;
  error?: string;
  simulated?: boolean;
}

export async function initializeTransaction(opts: {
  userId: string;
  email: string;
  amountKobo: number;
  origin: string;
}): Promise<InitResult> {
  const reference = newRef();

  await repo.createPayment({
    user_id: opts.userId,
    email: opts.email,
    amount: opts.amountKobo,
    paystack_ref: reference,
    paystack_transaction_id: null,
    channel: null,
    status: "pending",
    paid_at: null,
    expires_at: null,
  });

  if (!paystackEnabled) {
    return {
      ok: true,
      simulated: true,
      reference,
      authorization_url: `${opts.origin}/payment/simulate?reference=${reference}`,
    };
  }

  try {
    const res = await fetch(`${API}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: opts.email,
        amount: opts.amountKobo,
        reference,
        callback_url: `${opts.origin}/payment/callback`,
        metadata: { user_id: opts.userId, plan: "monthly" },
        channels: ["card", "bank", "ussd", "bank_transfer", "mobile_money"],
      }),
    });
    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string; reference: string };
    };
    if (!json.status || !json.data) return { ok: false, error: json.message || "Paystack error" };
    return { ok: true, authorization_url: json.data.authorization_url, reference: json.data.reference };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function verifyTransaction(reference: string): Promise<{
  ok: boolean;
  status?: string;
  channel?: string | null;
  id?: string | null;
  error?: string;
}> {
  if (!paystackEnabled) {
    const p = await repo.getPaymentByRef(reference);
    return { ok: Boolean(p), status: p?.status === "success" ? "success" : "pending", channel: "simulated" };
  }
  try {
    const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    });
    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: { status: string; channel: string; id: number };
    };
    if (!json.status || !json.data) return { ok: false, error: json.message };
    return { ok: true, status: json.data.status, channel: json.data.channel, id: String(json.data.id) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

/** Marks a payment successful and extends the user's subscription. Idempotent. */
export async function activateSubscription(
  reference: string,
  extra: { transactionId?: string | null; channel?: string | null } = {},
): Promise<{ ok: boolean; payment?: Payment; error?: string }> {
  const payment = await repo.getPaymentByRef(reference);
  if (!payment) return { ok: false, error: "Unknown payment reference" };
  if (payment.status === "success") return { ok: true, payment };

  const profile = await repo.getProfile(payment.user_id);
  // stack on top of remaining time if the user is still active
  const base =
    profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()
      ? new Date(profile.subscription_expires_at)
      : new Date();
  const expires = expiryFrom(base);

  const updated = await repo.updatePaymentByRef(reference, {
    status: "success",
    paid_at: new Date().toISOString(),
    expires_at: expires,
    paystack_transaction_id: extra.transactionId ?? payment.paystack_transaction_id,
    channel: extra.channel ?? payment.channel,
  });

  await repo.updateProfile(payment.user_id, {
    subscription_status: "active",
    subscription_expires_at: expires,
  });

  return { ok: true, payment: updated ?? payment };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!paystackEnabled) {
    // Only permit unauthenticated simulated webhooks in non-production development
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    console.error("[Security] PAYSTACK_SECRET_KEY is not configured in production. Rejecting webhook.");
    return false;
  }
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  // Timing-safe compare so attackers can't probe the HMAC byte by byte.
  const a = Buffer.from(hash, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
