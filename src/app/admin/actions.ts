"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { expiryFrom } from "@/lib/paystack";
import { EXAMS, type Difficulty, type Exam, type Question } from "@/lib/types";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/admin");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export interface AdminState {
  error?: string;
  ok?: string;
}

// ---------------------------------------------------------------- questions

function parseQuestionForm(formData: FormData) {
  const options = [1, 2, 3, 4, 5]
    .map((i) => String(formData.get(`option_${i}`) ?? "").trim())
    .filter(Boolean);
  return {
    exam: String(formData.get("exam") ?? "JAMB") as Exam,
    subject: String(formData.get("subject") ?? "").trim(),
    topic: String(formData.get("topic") ?? "").trim(),
    question_text: String(formData.get("question_text") ?? "").trim(),
    options,
    correct_answer: String(formData.get("correct_answer") ?? "A").trim().toUpperCase(),
    explanation: String(formData.get("explanation") ?? "").trim() || null,
    difficulty: (String(formData.get("difficulty") ?? "medium") as Difficulty) || "medium",
    year: Number(formData.get("year")) || null,
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    is_active: formData.get("is_active") !== null,
  };
}

function validateQuestion(q: ReturnType<typeof parseQuestionForm>): string | null {
  if (!EXAMS.includes(q.exam)) return "Choose a valid exam.";
  if (!q.subject) return "Subject is required.";
  if (!q.topic) return "Topic is required.";
  if (!q.question_text) return "Question text is required.";
  if (q.options.length < 2) return "Provide at least two options.";
  const letters = ["A", "B", "C", "D", "E"].slice(0, q.options.length);
  if (!letters.includes(q.correct_answer)) return `Correct answer must be one of ${letters.join(", ")}.`;
  return null;
}

export async function createQuestionAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = parseQuestionForm(formData);
  const error = validateQuestion(parsed);
  if (error) return { error };
  await repo.createQuestion(parsed);
  revalidatePath("/admin/questions");
  if (formData.get("another")) return { ok: "Question saved. Add another." };
  redirect("/admin/questions?created=1");
}

export async function updateQuestionAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = parseQuestionForm(formData);
  const error = validateQuestion(parsed);
  if (error) return { error };
  await repo.updateQuestion(id, parsed as Partial<Question>);
  revalidatePath("/admin/questions");
  redirect("/admin/questions?updated=1");
}

export async function deleteQuestionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await repo.deleteQuestion(id);
  revalidatePath("/admin/questions");
}

export async function toggleQuestionActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const q = await repo.getQuestion(id);
  if (q) await repo.updateQuestion(id, { is_active: !q.is_active });
  revalidatePath("/admin/questions");
}

// ---------------------------------------------------------------- textbooks

export async function saveTextbookAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const payload = {
    exam: String(formData.get("exam") ?? "JAMB") as Exam,
    subject: String(formData.get("subject") ?? "").trim(),
    book_title: String(formData.get("book_title") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    chapter_number: Number(formData.get("chapter_number")) || null,
    description: String(formData.get("description") ?? "").trim() || null,
    topic_tags: String(formData.get("topic_tags") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    content_html: String(formData.get("content_html") ?? "").trim() || null,
    file_path: String(formData.get("file_path") ?? "").trim() || null,
    page_count: Number(formData.get("page_count")) || null,
    is_published: formData.get("is_published") !== null,
  };
  if (!payload.subject || !payload.title || !payload.book_title) {
    return { error: "Book title, chapter title and subject are required." };
  }
  if (!payload.content_html && !payload.file_path) {
    return { error: "Add chapter content, or upload/link a file." };
  }
  if (id) await repo.updateTextbook(id, payload);
  else await repo.createTextbook(payload);
  revalidatePath("/admin/textbooks");
  redirect("/admin/textbooks?saved=1");
}

export async function deleteTextbookAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await repo.deleteTextbook(id);
  revalidatePath("/admin/textbooks");
}

// -------------------------------------------------------------------- users

export async function updateUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const op = String(formData.get("op") ?? "");
  const target = await repo.getProfile(id);
  if (!target) return;

  if (op === "make_admin") await repo.updateProfile(id, { role: "admin" });
  if (op === "make_student") await repo.updateProfile(id, { role: "student" });
  if (op === "grant") {
    await repo.updateProfile(id, {
      subscription_status: "active",
      subscription_expires_at: expiryFrom(
        target.subscription_expires_at && new Date(target.subscription_expires_at) > new Date()
          ? new Date(target.subscription_expires_at)
          : new Date(),
      ),
    });
  }
  if (op === "revoke") {
    await repo.updateProfile(id, { subscription_status: "inactive", subscription_expires_at: null });
  }
  if (op === "delete") {
    await repo.deleteUser(id);
  }
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await repo.deleteUser(id);
  }
  revalidatePath("/admin/users");
}

// ----------------------------------------------------------------- settings

export async function saveSettingsAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const price = Number(formData.get("price_naira"));
  if (!price || price < 100) return { error: "Enter a valid price (₦100 or more)." };
  const threshold = Number(formData.get("weakness_threshold"));
  await repo.updateSettings({
    site_name: String(formData.get("site_name") ?? "PrepAI").trim() || "PrepAI",
    price_kobo: Math.round(price * 100),
    weakness_threshold: Math.min(90, Math.max(20, threshold || 50)),
    paywall_enabled: formData.get("paywall_enabled") !== null,
    free_questions_per_day: Number(formData.get("free_questions_per_day")) || 0,
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: "Settings saved." };
}
