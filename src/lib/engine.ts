import "server-only";
import { repo } from "@/lib/db";
import type {
  Exam,
  PracticeSession,
  Question,
  SessionAnswer,
  WeaknessReport,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// The "AI" analysis engine.
//
// It is deliberately explainable rather than a black box: every number a
// student sees can be traced back to their answers. Signals used:
//   1. accuracy per topic          (how many they got wrong)
//   2. exposure                    (how many questions they saw — confidence)
//   3. speed                       (rushing vs. struggling, from time_taken_ms)
//   4. difficulty mix              (missing easy questions is worse)
//   5. history                     (is this topic repeatedly weak?)
// ---------------------------------------------------------------------------

export interface TopicAnalysis {
  exam: Exam;
  subject: string;
  topic: string;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  accuracy: number; // 0-100
  weakness_score: number; // 0-100 (higher = weaker)
  severity: "critical" | "weak" | "fair" | "strong";
  avg_seconds: number;
  pace: "rushed" | "steady" | "slow";
  missed_easy: number;
  confidence: "low" | "medium" | "high";
  recommendation: string;
  textbook_id: string | null;
}

export interface SessionAnalysis {
  score_percent: number;
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  accuracy: number;
  avg_seconds: number;
  topics: TopicAnalysis[];
  weak: TopicAnalysis[];
  strong: TopicAnalysis[];
  subjects: { subject: string; total: number; correct: number; accuracy: number }[];
  headline: string;
  advice: string[];
  predicted_jamb_score: number | null;
}

const severityFor = (weakness: number): TopicAnalysis["severity"] =>
  weakness >= 75 ? "critical" : weakness >= 50 ? "weak" : weakness >= 25 ? "fair" : "strong";

function buildRecommendation(t: {
  topic: string;
  subject: string;
  accuracy: number;
  pace: TopicAnalysis["pace"];
  missed_easy: number;
  total: number;
}): string {
  const bits: string[] = [];
  if (t.accuracy < 30) {
    bits.push(
      `You are missing the fundamentals of ${t.topic}. Read the recommended chapter end-to-end before attempting more questions.`,
    );
  } else if (t.accuracy < 60) {
    bits.push(
      `You understand parts of ${t.topic} but apply it inconsistently. Redo the worked examples, then drill 10-15 questions on this topic alone.`,
    );
  } else {
    bits.push(`${t.topic} is nearly there — tidy up the edge cases and keep it warm with short weekly drills.`);
  }
  if (t.missed_easy > 0) {
    bits.push(
      `${t.missed_easy} of the questions you missed here were rated easy, which usually means a definition or formula gap rather than a hard concept.`,
    );
  }
  if (t.pace === "rushed") {
    bits.push("You answered these unusually fast — slow down and re-read the question stem before choosing.");
  } else if (t.pace === "slow") {
    bits.push("You spent a long time on these. Memorising the standard method will buy you minutes in the real exam.");
  }
  if (t.total < 3) {
    bits.push("Only a few questions were sampled from this topic, so treat this as an early signal, not a verdict.");
  }
  return bits.join(" ");
}

export async function analyseSession(
  session: PracticeSession,
  answers: SessionAnswer[],
  questions: Question[],
): Promise<SessionAnalysis> {
  const qById = new Map(questions.map((q) => [q.id, q]));
  const settings = await repo.getSettings();
  const threshold = settings.weakness_threshold ?? 50;

  type Bucket = {
    subject: string;
    topic: string;
    total: number;
    correct: number;
    wrong: number;
    unanswered: number;
    seconds: number[];
    missed_easy: number;
  };
  const buckets = new Map<string, Bucket>();

  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  const allSeconds: number[] = [];

  for (const qid of session.question_ids) {
    const q = qById.get(qid);
    if (!q) continue;
    const a = answers.find((x) => x.question_id === qid);
    const key = `${q.subject}::${q.topic}`;
    const b: Bucket =
      buckets.get(key) ??
      { subject: q.subject, topic: q.topic, total: 0, correct: 0, wrong: 0, unanswered: 0, seconds: [], missed_easy: 0 };
    b.total++;
    if (!a || !a.selected_option) {
      b.unanswered++;
      unanswered++;
    } else {
      const secs = Math.round((a.time_taken_ms ?? 0) / 1000);
      if (secs > 0) {
        b.seconds.push(secs);
        allSeconds.push(secs);
      }
      if (a.is_correct) {
        b.correct++;
        correct++;
      } else {
        b.wrong++;
        wrong++;
        if (q.difficulty === "easy") b.missed_easy++;
      }
    }
    buckets.set(key, b);
  }

  const total = session.question_ids.length || 1;
  const avgAll = allSeconds.length ? allSeconds.reduce((s, x) => s + x, 0) / allSeconds.length : 0;

  const topics: TopicAnalysis[] = [];
  for (const b of buckets.values()) {
    const attempted = b.correct + b.wrong;
    const accuracy = attempted ? Math.round((b.correct / attempted) * 100) : 0;
    // unanswered counts as half-wrong: it usually means "I did not know it"
    const effectiveWrong = b.wrong + b.unanswered * 0.5;
    let weakness = Math.round((effectiveWrong / b.total) * 100);
    if (b.missed_easy > 0) weakness = Math.min(100, weakness + 5 * b.missed_easy);
    const avgSeconds = b.seconds.length ? Math.round(b.seconds.reduce((s, x) => s + x, 0) / b.seconds.length) : 0;
    const pace: TopicAnalysis["pace"] =
      avgAll === 0 || avgSeconds === 0 ? "steady" : avgSeconds < avgAll * 0.6 ? "rushed" : avgSeconds > avgAll * 1.6 ? "slow" : "steady";
    topics.push({
      exam: session.exam,
      subject: b.subject,
      topic: b.topic,
      total: b.total,
      correct: b.correct,
      wrong: b.wrong,
      unanswered: b.unanswered,
      accuracy,
      weakness_score: Math.max(0, Math.min(100, weakness)),
      severity: severityFor(weakness),
      avg_seconds: avgSeconds,
      pace,
      missed_easy: b.missed_easy,
      confidence: b.total >= 5 ? "high" : b.total >= 3 ? "medium" : "low",
      recommendation: buildRecommendation({
        topic: b.topic,
        subject: b.subject,
        accuracy,
        pace,
        missed_easy: b.missed_easy,
        total: b.total,
      }),
      textbook_id: null,
    });
  }

  const textbookMatches = await Promise.all(
    topics.map((topic) => repo.findTextbookForTopic(session.exam, topic.subject, topic.topic)),
  );
  topics.forEach((topic, index) => {
    topic.textbook_id = textbookMatches[index]?.id ?? null;
  });

  topics.sort((a, b) => b.weakness_score - a.weakness_score || b.total - a.total);

  const weak = topics.filter((t) => t.weakness_score >= threshold);
  const strong = topics.filter((t) => t.weakness_score <= 25).sort((a, b) => b.accuracy - a.accuracy);

  const subjectMap = new Map<string, { total: number; correct: number }>();
  for (const t of topics) {
    const s = subjectMap.get(t.subject) ?? { total: 0, correct: 0 };
    s.total += t.total;
    s.correct += t.correct;
    subjectMap.set(t.subject, s);
  }
  const subjects = [...subjectMap.entries()]
    .map(([subject, s]) => ({
      subject,
      total: s.total,
      correct: s.correct,
      accuracy: Math.round((s.correct / s.total) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const score = Math.round((correct / total) * 100);

  const headline =
    score >= 80
      ? "Excellent work — you are performing at a competitive level."
      : score >= 65
        ? "Solid performance. A few topics are holding your score back."
        : score >= 45
          ? "You have a foundation, but several topics need focused revision."
          : "This is a rebuilding phase. Work through the fundamentals topic by topic.";

  const advice: string[] = [];
  if (weak.length) {
    advice.push(
      `Start with ${weak[0].topic} (${weak[0].subject}) — it is your single biggest score leak this session.`,
    );
  }
  if (unanswered > 0) {
    advice.push(
      `${unanswered} question${unanswered > 1 ? "s were" : " was"} left unanswered. There is no negative marking in JAMB, WAEC or NECO, so always guess before time runs out.`,
    );
  }
  const rushed = topics.filter((t) => t.pace === "rushed" && t.accuracy < 60);
  if (rushed.length) {
    advice.push(
      `You rushed ${rushed.map((t) => t.topic).slice(0, 3).join(", ")}. Speed without accuracy costs marks — aim for ~40 seconds per objective question.`,
    );
  }
  if (subjects.length > 1) {
    advice.push(
      `Your weakest subject in this session was ${subjects[0].subject} (${subjects[0].accuracy}%) and your strongest was ${subjects[subjects.length - 1].subject} (${subjects[subjects.length - 1].accuracy}%).`,
    );
  }
  if (!weak.length && score >= 70) {
    advice.push("No topic crossed the weakness threshold. Increase difficulty or move to a full timed mock.");
  }

  return {
    score_percent: score,
    correct,
    wrong,
    unanswered,
    total,
    accuracy: correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : 0,
    avg_seconds: Math.round(avgAll),
    topics,
    weak,
    strong,
    subjects,
    headline,
    advice,
    predicted_jamb_score: session.exam === "JAMB" ? Math.round((score / 100) * 400) : null,
  };
}

/** Persist the weak topics of a session as weakness_reports rows. */
export async function persistWeaknesses(
  session: PracticeSession,
  analysis: SessionAnalysis,
): Promise<WeaknessReport[]> {
  const rows = analysis.topics
    .filter((t) => t.weakness_score >= 25) // keep 'fair' too so history is meaningful
    .map((t) => ({
      user_id: session.user_id,
      session_id: session.id,
      exam: session.exam,
      subject: t.subject,
      topic: t.topic,
      weakness_score: t.weakness_score,
      total_attempted: t.total,
      correct_count: t.correct,
      wrong_count: t.wrong,
      severity: t.severity,
      recommendation: t.recommendation,
      textbook_id: t.textbook_id,
    }));
  if (!rows.length) return [];
  return repo.insertWeaknesses(rows);
}

// ---------------------------------------------------------------------------
// Cross-session study plan: which topics keep coming back?
// ---------------------------------------------------------------------------

export interface StudyPlanItem {
  topic: string;
  subject: string;
  occurrences: number;
  avg_weakness: number;
  latest: string;
  trend: "improving" | "worsening" | "flat";
  textbook_id: string | null;
  priority: number;
}

export function buildStudyPlan(reports: WeaknessReport[]): StudyPlanItem[] {
  const byTopic = new Map<string, WeaknessReport[]>();
  for (const r of reports) {
    const key = `${r.subject}::${r.topic}`;
    byTopic.set(key, [...(byTopic.get(key) ?? []), r]);
  }
  const items: StudyPlanItem[] = [];
  for (const rows of byTopic.values()) {
    const sorted = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const avg = Math.round(sorted.reduce((s, r) => s + r.weakness_score, 0) / sorted.length);
    const first = sorted[0].weakness_score;
    const last = sorted[sorted.length - 1].weakness_score;
    const delta = last - first;
    items.push({
      topic: sorted[0].topic,
      subject: sorted[0].subject,
      occurrences: sorted.length,
      avg_weakness: avg,
      latest: sorted[sorted.length - 1].created_at,
      trend: sorted.length < 2 ? "flat" : delta <= -10 ? "improving" : delta >= 10 ? "worsening" : "flat",
      textbook_id: sorted[sorted.length - 1].textbook_id,
      priority: Math.round(last * 0.6 + avg * 0.25 + Math.min(sorted.length, 5) * 3),
    });
  }
  return items.sort((a, b) => b.priority - a.priority);
}
