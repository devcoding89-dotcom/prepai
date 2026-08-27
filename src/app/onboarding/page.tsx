import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Choose your exam" };
export const dynamic = "force-dynamic";

async function continueToApp() {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  redirect("/dashboard");
}

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-dvh bg-ink-50/60">
      <div className="border-b border-ink-200 bg-white">
        <div className="container-x flex h-16 items-center">
          <Logo />
        </div>
      </div>

      <div className="container-x max-w-4xl py-12">
        <div className="text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-brand-600">You are ready to begin</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
            Welcome{user.full_name ? `, ${user.full_name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-ink-500">
            Access JAMB, WAEC and NECO questions, textbooks and practice sessions from one account. Choose
            an exam whenever you start practising.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-ink-200 bg-white p-7 text-center card-shadow">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <BookOpen className="size-7" />
          </span>
          <p className="mt-4 text-lg font-bold text-ink-950">One account, every exam</p>
          <ul className="mt-4 space-y-2 text-left text-sm text-ink-600">
            {["Browse all published textbooks", "Practise JAMB, WAEC or NECO questions", "Switch exam whenever you want"].map((item) => (
              <li key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" />{item}</li>
            ))}
          </ul>
          <form action={continueToApp} className="mt-6">
            <Button type="submit" size="lg" className="w-full">Continue to PrepAI <ArrowRight className="size-4" /></Button>
          </form>
        </div>
      </div>
    </div>
  );
}
