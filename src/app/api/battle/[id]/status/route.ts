import { NextResponse } from "next/server";
import { repo } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const room = await repo.getBattleRoom(id);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const participants = await repo.listBattleParticipants(room.id);

    return NextResponse.json({
      room: {
        id: room.id,
        code: room.code,
        exam: room.exam,
        subjects: room.subjects,
        mode: room.mode,
        duration_seconds: room.duration_seconds,
        status: room.status,
        host_name: room.host_name,
        question_ids: room.status === "active" ? room.question_ids : [],
        started_at: room.started_at,
        finished_at: room.finished_at,
        max_participants: room.max_participants,
      },
      participants: participants.map((p) => ({
        id: p.id,
        display_name: p.display_name,
        is_host: p.is_host,
        finished: p.finished,
        total_answered: p.total_answered,
      })),
    });
  } catch (e) {
    console.error("Battle status error:", e);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
