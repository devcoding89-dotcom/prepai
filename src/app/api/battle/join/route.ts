import { NextResponse } from "next/server";
import { getCurrentUser, signBattleToken } from "@/lib/auth";
import { repo } from "@/lib/db";
import { getClientIp, hit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const clientIp = await getClientIp();
    const rl = hit(`battle-join:${clientIp}`, 25, 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many room join attempts. Please slow down and try again shortly." },
        { status: 429 },
      );
    }

    const { code, display_name } = (await req.json()) as {
      code: string;
      display_name: string;
    };

    if (!code || !display_name?.trim()) {
      return NextResponse.json({ error: "Room code and display name are required" }, { status: 400 });
    }

    const user = await getCurrentUser();
    const room = await repo.getBattleRoomByCode(code.toUpperCase());
    if (!room) {
      return NextResponse.json({ error: "Room not found. Check the code and try again." }, { status: 404 });
    }
    if (room.status === "finished") {
      return NextResponse.json({ error: "This battle has already ended." }, { status: 400 });
    }

    // Check participant limit
    const participants = await repo.listBattleParticipants(room.id);
    if (participants.length >= room.max_participants) {
      return NextResponse.json({ error: "Room is full." }, { status: 400 });
    }

    // Check if name already taken in this room
    const nameTaken = participants.some(
      (p) => p.display_name.toLowerCase() === display_name.trim().toLowerCase(),
    );
    if (nameTaken) {
      return NextResponse.json({ error: "That name is already taken in this room. Try another." }, { status: 400 });
    }

    const participant = await repo.addBattleParticipant({
      room_id: room.id,
      user_id: user?.id || null,
      display_name: display_name.trim(),
      is_host: false,
      answers: {},
      score_percent: 0,
      correct_count: 0,
      total_answered: 0,
      finished: false,
      finished_at: null,
    });

    const token = signBattleToken(room.id, participant.id);
    const res = NextResponse.json({
      roomId: room.id,
      participantId: participant.id,
      exam: room.exam,
      subjects: room.subjects,
      status: room.status,
    });
    res.cookies.set(`battle_token_${room.id}`, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 6,
    });
    return res;
  } catch (e) {
    console.error("Battle join error:", e);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}

