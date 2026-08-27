import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { askGroq, type TutorMessage } from "@/lib/groq";
import { hit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Each user gets 30 tutor messages per rolling hour — enough for a real
// study session, tight enough that one account cannot drain the Groq quota.
const TUTOR_LIMIT = 30;
const TUTOR_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const rl = hit(`ai-tutor:${user.id}`, TUTOR_LIMIT, TUTOR_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: `You have used your ${TUTOR_LIMIT} tutor messages for this hour. Try again in about ${Math.ceil(
          rl.retryAfterSeconds / 60,
        )} minute${Math.ceil(rl.retryAfterSeconds / 60) === 1 ? "" : "s"}.`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    message?: unknown;
    history?: unknown;
  } | null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 2000) {
    return NextResponse.json({ error: "Ask a question between 1 and 2,000 characters." }, { status: 400 });
  }

  const history: TutorMessage[] = Array.isArray(body?.history)
    ? body.history.flatMap((item): TutorMessage[] => {
        if (!item || typeof item !== "object") return [];
        const candidate = item as { role?: unknown; text?: unknown };
        if (typeof candidate.text !== "string") return [];
        if (candidate.role === "user") return [{ role: "user", text: candidate.text }];
        if (candidate.role === "assistant" || candidate.role === "model") {
          return [{ role: "assistant", text: candidate.text }];
        }
        return [];
      })
    : [];

  try {
    const answer = await askGroq({ message, history, exam: user.target_exam });
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("[ai/tutor] request failed", error);
    const detail = error instanceof Error ? error.message : "";
    const networkFailure = /fetch failed|timeout|connect|non-JSON response/i.test(detail);
    const quotaFailure = /quota|billing|rate limit|429/i.test(detail);
    return NextResponse.json(
      {
        error: quotaFailure
          ? "Groq has reached its free usage limit. Wait and try again, or check your Groq account limits."
          : networkFailure
            ? "The AI service cannot be reached from this server. Check your internet connection, firewall or proxy, then try again."
            : "The AI tutor is unavailable. Check the Groq API key and try again.",
      },
      { status: 502 },
    );
  }
}
