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
    const body = await req.json();
    const { exam, subjects, mode, duration_minutes, host_name } = body as {
      exam: Exam;
      subjects: string[];
      mode: "quick" | "standard";
      duration_minutes: number;
      host_name?: string;
    };

    if (!exam || !subjects?.length || !mode) {
      return NextResponse.json({ error: "Missing required fields (exam, subjects, mode)" }, { status: 400 });
    }

    const effectiveHostName = (
      user?.full_name ||
      host_name?.trim() ||
      user?.email?.split("@")[0] ||
      "Host"
    ).trim();
    const effectiveHostUserId = user?.id || `guest_host_${crypto.randomUUID()}`;

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
      host_user_id: effectiveHostUserId,
      host_name: effectiveHostName,
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
      user_id: user?.id || null,
      display_name: effectiveHostName,
      is_host: true,
      answers: {},
      score_percent: 0,
      correct_count: 0,
      total_answered: 0,
      finished: false,
      finished_at: null,
    });

    return NextResponse.json({
      roomId: room.id,
      code: room.code,
      participantId: participant.id,
      hostName: effectiveHostName,
    });
  } catch (e) {
    console.error("Battle create error:", e);
    return NextResponse.json({ error: "Failed to create battle room" }, { status: 500 });
  }
}
