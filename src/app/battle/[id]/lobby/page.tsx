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
  let room = null;
  let participants: Awaited<ReturnType<typeof repo.listBattleParticipants>> = [];

  try {
    room = await repo.getBattleRoom(id);
    if (room) {
      participants = await repo.listBattleParticipants(id);
    }
  } catch (err) {
    console.error("Error loading battle room lobby server-side:", err);
  }

  return (
    <BattleLobby
      roomId={id}
      initialRoom={
        room
          ? {
              id: room.id,
              code: room.code,
              exam: room.exam,
              subjects: room.subjects,
              mode: room.mode,
              duration_seconds: room.duration_seconds,
              status: room.status,
              host_name: room.host_name,
              max_participants: room.max_participants,
            }
          : null
      }
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
