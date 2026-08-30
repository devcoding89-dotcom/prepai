import { NextResponse } from "next/server";
import { repo } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { participant_id, question_id, selected } = (await req.json()) as {
      participant_id: string;
      question_id: string;
      selected: string; // "A", "B", "C", "D"
    };

    if (!participant_id || !question_id || !selected) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const room = await repo.getBattleRoom(id);
    if (!room || room.status !== "active") {
      return NextResponse.json({ error: "Battle not active" }, { status: 400 });
    }

    const participant = await repo.getBattleParticipant(participant_id);
    if (!participant || participant.room_id !== id) {
      return NextResponse.json({ error: "Participant not found in this room" }, { status: 404 });
    }
    if (participant.finished) {
      return NextResponse.json({ error: "You have already submitted" }, { status: 400 });
    }

    // Check the answer
    const question = await repo.getQuestion(question_id);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const isCorrect = selected.toUpperCase() === question.correct_answer.toUpperCase();
    const newAnswers = { ...participant.answers, [question_id]: selected.toUpperCase() };
    const totalAnswered = Object.keys(newAnswers).length;

    // Count correct by checking each answered question
    let correct = 0;
    for (const [qId, ans] of Object.entries(newAnswers)) {
      const q = await repo.getQuestion(qId);
      if (q && ans === q.correct_answer.toUpperCase()) correct++;
    }

    const scorePercent = room.question_ids.length > 0 ? Math.round((correct / room.question_ids.length) * 100) : 0;

    await repo.updateBattleParticipant(participant_id, {
      answers: newAnswers,
      total_answered: totalAnswered,
      correct_count: correct,
      score_percent: scorePercent,
    });

    return NextResponse.json({
      is_correct: isCorrect,
      correct_answer: question.correct_answer,
      explanation: question.explanation,
      total_answered: totalAnswered,
      correct_count: correct,
      score_percent: scorePercent,
    });
  } catch (e) {
    console.error("Battle answer error:", e);
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}
