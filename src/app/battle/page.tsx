import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { BattleSetup } from "@/components/app/battle-setup";
import { EXAMS, type Exam } from "@/lib/types";

export const metadata = { title: "Battle Room — Multiplayer CBT" };
export const dynamic = "force-dynamic";

export default async function BattlePage() {
  const user = await getCurrentUser();

  const countsByExam: Record<Exam, Record<string, number>> = {
    JAMB: {},
    WAEC: {},
    NECO: {},
    "AI GENERATED": {},
  };

  await Promise.all(
    EXAMS.map(async (e) => {
      const counts = await repo.questionCountsBySubject(e);
      const map: Record<string, number> = {};
      counts.forEach((c) => (map[c.subject] = c.count));
      countsByExam[e] = map;
    }),
  );

  return <BattleSetup user={user} subjectCountsByExam={countsByExam} />;
}
