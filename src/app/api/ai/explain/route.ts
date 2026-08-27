import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { askGroq } from "@/lib/groq";
import { hit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Per-question "Explain this answer" endpoint.
 * Shares the tutor's hourly budget so one student cannot bypass the tutor
 * cap by splitting requests across the two endpoints.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const rl = hit(`ai-tutor:${user.id}`, 30, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "You have used your AI allowance for this hour. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const body = (await req.json().catch(() => null)) as { question_id?: unknown } | null;
  const questionId = typeof body?.question_id === "string" ? body.question_id : "";
  if (!questionId) return NextResponse.json({ error: "Missing question." }, { status: 400 });

  const question = await repo.getQuestion(questionId);
  if (!question) return NextResponse.json({ error: "Question not found." }, { status: 404 });

  const correctText = question.options[question.correct_answer.charCodeAt(0) - 65] ?? question.correct_answer;

  try {
    const answer = await askGroq({
      exam: question.exam,
      message: [
        `A student is reviewing this ${question.exam} ${question.subject} question on ${question.topic}:`,
        "",
        question.question_text,
        "",
        ...question.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`),
        "",
        `The correct answer is ${question.correct_answer} (${correctText}).`,
        question.explanation ? `The official explanation is: ${question.explanation}` : "",
        "",
        "Explain in 3-6 short sentences why the correct answer is right and the common trap behind the wrong options. Use simple language for a secondary-school student. Do not restate the whole question.",
      ]
        .filter(Boolean)
        .join("\n"),
    });
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("[ai/explain] request failed", error);
    return NextResponse.json(
      { error: "The AI explainer is unavailable right now. Please try again shortly." },
      { status: 502 },
    );
  }
}