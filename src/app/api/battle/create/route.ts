import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import type { Exam } from "@/lib/types";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const body = await req.json();
    const { exam, subjects, mode, duration_minutes } = body as {
      exam: Exam;
      subjects: string[];
      mode: "quick" | "standard";
      duration_minutes: number;
    };

    if (!exam || !subjects?.length || !mode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate unique code (retry if collision)
    let code = generateCode();
    let existing = await repo.getBattleRoomByCode(code);
    let tries = 0;
    while (existing && tries < 10) {
      code = generateCode();
      existing = await repo.getBattleRoomByCode(code);
      tries++;
    }

    const durationSec = Math.max(5, Math.min(120, duration_minutes || 15)) * 60;

    const room = await repo.createBattleRoom({
      code,
      host_user_id: user.id,
      host_name: user.full_name || user.email.split("@")[0],
      exam,
      subjects,
      question_ids: [], // filled when host starts
      mode,
      duration_seconds: durationSec,
      status: "waiting",
      max_participants: 30,
      started_at: null,
      finished_at: null,
    });

    // Host auto-joins as first participant
    const participant = await repo.addBattleParticipant({
      room_id: room.id,
      user_id: user.id,
      display_name: user.full_name || user.email.split("@")[0],
      is_host: true,
      answers: {},
      score_percent: 0,
      correct_count: 0,
      total_answered: 0,
      finished: false,
      finished_at: null,
    });

    return NextResponse.json({ roomId: room.id, code: room.code, participantId: participant.id });
  } catch (e) {
    console.error("Battle create error:", e);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
