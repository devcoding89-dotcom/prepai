// ---------------------------------------------------------------------------
// PrepAI — shared domain types
// ---------------------------------------------------------------------------

export type Exam = "JAMB" | "WAEC" | "NECO" | "AI GENERATED";
export const EXAMS: Exam[] = ["JAMB", "WAEC", "NECO", "AI GENERATED"];

export type Difficulty = "easy" | "medium" | "hard";
export type Role = "student" | "admin";
export type SubscriptionStatus = "inactive" | "active" | "expired";
export type SessionStatus = "in_progress" | "completed" | "abandoned";
export type PaymentStatus = "pending" | "success" | "failed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  target_exam: Exam | null;
  /** When the student sits their exam (ISO date) — powers the dashboard countdown. */
  exam_date: string | null;
  avatar_url: string | null;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null;
  /** Active session ID for single-device login enforcement. */
  current_session_id?: string | null;
  created_at: string;
  updated_at: string;
}

/** Internal record (local driver only) — never leaves the server. */
export interface UserRecord extends Profile {
  password_hash: string;
}

export interface Question {
  id: string;
  exam: Exam;
  subject: string;
  topic: string;
  question_text: string;
  /** Always 2-5 entries, index 0 === "A" */
  options: string[];
  /** Letter: "A" | "B" | "C" | "D" | "E" */
  correct_answer: string;
  explanation: string | null;
  difficulty: Difficulty;
  year: number | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  exam: Exam;
  subjects: string[];
  mode: "quick" | "standard" | "mock" | "topic";
  total_questions: number;
  question_ids: string[];
  duration_seconds: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  score_percent: number | null;
  time_taken_seconds: number | null;
  status: SessionStatus;
  started_at: string;
  ended_at: string | null;
}

export interface SessionAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option: string | null;
  is_correct: boolean | null;
  flagged: boolean;
  time_taken_ms: number;
  answered_at: string;
}

export interface WeaknessReport {
  id: string;
  user_id: string;
  session_id: string;
  exam: Exam;
  subject: string;
  topic: string;
  weakness_score: number; // 0-100, higher = weaker
  total_attempted: number;
  correct_count: number;
  wrong_count: number;
  severity: "critical" | "weak" | "fair" | "strong";
  recommendation: string;
  textbook_id: string | null;
  created_at: string;
}

export interface TextbookChapter {
  id: string;
  exam: Exam;
  subject: string;
  book_title: string;
  title: string;
  chapter_number: number | null;
  description: string | null;
  topic_tags: string[];
  /** Inline HTML content (used when no file uploaded) */
  content_html: string | null;
  /** Path/URL of an uploaded PDF/HTML asset */
  file_path: string | null;
  page_count: number | null;
  is_published: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  email: string;
  amount: number; // kobo
  paystack_ref: string;
  paystack_transaction_id: string | null;
  channel: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  textbook_id: string;
  created_at: string;
}

export interface AppSettings {
  site_name: string;
  price_kobo: number;
  currency: string;
  free_questions_per_day: number;
  paywall_enabled: boolean;
  weakness_threshold: number; // % wrong above which a topic is "weak"
}

// --- view models -----------------------------------------------------------

export interface DashboardStats {
  sessions: number;
  avg_score: number | null;
  best_score: number | null;
  questions_answered: number;
  accuracy: number | null;
  weak_topics: number;
  streak_days: number;
  trend: { label: string; score: number; date: string }[];
}

export interface SessionReview extends PracticeSession {
  answers: (SessionAnswer & { question: Question | null })[];
  weaknesses: WeaknessReport[];
}

export const SUBJECTS_BY_EXAM: Record<Exam, string[]> = {
  JAMB: [
    "Use of English",
    "Mathematics",
    "Further Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Agricultural Science",
    "Civic Education",
    "Economics",
    "Government",
    "Literature in English",
    "Commerce",
    "Accounting",
    "Geography",
    "Christian Religious Studies (CRS)",
    "Islamic Studies (IRS)",
    "Arabic",
    "Computer Studies",
    "History",
    "French",
  ],
  WAEC: [
    "English Language",
    "Mathematics",
    "Further Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Agricultural Science",
    "Civic Education",
    "Economics",
    "Government",
    "Literature in English",
    "Commerce",
    "Financial Accounting",
    "Geography",
    "Christian Religious Studies (CRS)",
    "Islamic Studies (IRS)",
    "Arabic",
    "Computer Studies",
    "History",
    "French",
  ],
  NECO: [
    "English Language",
    "Mathematics",
    "Further Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Agricultural Science",
    "Civic Education",
    "Economics",
    "Government",
    "Literature in English",
    "Commerce",
    "Financial Accounting",
    "Geography",
    "Christian Religious Studies (CRS)",
    "Islamic Studies (IRS)",
    "Arabic",
    "Computer Studies",
    "History",
    "French",
  ],
  "AI GENERATED": [
    "Mathematics",
    "English Language",
    "Further Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Agricultural Science",
    "Civic Education",
    "Economics",
    "Government",
    "Literature in English",
    "Commerce",
    "Accounting",
    "Geography",
    "Christian Religious Studies (CRS)",
    "Islamic Studies (IRS)",
    "Arabic",
    "Computer Studies",
    "General Knowledge",
  ],
};

export const LETTERS = ["A", "B", "C", "D", "E"];

// ---------------------------------------------------------------------------
// Battle Room (multiplayer)
// ---------------------------------------------------------------------------

export type BattleRoomStatus = "waiting" | "active" | "finished";

export interface BattleRoom {
  id: string;
  /** 6-character alphanumeric join code, e.g. "PX7K2M" */
  code: string;
  host_user_id: string;
  host_name: string;
  exam: Exam;
  subjects: string[];
  question_ids: string[];
  mode: "quick" | "standard";
  /** Total time for the battle in seconds — set by the host */
  duration_seconds: number;
  status: BattleRoomStatus;
  max_participants: number;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  /** Auto-cleanup: room expires 2 hours after creation */
  expires_at: string;
}

export interface BattleParticipant {
  id: string;
  room_id: string;
  /** null for guest players who joined without an account */
  user_id: string | null;
  display_name: string;
  is_host: boolean;
  /** Map of questionId → selected option letter ("A", "B", etc.) */
  answers: Record<string, string>;
  score_percent: number;
  correct_count: number;
  total_answered: number;
  finished: boolean;
  joined_at: string;
  finished_at: string | null;
}

// ---------------------------------------------------------------------------
// Announcements / Notices
// ---------------------------------------------------------------------------

export type AnnouncementType = "info" | "warning" | "alert" | "success";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  target_exam: Exam | "ALL";
  is_active: boolean;
  created_at: string;
}
