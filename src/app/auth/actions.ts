"use server";

import { redirect } from "next/navigation";
import { signIn, signOut, signUp } from "@/lib/auth";
import { repo } from "@/lib/db";
import type { Exam } from "@/lib/types";

export interface FormState {
  error?: string;
  ok?: boolean;
}

function safeRedirectPath(target: string | null | undefined, fallback: string): string {
  if (!target) return fallback;
  const trimmed = target.trim();
  // Prevent open redirect attacks: ensure it is a safe local path starting with /
  // and does not contain protocol specifiers, double slashes, or backslashes.
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("\\") &&
    !trimmed.includes(":") &&
    !trimmed.includes("\0")
  ) {
    return trimmed;
  }
  return fallback;
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const identifier = String(formData.get("email") ?? "");
  const email = formData.get("admin_login") === "1" && identifier.trim().toLowerCase() === (process.env.ADMIN_USERNAME ?? "khaleed").toLowerCase()
    ? (process.env.ADMIN_EMAIL ?? "khaleed@prepai.ng")
    : identifier;
  const password = String(formData.get("password") ?? "");
  const res = await signIn(email, password);
  if (!res.ok) return { error: res.error };
  const rawNext = String(formData.get("next") ?? "");
  if (res.user?.role === "admin") {
    redirect(safeRedirectPath(rawNext, "/admin"));
  }
  const defaultPath = res.user?.target_exam ? "/dashboard" : "/onboarding";
  redirect(safeRedirectPath(rawNext, defaultPath));
}

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const res = await signUp({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    full_name: String(formData.get("full_name") ?? ""),
  });
  if (!res.ok) return { error: res.error };
  const exam = String(formData.get("exam") ?? "") as Exam | "";
  if (exam && res.user) {
    await repo.updateProfile(res.user.id, { target_exam: exam });
    redirect("/dashboard");
  }
  redirect("/onboarding");
}

export async function logoutAction() {
  await signOut();
  redirect("/");
}
