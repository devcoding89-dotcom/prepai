import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AiTutor } from "@/components/app/ai-tutor";

export const metadata = { title: "AI Tutor" };
export const dynamic = "force-dynamic";

export default async function AiTutorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Personal study help</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">AI Tutor</h1>
        <p className="mt-1 text-sm text-ink-500">Get clear explanations and practice guidance for your exam.</p>
      </div>
      <AiTutor exam={user.target_exam} />
    </div>
  );
}
