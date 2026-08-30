import { redirect } from "next/navigation";
import { canAccessPaidFeatures, getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { PracticeSetup } from "@/components/app/practice-setup";
import { ExamTabs } from "@/components/app/exam-tabs";
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

  const [counts, facets] = await Promise.all([
    repo.questionCountsBySubject(exam),
    repo.questionFacets(exam),
  ]);
  const countBySubject = new Map(counts.map((item) => [item.subject, item.count]));
  const configuredSubjects = SUBJECTS_BY_EXAM[exam] ?? [];
  const subjects = [...new Set([...configuredSubjects, ...counts.map((item) => item.subject)])];
  const subjectCounts = subjects.map((subject) => ({ subject, count: countBySubject.get(subject) ?? 0 }));
  const topicsBySubject: Record<string, string[]> = facets.topicsBySubject ?? {};

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">Start a practice session</h1>
        <p className="mt-1 text-sm text-ink-500">
          Choose your subjects and length. Everything is timed exactly like the real CBT.
        </p>
        <ExamTabs currentExam={exam} />
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

