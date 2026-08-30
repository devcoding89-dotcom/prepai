import { BattlePlay } from "@/components/app/battle-play";

export const metadata = { title: "Battle Arena — In Progress" };
export const dynamic = "force-dynamic";

export default async function BattlePlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BattlePlay roomId={id} />;
}
