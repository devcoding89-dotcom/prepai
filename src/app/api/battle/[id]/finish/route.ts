import { NextResponse } from "next/server";
import { repo } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { participant_id } = (await req.json()) as { participant_id: string };

    if (!participant_id) {
      return NextResponse.json({ error: "participant_id required" }, { status: 400 });
    }

    const room = await repo.getBattleRoom(id);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const participant = await repo.getBattleParticipant(participant_id);
    if (!participant || participant.room_id !== id) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    await repo.updateBattleParticipant(participant_id, {
      finished: true,
      finished_at: new Date().toISOString(),
    });

    // Check if all participants are done — if so, end the room
    const allParticipants = await repo.listBattleParticipants(id);
    const allDone = allParticipants.every((p) => p.id === participant_id ? true : p.finished);

    if (allDone) {
      await repo.updateBattleRoom(id, {
        status: "finished",
        finished_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      finished: true,
      room_finished: allDone,
    });
  } catch (e) {
    console.error("Battle finish error:", e);
    return NextResponse.json({ error: "Failed to finish" }, { status: 500 });
  }
}
