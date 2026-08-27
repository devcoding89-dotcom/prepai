import "server-only";
import { repo } from "@/lib/db";
import { analyseSession, persistWeaknesses, type SessionAnalysis } from "@/lib/engine";
import { EXAMS, type Difficulty, type Exam, type PracticeSession, type Question } from "@/lib/types";

export const MODES = {
  quick: { label: "Quick drill", count: 10, secondsPerQuestion: 60 },
  standard: { label: "Standard set", count: 50, secondsPerQuestion: 55 },
  mock: { label: "Full mock", count: 100, secondsPerQuestion: 42 },
  topic: { label: "Topic drill", count: 15, secondsPerQuestion: 60 },
} as const;

export type Mode = keyof typeof MODES;

export function mockSizeFor(exam: Exam) {
  return exam === "JAMB" ? { count: 180, seconds: 120 * 60 } : { count: 100, seconds: 90 * 60 };
}

export interface StartInput {
  userId: string;
  exam: Exam;
  subjects: string[];
  topics?: string[];
  mode: Mode;
  count?: number;
  difficulty?: Difficulty;
  durationSeconds?: number;
  shuffle?: boolean;
}

export async function startSession(input: StartInput): Promise<
  { ok: true; session: PracticeSession } | { ok: false; error: string }
> {
  if (!EXAMS.includes(input.exam)) return { ok: false, error: "Choose a valid exam." };
  if (!Object.prototype.hasOwnProperty.call(MODES, input.mode)) {
    return { ok: false, error: "Choose a valid practice mode." };
  }
  if (input.count != null && (!Number.isInteger(input.count) || input.count < 1 || input.count > 500)) {
    return { ok: false, error: "Question count must be between 1 and 500." };
  }
  const modeCfg = MODES[input.mode];
  let count = input.count ?? modeCfg.count;
  let duration = input.durationSeconds ?? count * modeCfg.secondsPerQuestion;

  if (input.mode === "mock") {
    const m = mockSizeFor(input.exam);
    count = input.count ?? m.count;
    duration = input.durationSeconds ?? m.seconds;
  }

  const questions = await repo.pickQuestions({
    exam: input.exam,
    subjects: input.subjects.length ? input.subjects : undefined,
    topics: input.topics?.length ? input.topics : undefined,
    count,
    difficulty: input.difficulty,
    shuffle: input.shuffle,
  });

  if (questions.length === 0) {
    return {
      ok: false,
      error:
        "No questions match that selection yet. Try different subjects, or ask your admin to add questions to the bank.",
    };
  }

  const actual = questions.length;
  const session = await repo.createSession({
    user_id: input.userId,
    exam: input.exam,
    subjects: [...new Set(questions.map((q) => q.subject))],
    mode: input.mode,
    total_questions: actual,
    question_ids: questions.map((q) => q.id),
    duration_seconds: Math.min(duration, actual * modeCfg.secondsPerQuestion * 2),
    correct_count: 0,
    wrong_count: 0,
    unanswered_count: actual,
    score_percent: null,
    time_taken_seconds: null,
    status: "in_progress",
    started_at: new Date().toISOString(),
    ended_at: null,
  });

  return { ok: true, session };
}

/** Question shape sent to the browser — answers and explanations removed. */
export type SafeQuestion = Omit<Question, "correct_answer" | "explanation">;

export function stripAnswers(q: Question): SafeQuestion {
  const { correct_answer: _a, explanation: _e, ...rest } = q;
  void _a;
  void _e;
  return rest;
}

export async function loadSessionQuestions(session: PracticeSession): Promise<Question[]> {
  const all = await Promise.all(session.question_ids.map((id) => repo.getQuestion(id)));
  return all.filter((q): q is Question => Boolean(q));
}

export async function recordAnswer(opts: {
  sessionId: string;
  questionId: string;
  selected: string | null;
  flagged: boolean;
  timeMs: number;
}) {
  const question = await repo.getQuestion(opts.questionId);
  if (!question) return null;
  return repo.upsertAnswer({
    session_id: opts.sessionId,
    question_id: opts.questionId,
    selected_option: opts.selected,
    is_correct: opts.selected ? opts.selected === question.correct_answer : null,
    flagged: opts.flagged,
    time_taken_ms: opts.timeMs,
    answered_at: new Date().toISOString(),
  });
}

export async function submitSession(
  session: PracticeSession,
): Promise<{ session: PracticeSession; analysis: SessionAnalysis }> {
  const [answers, questions] = await Promise.all([
    repo.listAnswers(session.id),
    loadSessionQuestions(session),
  ]);

  const analysis = await analyseSession(session, answers, questions);
  const timeTaken = Math.min(
    session.duration_seconds,
    Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000),
  );

  const updated =
    (await repo.updateSession(session.id, {
      status: "completed",
      correct_count: analysis.correct,
      wrong_count: analysis.wrong,
      unanswered_count: analysis.unanswered,
      score_percent: analysis.score_percent,
      time_taken_seconds: timeTaken,
      ended_at: new Date().toISOString(),
    })) ?? session;

  // avoid duplicate reports if submit is called twice
  const existing = await repo.listWeaknessesBySession(session.id);
  if (existing.length === 0) await persistWeaknesses(updated, analysis);

  return { session: updated, analysis };
}
