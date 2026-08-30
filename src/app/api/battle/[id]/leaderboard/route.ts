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
    const totalQuestions = room.question_ids?.length || (room.mode === "quick" ? 10 : 50);

    const ranked = participants
      .map((p) => ({
        id: p.id,
        display_name: p.display_name,
        is_host: p.is_host,
        score_percent: p.score_percent,
        correct_count: p.correct_count,
        total_answered: p.total_answered,
        total_questions: totalQuestions,
        finished: p.finished,
        finished_at: p.finished_at,
        joined_at: p.joined_at,
      }))
      .sort((a, b) => {
        if (b.correct_count !== a.correct_count) {
          return b.correct_count - a.correct_count;
        }
        if (b.score_percent !== a.score_percent) {
          return b.score_percent - a.score_percent;
        }
        // If finished, who finished earlier ranks higher
        if (a.finished && b.finished && a.finished_at && b.finished_at) {
          return a.finished_at.localeCompare(b.finished_at);
        }
        return a.joined_at.localeCompare(b.joined_at);
      });

    return NextResponse.json({
      room: {
        id: room.id,
        code: room.code,
        status: room.status,
        exam: room.exam,
        subjects: room.subjects,
        mode: room.mode,
        duration_seconds: room.duration_seconds,
        host_name: room.host_name,
        started_at: room.started_at,
        finished_at: room.finished_at,
      },
      leaderboard: ranked,
    });
  } catch (e) {
    console.error("Battle leaderboard error:", e);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
