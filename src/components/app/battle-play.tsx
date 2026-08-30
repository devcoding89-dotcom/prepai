"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Send,
  Flag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LETTERS } from "@/lib/types";
import { formatClock } from "@/lib/utils";

interface QuestionItem {
  id: string;
  subject: string;
  topic: string;
  question_text: string;
  options: string[];
  difficulty: string;
  year: number | null;
}

interface LeaderboardItem {
  id: string;
  display_name: string;
  is_host: boolean;
  score_percent: number;
  correct_count: number;
  total_answered: number;
  total_questions: number;
  finished: boolean;
}

interface RoomPlayInfo {
  id: string;
  code: string;
  exam: string;
  subjects: string[];
  duration_seconds: number;
  status: string;
  started_at: string | null;
}

interface Props {
  roomId: string;
}

export function BattlePlay({ roomId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [room, setRoom] = useState<RoomPlayInfo | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const participantId =
    typeof window !== "undefined"
      ? localStorage.getItem(`battle_${roomId}_pid`)
      : null;

  const handleSubmit = useCallback(async () => {
    if (!participantId || submitting) return;
    setSubmitting(true);

    try {
      await fetch(`/api/battle/${roomId}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participant_id: participantId }),
      });
      router.push(`/battle/${roomId}/results`);
    } catch {
      router.push(`/battle/${roomId}/results`);
    }
  }, [participantId, roomId, router, submitting]);

  // 1. Initial Load of Questions and Room Details
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/battle/${roomId}/questions`);
        if (!res.ok) {
          const d = await res.json();
          setError(d.error || "Failed to load battle questions");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setRoom(data.room);
        setQuestions(data.questions);

        // Compute time remaining based on started_at
        if (data.room?.started_at && data.room?.duration_seconds) {
          const started = new Date(data.room.started_at).getTime();
          const expires = started + data.room.duration_seconds * 1000;
          const remaining = Math.max(0, Math.round((expires - Date.now()) / 1000));
          setTimeLeft(remaining);
        } else {
          setTimeLeft(15 * 60);
        }
        setLoading(false);
      } catch {
        setError("Network error loading questions.");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [roomId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, timeLeft, handleSubmit]);

  // 3. Poll Leaderboard every 3 seconds
  useEffect(() => {
    const pollLeaderboard = async () => {
      try {
        const res = await fetch(`/api/battle/${roomId}/leaderboard`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
        // If room marked finished and all finished, redirect to results
        if (data.room?.status === "finished") {
          router.push(`/battle/${roomId}/results`);
        }
      } catch (err) {
        console.error("Leaderboard poll error:", err);
      }
    };

    pollLeaderboard();
    const timer = setInterval(pollLeaderboard, 3000);
    return () => clearInterval(timer);
  }, [roomId, router]);

  // Handle selecting an option
  const handleSelectOption = async (optionLetter: string) => {
    const q = questions[currentIndex];
    if (!q || !participantId) return;

    // Optimistically update local answer
    setAnswers((prev) => ({ ...prev, [q.id]: optionLetter }));

    // Send answer to server
    try {
      await fetch(`/api/battle/${roomId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: participantId,
          question_id: q.id,
          selected: optionLetter,
        }),
      });
    } catch (e) {
      console.error("Answer sync error:", e);
    }
  };

  const toggleFlag = () => {
    const q = questions[currentIndex];
    if (!q) return;
    setFlagged((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="size-10 animate-spin text-brand-600" />
        <p className="text-sm font-bold text-ink-700">Loading Battle Questions &amp; Arena...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
        <AlertCircle className="mx-auto size-8 text-rose-600" />
        <p className="mt-2 font-bold">{error || "No questions found for this battle."}</p>
        <Button className="mt-4" onClick={() => router.push("/battle")}>
          Return to Battle Hub
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedOption = answers[currentQ.id];
  const isFlagged = flagged[currentQ.id];
  const totalCount = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Top Floating Battle Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Badge tone="brand" className="text-xs">
            {room?.exam} Battle
          </Badge>
          <span className="text-sm font-bold text-ink-900">
            Question {currentIndex + 1} of {totalCount}
          </span>
          <span className="hidden text-xs font-semibold text-ink-400 sm:inline">
            ({answeredCount}/{totalCount} answered)
          </span>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
            timeLeft < 180
              ? "animate-pulse bg-rose-100 text-rose-700"
              : "bg-ink-100 text-ink-800"
          }`}
        >
          <Clock className="size-4" />
          <span>{formatClock(timeLeft)}</span>
        </div>

        <Button
          size="sm"
          onClick={() => setShowConfirm(true)}
          disabled={submitting}
          className="bg-emerald-600 font-bold hover:bg-emerald-700"
        >
          <Send className="size-3.5" />
          Submit Battle
        </Button>
      </div>

      {/* Main Grid: Question Runner + Live Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Question Card */}
        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            {/* Meta: Subject & Topic */}
            <div className="flex items-center justify-between border-b border-ink-100 pb-3 text-xs text-ink-500">
              <span className="font-bold text-brand-700 uppercase tracking-wide">
                {currentQ.subject} · {currentQ.topic}
              </span>
              <button
                type="button"
                onClick={toggleFlag}
                className={`flex items-center gap-1 font-semibold transition-colors ${
                  isFlagged ? "text-amber-600" : "text-ink-400 hover:text-ink-600"
                }`}
              >
                <Flag className="size-3.5 fill-current" />
                {isFlagged ? "Flagged for Review" : "Flag"}
              </button>
            </div>

            {/* Question Text */}
            <div className="mt-6 text-lg font-bold leading-relaxed text-ink-950 sm:text-xl">
              {currentQ.question_text}
            </div>

            {/* Options A - D */}
            <div className="mt-8 space-y-3">
              {currentQ.options.map((opt, i) => {
                const letter = LETTERS[i] || String.fromCharCode(65 + i);
                const isSelected = selectedOption === letter;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectOption(letter)}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/80 font-bold text-brand-900 shadow-sm ring-2 ring-brand-500/20"
                        : "border-ink-200 bg-white font-medium text-ink-800 hover:border-ink-300 hover:bg-ink-50/50"
                    }`}
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-xl text-xs font-black transition-all ${
                        isSelected
                          ? "bg-brand-600 text-white"
                          : "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm sm:text-base">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-6">
              <Button
                type="button"
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <Button
                type="button"
                disabled={currentIndex === totalCount - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </Card>

          {/* Question Jump Grid */}
          <Card className="p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-400">
              Question Navigator
            </p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const isAns = !!answers[q.id];
                const isFlg = !!flagged[q.id];
                const isCur = idx === currentIndex;

                let cls = "border-ink-200 bg-white text-ink-700";
                if (isAns) cls = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                if (isFlg) cls = "border-amber-500 bg-amber-50 text-amber-800 font-bold";
                if (isCur) cls += " ring-2 ring-brand-500";

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`grid size-9 place-items-center rounded-xl border text-xs transition-all ${cls}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Live Leaderboard Sidebar */}
        <div className="space-y-4">
          <Card className="lg:sticky lg:top-24">
            <CardHeader className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-amber-500" />
                <CardTitle className="text-sm">Live Leaderboard</CardTitle>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="size-2 animate-ping rounded-full bg-emerald-500" />
                Updating
              </span>
            </CardHeader>
            <CardBody className="pt-3">
              <div className="space-y-2">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-xs text-ink-400 py-4">Waiting for scores...</p>
                ) : (
                  leaderboard.map((player, rank) => {
                    const isMe = player.id === participantId;
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between rounded-xl p-2.5 text-xs transition-all ${
                          isMe
                            ? "border border-brand-500 bg-brand-50/70 font-bold"
                            : "border border-ink-100 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`grid size-6 place-items-center rounded-lg text-[10px] font-black ${
                              rank === 0
                                ? "bg-amber-400 text-amber-950"
                                : rank === 1
                                ? "bg-slate-300 text-slate-900"
                                : rank === 2
                                ? "bg-amber-600 text-white"
                                : "bg-ink-100 text-ink-600"
                            }`}
                          >
                            {rank + 1}
                          </span>
                          <div>
                            <p className="truncate max-w-[120px] font-bold text-ink-900">
                              {player.display_name} {isMe && "(You)"}
                            </p>
                            <p className="text-[10px] text-ink-400">
                              {player.total_answered}/{totalCount} answered
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-brand-700">
                            {player.correct_count} pts
                          </span>
                          {player.finished && (
                            <span className="block text-[9px] font-semibold text-emerald-600">
                              Done
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm p-6 text-center">
            <Trophy className="mx-auto size-10 text-amber-500" />
            <h3 className="mt-3 text-lg font-bold text-ink-950">Finish Battle?</h3>
            <p className="mt-1 text-xs text-ink-500">
              You answered {answeredCount} of {totalCount} questions. Ready to submit and see final rankings?
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
              >
                Continue Playing
              </Button>
              <Button
                className="flex-1 bg-emerald-600 font-bold hover:bg-emerald-700"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Yes, Submit"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
