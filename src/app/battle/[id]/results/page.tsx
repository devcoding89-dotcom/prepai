import { BattleResults } from "@/components/app/battle-results";

export const metadata = { title: "Battle Room Standings & Scores" };
export const dynamic = "force-dynamic";

export default async function BattleResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BattleResults roomId={id} />;
}
