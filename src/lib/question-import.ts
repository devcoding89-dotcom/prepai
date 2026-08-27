import { EXAMS, type Difficulty, type Exam, type Question } from "@/lib/types";

export type Incoming = Partial<Record<string, unknown>>;

const LETTERS = ["A", "B", "C", "D", "E"];

export function normaliseRow(raw: Incoming, fallbackExam?: Exam): { ok: true; row: Omit<Question, "id" | "created_at"> } | { ok: false; error: string } {
  const get = (k: string) => {
    const v = raw[k];
    return v == null ? "" : String(v).trim();
  };

  const rawExam = get("exam").toUpperCase();
  const exam = (rawExam === "AI GENERATED" && fallbackExam ? fallbackExam : rawExam) as Exam;
  if (!EXAMS.includes(exam)) return { ok: false, error: `Invalid exam "${get("exam")}" (use JAMB, WAEC, NECO or AI GENERATED)` };

  let options: string[] = [];
  const rawOptions = raw["options"];
  if (Array.isArray(rawOptions)) {
    options = rawOptions.map((o) => String(o).trim()).filter(Boolean);
  } else if (typeof rawOptions === "string" && rawOptions.trim()) {
    const s = rawOptions.trim();
    if (s.startsWith("[")) {
      try {
        options = (JSON.parse(s) as unknown[]).map((o) => String(o).trim());
      } catch {
        options = s.split("|").map((o) => o.trim());
      }
    } else {
      options = s.split("|").map((o) => o.trim());
    }
  } else {
    options = ["option_a", "option_b", "option_c", "option_d", "option_e"]
      .map((k) => get(k))
      .filter(Boolean);
  }
  options = options.filter(Boolean);
  if (options.length < 2) return { ok: false, error: "At least two options are required" };
  if (options.length > 5) options = options.slice(0, 5);

  let answer = get("correct_answer") || get("answer");
  if (!answer) return { ok: false, error: "Missing correct_answer" };
  if (!LETTERS.includes(answer.toUpperCase())) {
    // allow the full answer text
    const idx = options.findIndex((o) => o.toLowerCase() === answer.toLowerCase());
    if (idx === -1) return { ok: false, error: `correct_answer "${answer}" is not A–E and does not match any option` };
    answer = LETTERS[idx];
  }
  answer = answer.toUpperCase();
  if (LETTERS.indexOf(answer) >= options.length) return { ok: false, error: `correct_answer ${answer} is out of range` };

  const question_text = get("question_text") || get("question");
  if (!question_text) return { ok: false, error: "Missing question_text" };
  const subject = get("subject");
  if (!subject) return { ok: false, error: "Missing subject" };
  const topic = get("topic") || subject;

  const difficultyRaw = get("difficulty").toLowerCase();
  const difficulty: Difficulty = ["easy", "medium", "hard"].includes(difficultyRaw)
    ? (difficultyRaw as Difficulty)
    : "medium";
  const yearNum = Number(get("year"));

  return {
    ok: true,
    row: {
      exam,
      subject,
      topic,
      question_text,
      options,
      correct_answer: answer,
      explanation: get("explanation") || null,
      difficulty,
      year: Number.isFinite(yearNum) && yearNum > 1900 ? yearNum : null,
      image_url: get("image_url") || null,
      is_active: get("is_active").toLowerCase() === "false" ? false : true,
    },
  };
}
