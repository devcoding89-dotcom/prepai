import type {
  AppSettings,
  Bookmark,
  Difficulty,
  Exam,
  Payment,
  PracticeSession,
  Profile,
  Question,
  SessionAnswer,
  TextbookChapter,
  UserRecord,
  WeaknessReport,
} from "@/lib/types";

export interface QuestionFilter {
  exam?: Exam | "ALL";
  subject?: string;
  topic?: string;
  difficulty?: Difficulty;
  search?: string;
  onlyActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface PickSpec {
  exam: Exam;
  subjects?: string[];
  topics?: string[];
  count: number;
  difficulty?: Difficulty;
  shuffle?: boolean;
}

export interface TextbookFilter {
  exam?: Exam | "ALL";
  subject?: string;
  search?: string;
  topic?: string;
  onlyPublished?: boolean;
}

export interface Repo {
  readonly driver: "local" | "supabase";

  // users / profiles
  getUserByEmail(email: string): Promise<UserRecord | null>;
  getProfile(id: string): Promise<Profile | null>;
  createUser(input: {
    email: string;
    password_hash: string;
    full_name: string;
    role?: "student" | "admin";
  }): Promise<UserRecord>;
  updateProfile(id: string, patch: Partial<Profile>): Promise<Profile | null>;
  listProfiles(opts?: { search?: string; limit?: number }): Promise<Profile[]>;
  countProfiles(): Promise<number>;

  // questions
  listQuestions(f?: QuestionFilter): Promise<{ rows: Question[]; total: number }>;
  getQuestion(id: string): Promise<Question | null>;
  createQuestion(q: Omit<Question, "id" | "created_at">): Promise<Question>;
  updateQuestion(id: string, patch: Partial<Question>): Promise<Question | null>;
  deleteQuestion(id: string): Promise<void>;
  bulkCreateQuestions(rows: Omit<Question, "id" | "created_at">[]): Promise<number>;
  pickQuestions(spec: PickSpec): Promise<Question[]>;
  questionFacets(exam?: Exam | "ALL"): Promise<{ subjects: string[]; topics: string[] }>;
  questionCountsBySubject(exam?: Exam | "ALL"): Promise<{ subject: string; count: number }[]>;

  // sessions + answers
  createSession(s: Omit<PracticeSession, "id">): Promise<PracticeSession>;
  getSession(id: string): Promise<PracticeSession | null>;
  updateSession(id: string, patch: Partial<PracticeSession>): Promise<PracticeSession | null>;
  listSessions(userId: string, limit?: number): Promise<PracticeSession[]>;
  listAllSessions(limit?: number): Promise<PracticeSession[]>;
  upsertAnswer(a: Omit<SessionAnswer, "id">): Promise<SessionAnswer>;
  listAnswers(sessionId: string): Promise<SessionAnswer[]>;

  // weakness reports
  insertWeaknesses(rows: Omit<WeaknessReport, "id" | "created_at">[]): Promise<WeaknessReport[]>;
  listWeaknesses(userId: string, limit?: number): Promise<WeaknessReport[]>;
  listWeaknessesBySession(sessionId: string): Promise<WeaknessReport[]>;

  // textbooks
  listTextbooks(f?: TextbookFilter): Promise<TextbookChapter[]>;
  getTextbook(id: string): Promise<TextbookChapter | null>;
  createTextbook(t: Omit<TextbookChapter, "id" | "created_at">): Promise<TextbookChapter>;
  updateTextbook(id: string, patch: Partial<TextbookChapter>): Promise<TextbookChapter | null>;
  deleteTextbook(id: string): Promise<void>;
  findTextbookForTopic(exam: Exam, subject: string, topic: string): Promise<TextbookChapter | null>;

  // bookmarks
  toggleBookmark(userId: string, textbookId: string): Promise<boolean>;
  listBookmarks(userId: string): Promise<Bookmark[]>;

  // payments
  createPayment(p: Omit<Payment, "id" | "created_at">): Promise<Payment>;
  getPaymentByRef(ref: string): Promise<Payment | null>;
  updatePaymentByRef(ref: string, patch: Partial<Payment>): Promise<Payment | null>;
  listPayments(userId?: string, limit?: number): Promise<Payment[]>;

  // settings
  getSettings(): Promise<AppSettings>;
  updateSettings(patch: Partial<AppSettings>): Promise<AppSettings>;
}

export const DEFAULT_SETTINGS: AppSettings = {
  site_name: "PrepAI",
  price_kobo: 100000,
  currency: "NGN",
  free_questions_per_day: 10,
  paywall_enabled: true,
  weakness_threshold: 50,
};
