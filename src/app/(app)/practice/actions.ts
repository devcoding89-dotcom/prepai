"use server";

import { redirect } from "next/navigation";
import { canAccessPaidFeatures, getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { MODES, startSession, type Mode } from "@/lib/services/practice";
import { EXAMS, type Difficulty, type Exam } from "@/lib/types";

export interface PracticeFormState {
  error?: string;
}

/** Questions the user has already answered in sessions started today (UTC). */
async function questionsAnsweredToday(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const sessions = await repo.listSessions(userId, 200);
  return sessions
    .filter((s) => s.started_at.slice(0, 10) === today)
    .reduce((sum, s) => sum + s.total_questions, 0);
}

export async function startPracticeAction(
  _prev: PracticeFormState,
  formData: FormData,
): Promise<PracticeFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const settings = await repo.getSettings();
  const freeLimit = settings.free_questions_per_day;

  if (!(await canAccessPaidFeatures(user))) {
    // Free tier: cap the number of questions per day when the setting is on.
    if (freeLimit > 0) {
      const used = await questionsAnsweredToday(user.id);
      if (used >= freeLimit) {
        return {
          error: `You have used all ${freeLimit} free questions for today. Subscribe to keep practising — or come back tomorrow.`,
        };
      }
    } else {
      redirect("/billing?reason=practice");
    }
  }

  const examValue = String(formData.get("exam") ?? user.target_exam ?? "JAMB");
  if (!EXAMS.includes(examValue as Exam)) return { error: "Choose a valid exam." };
  const exam = examValue as Exam;
  const subjects = formData.getAll("subjects").map(String).filter(Boolean);
  const topics = formData.getAll("topics").map(String).filter(Boolean);
  const modeValue = String(formData.get("mode") ?? "quick");
  if (!Object.prototype.hasOwnProperty.call(MODES, modeValue)) return { error: "Choose a valid practice mode." };
  const mode = modeValue as Mode;
  const difficultyRaw = String(formData.get("difficulty") ?? "");
  const difficulty = ["easy", "medium", "hard"].includes(difficultyRaw)
    ? (difficultyRaw as Difficulty)
    : undefined;
  const shuffle = String(formData.get("shuffle") ?? "yes") === "yes";
  const customCount = Number(formData.get("count") ?? 0);
  if (!Number.isFinite(customCount) || customCount < 0 || customCount > 500) {
    return { error: "Question count must be between 1 and 500." };
  }

  if (!subjects.length && !topics.length) {
    return { error: "Select at least one subject to practise." };
  }

  // Trim the requested count so free users never exceed their daily budget.
  let effectiveCount = customCount > 0 ? customCount : undefined;
  if (!(await canAccessPaidFeatures(user)) && freeLimit > 0) {
    const used = await questionsAnsweredToday(user.id);
    const remaining = Math.max(0, freeLimit - used);
    if (effectiveCount == null || effectiveCount > remaining) {
      effectiveCount = remaining;
    }
    if (effectiveCount < 1) {
      return {
        error: `You have used all ${freeLimit} free questions for today. Subscribe to keep practising — or come back tomorrow.`,
      };
    }
  }

  const res = await startSession({
    userId: user.id,
    exam,
    subjects,
    topics,
    mode,
    difficulty,
    shuffle,
    count: effectiveCount,
  });

  if (!res.ok) return { error: res.error };
  redirect(`/practice/session/${res.session.id}`);
}

/**
 * "Retry my mistakes" — builds a fresh session out of the questions the user
 * got wrong (or skipped) in a completed session. Spaced-repetition lite: the
 * fastest way to turn a weak topic around is to re-drill exactly what missed.
 */
export async function retryMistakesAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  if (!(await canAccessPaidFeatures(user))) {
    redirect("/billing?reason=practice");
  }

  const sessionId = String(formData.get("session_id") ?? "");
  const session = await repo.getSession(sessionId);
  if (!session || session.user_id !== user.id) redirect("/reports");
  if (session.status !== "completed") redirect(`/practice/session/${session.id}`);

  const answers = await repo.listAnswers(session.id);
  const aById = new Map(answers.map((a) => [a.question_id, a]));

  // Wrong OR skipped questions, in their original order.
  const missedIds = session.question_ids.filter((qid) => {
    const a = aById.get(qid);
    return !a?.selected_option || a.is_correct === false;
  });
  if (!missedIds.length) redirect(`/reports/${session.id}`);

  const now = new Date().toISOString();
  const created = await repo.createSession({
    user_id: user.id,
    exam: session.exam,
    subjects: session.subjects,
    mode: "topic",
    total_questions: missedIds.length,
    question_ids: missedIds,
    duration_seconds: Math.min(missedIds.length * 90, 60 * 60),
    correct_count: 0,
    wrong_count: 0,
    unanswered_count: missedIds.length,
    score_percent: null,
    time_taken_seconds: null,
    status: "in_progress",
    started_at: now,
    ended_at: null,
  });
  redirect(`/practice/session/${created.id}`);
}
