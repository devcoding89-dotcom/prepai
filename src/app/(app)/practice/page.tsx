import { redirect } from "next/navigation";
import { canAccessPaidFeatures, getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { PracticeSetup } from "@/components/app/practice-setup";
import { EXAMS, SUBJECTS_BY_EXAM, type Exam } from "@/lib/types";

export const metadata = { title: "Practice" };
export const dynamic = "force-dynamic";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; topic?: string; exam?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const { subject, topic, exam: examParam } = await searchParams;
  // ?exam=AI%20GENERATED lets students practise imported AI questions.
  const exam = EXAMS.includes(examParam as Exam) ? (examParam as Exam) : "JAMB";

  const [counts, questions] = await Promise.all([
    repo.questionCountsBySubject(exam),
    repo.listQuestions({ exam, onlyActive: true, limit: 10000 }),
  ]);
  const countBySubject = new Map(counts.map((item) => [item.subject, item.count]));
  const configuredSubjects = SUBJECTS_BY_EXAM[exam] ?? [];
  const subjects = [...new Set([...configuredSubjects, ...counts.map((item) => item.subject)])];
  const subjectCounts = subjects.map((subject) => ({ subject, count: countBySubject.get(subject) ?? 0 }));
  const topicsBySubject: Record<string, string[]> = {};
  for (const question of questions.rows) {
    const topics = topicsBySubject[question.subject] ?? [];
    if (!topics.includes(question.topic)) topics.push(question.topic);
    topicsBySubject[question.subject] = topics;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">Start a practice session</h1>
        <p className="mt-1 text-sm text-ink-500">
          Choose your subjects and length. Everything is timed exactly like the real CBT.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMS.map((option) => (
            <a key={option} href={`/practice?exam=${option}`} className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${exam === option ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-500"}`}>
              {option} questions
            </a>
          ))}
        </div>
      </div>
      <PracticeSetup
        exam={exam}
        subjectCounts={subjectCounts}
        presetSubject={subject}
        presetTopic={topic}
        topicsBySubject={topicsBySubject}
        subscribed={await canAccessPaidFeatures(user)}
      />
    </div>
  );
}
