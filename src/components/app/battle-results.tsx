"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Swords,
  Users,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LeaderboardItem {
  id: string;
  display_name: string;
  is_host: boolean;
  score_percent: number;
  correct_count: number;
  total_answered: number;
  total_questions: number;
  finished: boolean;
  finished_at: string | null;
}

interface RoomInfo {
  id: string;
  code: string;
  exam: string;
  subjects: string[];
  mode: string;
  host_name: string;
  started_at: string | null;
  finished_at: string | null;
}

interface Props {
  roomId: string;
}

export function BattleResults({ roomId }: Props) {
  const router = useRouter();
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);

  const participantId =
    typeof window !== "undefined"
      ? localStorage.getItem(`battle_${roomId}_pid`)
      : null;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`/api/battle/${roomId}/leaderboard`);
        if (!res.ok) return;
        const data = await res.json();
        setRoom(data.room);
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      }
    };

    fetchLeaderboard();
    // Poll for any late finishers
    const timer = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(timer);
  }, [roomId]);

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  const myRank = leaderboard.findIndex((p) => p.id === participantId) + 1;
  const myData = leaderboard.find((p) => p.id === participantId);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-brand-800 to-indigo-950 p-8 text-center text-white shadow-2xl sm:p-10">
        <div className="relative z-10 space-y-3">
          <Badge tone="brand" className="bg-white/20 text-white ring-white/30 backdrop-blur-md">
            <Trophy className="size-3.5 text-amber-300" />
            Battle Complete
          </Badge>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Tournament Final Standings
          </h1>
          <p className="text-sm text-brand-100">
            {room?.exam} Battle · Code: {room?.code} · {room?.subjects.join(", ")}
          </p>

          {myRank > 0 && (
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-2.5 backdrop-blur-md">
              <Sparkles className="size-4 text-amber-300" />
              <span className="text-sm font-bold">
                You finished Rank #{myRank} with {myData?.correct_count} correct ({myData?.score_percent}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top 3 Podium Display */}
      {leaderboard.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
          {/* 2nd Place */}
          {top2 ? (
            <div className="order-2 flex flex-col items-center rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm sm:order-1 sm:h-64 sm:justify-end">
              <div className="mb-2 grid size-12 place-items-center rounded-2xl bg-slate-200 text-slate-700 shadow-inner">
                <Medal className="size-6" />
              </div>
              <Badge tone="neutral" className="text-[10px]">2nd Place</Badge>
              <h3 className="mt-2 text-base font-bold text-ink-950 truncate max-w-[160px]">
                {top2.display_name} {top2.id === participantId && "(You)"}
              </h3>
              <p className="text-xl font-black text-slate-700">{top2.score_percent}%</p>
              <p className="text-xs text-ink-400">{top2.correct_count}/{top2.total_questions} correct</p>
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}

          {/* 1st Place - Winner */}
          {top1 && (
            <div className="order-1 flex flex-col items-center rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/80 via-white to-white p-8 shadow-xl sm:order-2 sm:h-76 sm:justify-end ring-4 ring-amber-400/20">
              <div className="mb-2 grid size-16 place-items-center rounded-2xl bg-amber-400 text-amber-950 shadow-md">
                <Crown className="size-8" />
              </div>
              <Badge tone="warning" className="bg-amber-100 text-amber-900 font-bold text-xs">
                🏆 Champion
              </Badge>
              <h2 className="mt-2 text-lg font-black text-ink-950 truncate max-w-[180px]">
                {top1.display_name} {top1.id === participantId && "(You)"}
              </h2>
              <p className="text-3xl font-black text-amber-600">{top1.score_percent}%</p>
              <p className="text-xs font-bold text-ink-500">{top1.correct_count}/{top1.total_questions} correct</p>
            </div>
          )}

          {/* 3rd Place */}
          {top3 ? (
            <div className="order-3 flex flex-col items-center rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white p-6 shadow-sm sm:order-3 sm:h-56 sm:justify-end">
              <div className="mb-2 grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-800 shadow-inner">
                <Award className="size-6" />
              </div>
              <Badge tone="warning" className="text-[10px]">3rd Place</Badge>
              <h3 className="mt-2 text-base font-bold text-ink-950 truncate max-w-[160px]">
                {top3.display_name} {top3.id === participantId && "(You)"}
              </h3>
              <p className="text-xl font-black text-amber-800">{top3.score_percent}%</p>
              <p className="text-xs text-ink-400">{top3.correct_count}/{top3.total_questions} correct</p>
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader className="flex items-center justify-between border-b border-ink-100">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-brand-600" />
            <CardTitle>All Participants &amp; Scores ({leaderboard.length})</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-ink-100">
            {leaderboard.map((p, idx) => {
              const isMe = p.id === participantId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-4 sm:px-6 transition-all ${
                    isMe ? "bg-brand-50/60 font-bold" : "hover:bg-ink-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-8 place-items-center rounded-xl text-xs font-black ${
                        idx === 0
                          ? "bg-amber-400 text-amber-950"
                          : idx === 1
                          ? "bg-slate-300 text-slate-900"
                          : idx === 2
                          ? "bg-amber-600 text-white"
                          : "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink-950">
                        {p.display_name} {isMe && <span className="text-brand-600 font-normal">(You)</span>}
                      </p>
                      <p className="text-[11px] text-ink-400">
                        {p.correct_count} of {p.total_questions} questions correct
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-base font-black text-ink-900">{p.score_percent}%</span>
                    </div>
                    {p.finished ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <Clock className="size-4 text-amber-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Action Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          size="lg"
          onClick={() => router.push("/battle")}
          className="gap-2 font-bold shadow-lg shadow-brand-600/20"
        >
          <Swords className="size-4" />
          Host or Join Another Battle
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => router.push("/practice")}
          className="gap-2"
        >
          <RotateCcw className="size-4" />
          Solo Practice Mode
        </Button>
      </div>
    </div>
  );
}
