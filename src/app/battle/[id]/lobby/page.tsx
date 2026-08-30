import { notFound } from "next/navigation";
import { repo } from "@/lib/db";
import { BattleLobby } from "@/components/app/battle-lobby";

export const metadata = { title: "Battle Room Lobby" };
export const dynamic = "force-dynamic";

export default async function BattleLobbyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await repo.getBattleRoom(id);
  if (!room) notFound();

  const participants = await repo.listBattleParticipants(id);

  return (
    <BattleLobby
      roomId={id}
      initialRoom={{
        id: room.id,
        code: room.code,
        exam: room.exam,
        subjects: room.subjects,
        mode: room.mode,
        duration_seconds: room.duration_seconds,
        status: room.status,
        host_name: room.host_name,
        max_participants: room.max_participants,
      }}
      initialParticipants={participants.map((p) => ({
        id: p.id,
        display_name: p.display_name,
        is_host: p.is_host,
        finished: p.finished,
        total_answered: p.total_answered,
      }))}
    />
  );
}
