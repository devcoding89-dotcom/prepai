import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { askGroq } from "@/lib/groq";
import { EXAMS, type Difficulty, type Exam } from "@/lib/types";

type GeneratedQuestion = {
  exam: Exam;
  subject: string;
  topic: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: Difficulty;
};

function parseGeneratedQuestion(answer: string): GeneratedQuestion {
  const json = answer.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const value = JSON.parse(json) as Partial<GeneratedQuestion>;
  const exam = String(value.exam ?? "").toUpperCase() as Exam;
  const options = Array.isArray(value.options) ? value.options.map(String).filter(Boolean).slice(0, 5) : [];
  const correctAnswer = String(value.correct_answer ?? "").toUpperCase();
  const difficulty = String(value.difficulty ?? "medium") as Difficulty;

  if (
    !EXAMS.includes(exam) ||
    !String(value.subject ?? "").trim() ||
    !String(value.topic ?? "").trim() ||
    !String(value.question_text ?? "").trim() ||
    options.length < 2 ||
    !["A", "B", "C", "D", "E"].slice(0, options.length).includes(correctAnswer) ||
    !["easy", "medium", "hard"].includes(difficulty)
  ) {
    throw new Error("The AI returned an invalid question format.");
  }

  return {
    exam,
    subject: String(value.subject).trim(),
    topic: String(value.topic).trim(),
    question_text: String(value.question_text).trim(),
    options,
    correct_answer: correctAnswer,
    explanation: String(value.explanation ?? "").trim(),
    difficulty,
  };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = (await request.json()) as { exam?: string; subject?: string; topic?: string; difficulty?: string };
  const exam = String(body.exam ?? "JAMB").toUpperCase();
  const subject = String(body.subject ?? "").trim();
  const topic = String(body.topic ?? "").trim();
  const difficulty = String(body.difficulty ?? "medium");
  if (!EXAMS.includes(exam as Exam)) return NextResponse.json({ error: "Choose a valid exam." }, { status: 400 });
  if (!subject || !topic) return NextResponse.json({ error: "Subject and topic are required." }, { status: 400 });
  if (!["easy", "medium", "hard"].includes(difficulty)) return NextResponse.json({ error: "Choose a valid difficulty." }, { status: 400 });

  try {
    const answer = await askGroq({
      exam,
      message: `Create one original ${exam} multiple-choice question for ${subject} on the topic ${topic} at ${difficulty} difficulty. Return ONLY valid JSON with exactly these keys: exam, subject, topic, question_text, options (an array of 4 options), correct_answer (one letter A-D), explanation, difficulty. Match the style and level of ${exam}; do not copy a real past question.`,
    });
    return NextResponse.json({ question: parseGeneratedQuestion(answer) });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "AI question generation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}