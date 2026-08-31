"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  Share2,
  Users,
  Play,
  Swords,
  Crown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoomData {
  id: string;
  code: string;
  exam: string;
  subjects: string[];
  mode: string;
  duration_seconds: number;
  status: "waiting" | "active" | "finished";
  host_name: string;
  max_participants: number;
}

interface Participant {
  id: string;
  display_name: string;
  is_host: boolean;
  finished: boolean;
  total_answered: number;
}

interface Props {
  roomId: string;
  initialRoom?: RoomData | null;
  initialParticipants?: Participant[];
}

export function BattleLobby({
  roomId,
  initialRoom = null,
  initialParticipants = [],
}: Props) {
  const router = useRouter();
  const [room, setRoom] = useState<RoomData | null>(initialRoom);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(!initialRoom);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [error, setError] = useState("");

  const participantId =
    typeof window !== "undefined"
      ? localStorage.getItem(`battle_${roomId}_pid`)
      : null;

  const isHost =
    typeof window !== "undefined"
      ? localStorage.getItem(`battle_${roomId}_is_host`) === "true" ||
        participants.some((p) => p.id === participantId && p.is_host)
      : false;

  // Poll status every 2 seconds
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/battle/${roomId}/status`);
        if (!res.ok) {
          if (res.status === 404 && mounted) {
            setRoomNotFound(true);
          }
          return;
        }
        const data = await res.json();
        if (mounted && data.room) {
          setRoomNotFound(false);
          setRoom(data.room);
          setParticipants(data.participants || []);

          if (data.room.status === "active") {
            router.push(`/battle/${roomId}/play`);
          } else if (data.room.status === "finished") {
            router.push(`/battle/${roomId}/results`);
          }
        }
      } catch (err) {
        console.error("Poll error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    poll();
    const timer = setInterval(poll, 2000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [roomId, router]);

  const copyCode = () => {
    if (typeof navigator !== "undefined" && room) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareRoom = () => {
    if (!room) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: `Join my PrepClass CBT Battle: ${room.code}`,
        text: `Join my live ${room.exam} CBT challenge on PrepClass! Code: ${room.code}`,
        url: window.location.origin + `/battle?code=${room.code}`,
      });
    } else {
      copyCode();
    }
  };

  const handleStartBattle = async () => {
    setStarting(true);
    setError("");

    try {
      const res = await fetch(`/api/battle/${roomId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participant_id: participantId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start battle");
        setStarting(false);
        return;
      }

      router.push(`/battle/${roomId}/play`);
    } catch {
      setError("Network error starting battle.");
      setStarting(false);
    }
  };

  if (loading && !room) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="size-10 animate-spin text-brand-600" />
        <p className="text-sm font-bold text-ink-700">Connecting to Battle Room Lobby...</p>
      </div>
    );
  }

  if (roomNotFound || !room) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">
        <AlertCircle className="mx-auto size-10 text-rose-600" />
        <h2 className="mt-3 text-lg font-bold">Battle Room Not Found</h2>
        <p className="mt-1.5 text-xs text-rose-700">
          This battle room may have expired, already finished, or was created before the database was migrated.
        </p>
        <Button className="mt-5 w-full font-bold" onClick={() => router.push("/battle")}>
          Return to Battle Arena Hub
        </Button>
      </div>
    );
  }

  const durationMin = Math.round(room.duration_seconds / 60);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header Banner with Room Code */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="space-y-2 text-center md:text-left">
            <Badge tone="brand" className="bg-white/20 text-white ring-white/30 backdrop-blur-md">
              <Swords className="size-3.5" />
              Battle Lobby
            </Badge>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {room.exam} Battle Room
            </h1>
            <p className="text-sm text-brand-200">
              Host: <span className="font-bold text-white">{room.host_name}</span> ·{" "}
              {durationMin} mins · {room.mode === "quick" ? "10 Questions" : "50 Questions"}
            </p>
          </div>

          {/* Join Code Box */}
          <div className="flex flex-col items-center rounded-2xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/20">
            <span className="text-[11px] font-bold tracking-wider text-brand-200 uppercase">
              Room Code
            </span>
            <span className="mt-0.5 text-3xl font-black tracking-widest text-white sm:text-4xl">
              {room.code}
            </span>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={copyCode}
                className="border-white/30 bg-white/10 text-xs text-white hover:bg-white/20"
              >
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                {copied ? "Copied!" : "Copy Code"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={shareRoom}
                className="border-white/30 bg-white/10 text-xs text-white hover:bg-white/20"
              >
                <Share2 className="size-3.5" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
          <AlertCircle className="size-5 shrink-0 text-rose-600" />
          {error}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        {/* Participants list */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-brand-600" />
              <CardTitle>Participants Joined ({participants.length})</CardTitle>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="size-2 animate-ping rounded-full bg-emerald-500" />
              Live Waiting
            </span>
          </CardHeader>
          <CardBody>
            <div className="space-y-2.5">
              {participants.map((p, idx) => {
                const isMe = p.id === participantId;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                      isMe
                        ? "border-brand-500 bg-brand-50/70 font-bold"
                        : "border-ink-200 bg-white font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-xl bg-ink-100 text-xs font-bold text-ink-700">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-ink-900">
                          <span>{p.display_name}</span>
                          {p.is_host && (
                            <Badge tone="brand" className="text-[9px]">
                              <Crown className="size-2.5" /> Host
                            </Badge>
                          )}
                          {isMe && (
                            <Badge tone="success" className="text-[9px]">
                              You
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-ink-400">Ready</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Room Info & Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Battle Config</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4 text-xs font-medium text-ink-700">
              <div className="flex items-center justify-between border-b border-ink-100 pb-2.5">
                <span className="text-ink-500">Exam</span>
                <Badge tone="brand">{room.exam}</Badge>
              </div>
              <div className="flex items-center justify-between border-b border-ink-100 pb-2.5">
                <span className="text-ink-500">Subjects</span>
                <span className="text-right font-bold text-ink-900">
                  {room.subjects.join(", ")}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-ink-100 pb-2.5">
                <span className="text-ink-500">Questions</span>
                <span className="font-bold text-ink-900">
                  {room.mode === "quick" ? "10 Questions" : "50 Questions"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-ink-100 pb-2.5">
                <span className="text-ink-500">Duration</span>
                <span className="font-bold text-ink-900">{durationMin} Minutes</span>
              </div>

              {/* Host Start Button or Guest Waiting indicator */}
              <div className="pt-3">
                {isHost ? (
                  <Button
                    type="button"
                    size="lg"
                    disabled={starting}
                    onClick={handleStartBattle}
                    className="w-full text-base font-bold shadow-lg shadow-brand-600/25"
                  >
                    {starting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Starting Battle...
                      </>
                    ) : (
                      <>
                        <Play className="size-5 fill-current" />
                        Start Battle for Everyone
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-brand-50 p-6 text-center">
                    <Loader2 className="size-7 animate-spin text-brand-600" />
                    <p className="mt-3 text-sm font-bold text-brand-900">
                      Waiting for host ({room.host_name}) to start...
                    </p>
                    <p className="mt-1 text-xs text-brand-700">
                      The battle will launch on your screen automatically!
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
