import { type Exam, type Question } from "@/lib/types";

export interface AlocRawQuestion {
  id: number | string;
  question: string;
  option: {
    a?: string;
    b?: string;
    c?: string;
    d?: string;
    e?: string;
  };
  section?: string;
  image?: string;
  answer: string;
  solution?: string;
  examtype?: string;
  examyear?: string;
}

export interface AlocSubject {
  slug: string;
  name: string;
}

export const ALOC_SUBJECTS: AlocSubject[] = [
  { slug: "english", name: "English Language" },
  { slug: "mathematics", name: "Mathematics" },
  { slug: "biology", name: "Biology" },
  { slug: "physics", name: "Physics" },
  { slug: "chemistry", name: "Chemistry" },
  { slug: "economics", name: "Economics" },
  { slug: "government", name: "Government" },
  { slug: "commerce", name: "Commerce" },
  { slug: "accounting", name: "Financial Accounting" },
  { slug: "englishlit", name: "Literature in English" },
  { slug: "crk", name: "Christian Religious Knowledge (CRK)" },
  { slug: "irk", name: "Islamic Religious Knowledge (IRK)" },
  { slug: "geography", name: "Geography" },
  { slug: "civiledu", name: "Civic Education" },
  { slug: "history", name: "History" },
  { slug: "currentaffairs", name: "Current Affairs" },
  { slug: "insurance", name: "Insurance" },
];

function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function formatAlocQuestion(
  raw: AlocRawQuestion,
  targetExam: Exam,
  subjectName: string
): Omit<Question, "id" | "created_at"> | null {
  if (!raw || !raw.question || !raw.option || !raw.answer) return null;

  const questionText = sanitizeHtml(raw.question);
  if (!questionText) return null;

  const optA = raw.option.a ? sanitizeHtml(raw.option.a) : "";
  const optB = raw.option.b ? sanitizeHtml(raw.option.b) : "";
  const optC = raw.option.c ? sanitizeHtml(raw.option.c) : "";
  const optD = raw.option.d ? sanitizeHtml(raw.option.d) : "";
  const optE = raw.option.e ? sanitizeHtml(raw.option.e) : "";

  const options = [optA, optB, optC, optD, optE].filter(Boolean);
  if (options.length < 2) return null;

  const answerKey = (raw.answer || "").trim().toUpperCase();
  const validLetters = ["A", "B", "C", "D", "E"].slice(0, options.length);
  if (!validLetters.includes(answerKey)) {
    // If the answer is an option string instead of letter
    const index = options.findIndex((opt) => opt.toLowerCase() === raw.answer.trim().toLowerCase());
    if (index === -1) return null;
  }

  const rawSolution = raw.solution || raw.section || "";
  const explanation = rawSolution ? sanitizeHtml(rawSolution) : null;

  const yearNum = raw.examyear ? parseInt(raw.examyear, 10) : null;
  const year = yearNum && !isNaN(yearNum) && yearNum >= 1970 && yearNum <= 2030 ? yearNum : null;

  let imageUrl: string | null = null;
  if (raw.image && raw.image.trim()) {
    imageUrl = raw.image.startsWith("http")
      ? raw.image.trim()
      : `https://questions.aloc.com.ng/${raw.image.trim().replace(/^\//, "")}`;
  }

  return {
    exam: targetExam,
    subject: subjectName,
    topic: subjectName,
    question_text: questionText,
    options: options.slice(0, 5),
    correct_answer: validLetters.includes(answerKey) ? answerKey : validLetters[0],
    explanation: explanation || null,
    difficulty: "medium",
    year,
    image_url: imageUrl,
    is_active: true,
  };
}

export async function fetchFromAloc(params: {
  subjectSlug: string;
  exam: Exam;
  count?: number;
  year?: number;
  token?: string;
}): Promise<AlocRawQuestion[]> {
  const token = params.token || process.env.ALOC_ACCESS_TOKEN || "QB-05efc0cc3a1ed7a0b78d";
  const limit = Math.min(Math.max(Number(params.count) || 40, 1), 40);

  // Note: ALOC's free tier doesn't reliably filter by exam type.
  // We omit the type filter and let the API return whatever it has for the subject.
  let url = `https://questions.aloc.com.ng/api/v2/m/${limit}?subject=${encodeURIComponent(params.subjectSlug)}`;
  if (params.year) {
    url += `&year=${params.year}`;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      AccessToken: token,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`ALOC API returned status ${response.status}: ${errorText || response.statusText}`);
  }

  const json = (await response.json()) as {
    status?: number;
    total?: number;
    data?: AlocRawQuestion[] | AlocRawQuestion;
    error?: string;
    message?: string;
  };

  // ALOC sometimes returns a `message` field alongside actual data (e.g. fallback results).
  // Only treat it as a fatal error if there is NO data at all.
  const hasData = Array.isArray(json.data) ? json.data.length > 0 : Boolean(json.data);
  if (json.error && !hasData) {
    throw new Error(json.error || "Failed to fetch from ALOC API");
  }

  if (Array.isArray(json.data)) {
    return json.data;
  } else if (json.data && typeof json.data === "object") {
    return [json.data];
  }

  return [];
}
