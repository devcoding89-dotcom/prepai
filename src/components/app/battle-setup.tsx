"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Trophy,
  Swords,
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Checkbox } from "@/components/ui/input";
import { EXAMS, SUBJECTS_BY_EXAM, type Exam, type Profile } from "@/lib/types";

interface Props {
  user: Profile | null;
  subjectCountsByExam: Record<Exam, Record<string, number>>;
}

export function BattleSetup({ user, subjectCountsByExam }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"host" | "join">("host");

  // Host state
  const [exam, setExam] = useState<Exam>("JAMB");
  const [hostName, setHostName] = useState(user?.full_name || "");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["Mathematics", "Use of English"]);
  const [mode, setMode] = useState<"quick" | "standard">("quick");
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [hostLoading, setHostLoading] = useState(false);
  const [hostError, setHostError] = useState("");

  // Join state
  const [joinCode, setJoinCode] = useState("");
  const [displayName, setDisplayName] = useState(user?.full_name || "");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  const availableSubjects = SUBJECTS_BY_EXAM[exam] || [];
  const currentCounts = subjectCountsByExam[exam] || {};

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleExamChange = (newExam: Exam) => {
    setExam(newExam);
    const counts = subjectCountsByExam[newExam] || {};
    const valid = (SUBJECTS_BY_EXAM[newExam] || []).filter((s) => (counts[s] || 0) > 0);
    if (valid.length > 0) {
      setSelectedSubjects(valid.slice(0, 2));
    } else {
      setSelectedSubjects([SUBJECTS_BY_EXAM[newExam]?.[0] || "Mathematics"]);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveName = (hostName.trim() || user?.full_name || "Host").trim();

    if (selectedSubjects.length === 0) {
      setHostError("Please pick at least one subject for the battle.");
      return;
    }

    setHostLoading(true);
    setHostError("");

    try {
      const res = await fetch("/api/battle/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam,
          subjects: selectedSubjects,
          mode,
          duration_minutes: durationMinutes,
          host_name: effectiveName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHostError(data.error || "Failed to create battle room.");
        setHostLoading(false);
        return;
      }

      // Save participantId and host status in localStorage for session tracking
      localStorage.setItem(`battle_${data.roomId}_pid`, data.participantId);
      localStorage.setItem(`battle_${data.roomId}_is_host`, "true");
      localStorage.setItem(`battle_${data.roomId}_name`, effectiveName);

      router.push(`/battle/${data.roomId}/lobby`);
    } catch {
      setHostError("Network error. Please try again.");
      setHostLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    const cleanName = displayName.trim();

    if (!cleanCode || cleanCode.length < 4) {
      setJoinError("Please enter a valid 6-character room code.");
      return;
    }
    if (!cleanName) {
      setJoinError("Please enter your name.");
      return;
    }

    setJoinLoading(true);
    setJoinError("");

    try {
      const res = await fetch("/api/battle/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          display_name: cleanName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Failed to join battle room.");
        setJoinLoading(false);
        return;
      }

      localStorage.setItem(`battle_${data.roomId}_pid`, data.participantId);
      localStorage.setItem(`battle_${data.roomId}_name`, cleanName);

      if (data.status === "active") {
        router.push(`/battle/${data.roomId}/play`);
      } else if (data.status === "finished") {
        router.push(`/battle/${data.roomId}/results`);
      } else {
        router.push(`/battle/${data.roomId}/lobby`);
      }
    } catch {
      setJoinError("Network error. Please try again.");
      setJoinLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-950 p-8 text-white shadow-xl sm:p-10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge tone="brand" className="bg-white/20 text-white ring-white/30 backdrop-blur-md">
            <Swords className="size-3.5" />
            Live Multiplayer CBT
          </Badge>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Battle Room Challenge
          </h1>
          <p className="text-base text-brand-100 sm:text-lg">
            Host an exam room with custom time & subjects, share your 6-digit code, and battle your classmates in real time with a live leaderboard!
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-brand-200">
          <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
            <Users className="size-4 text-amber-300" />
            Up to 30 students per room
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
            <Clock className="size-4 text-emerald-300" />
            Host sets the exact time limit
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
            <Trophy className="size-4 text-yellow-300" />
            Live leaderboard &amp; rankings
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl border border-ink-200 bg-white p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setTab("host")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
            tab === "host"
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
              : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
          }`}
        >
          <Sparkles className="size-4" />
          Host a Battle Room
        </button>
        <button
          type="button"
          onClick={() => setTab("join")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
            tab === "join"
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
              : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
          }`}
        >
          <Users className="size-4" />
          Join with Room Code
        </button>
      </div>

      {tab === "host" ? (
        /* Host Form */
        <form onSubmit={handleCreateRoom} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            {hostError && (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
                <AlertCircle className="size-5 shrink-0 text-rose-600" />
                {hostError}
              </div>
            )}

            {/* 1. Exam selection */}
            <Card>
              <CardHeader>
                <CardTitle>1. Select Exam</CardTitle>
              </CardHeader>
              <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {EXAMS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => handleExamChange(e)}
                    className={`rounded-2xl border p-3.5 text-center text-sm font-bold transition-all ${
                      exam === e
                        ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20"
                        : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </CardBody>
            </Card>

            {/* Host Name input */}
            <Card>
              <CardHeader>
                <CardTitle>Your Host Name</CardTitle>
                <p className="mt-0.5 text-xs text-ink-500">
                  This will be shown as the room owner in the lobby and leaderboard.
                </p>
              </CardHeader>
              <CardBody>
                <Input
                  type="text"
                  placeholder="e.g. Adeola, Mr. John, Ibrahim"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="font-semibold text-ink-900"
                  required
                />
              </CardBody>
            </Card>

            {/* 2. Subject Picker */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>2. Pick Subjects</CardTitle>
                  <p className="mt-1 text-xs text-ink-500">
                    Questions will be sampled equally from selected subjects.
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSelectedSubjects(availableSubjects)}
                    className="text-brand-600 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-ink-300">·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSubjects([])}
                    className="text-ink-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid max-h-72 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                  {availableSubjects.map((subj) => {
                    const count = currentCounts[subj] || 0;
                    const isSelected = selectedSubjects.includes(subj);
                    return (
                      <label
                        key={subj}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                          isSelected
                            ? "border-brand-500 bg-brand-50/70"
                            : "border-ink-200 hover:border-ink-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleSubject(subj)}
                          />
                          <span className="text-sm font-semibold text-ink-900">{subj}</span>
                        </div>
                        <Badge tone={count > 0 ? "brand" : "neutral"} className="text-[10px]">
                          {count}q
                        </Badge>
                      </label>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            {/* 3. Length & Timer */}
            <Card>
              <CardHeader>
                <CardTitle>3. Battle Length &amp; Time Limit</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("quick");
                      if (durationMinutes > 30) setDurationMinutes(15);
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      mode === "quick"
                        ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                        : "border-ink-200 hover:border-ink-300"
                    }`}
                  >
                    <p className="text-sm font-bold text-ink-950">Quick Battle</p>
                    <p className="mt-0.5 text-xs text-ink-500">10 questions · fast showdown</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("standard");
                      if (durationMinutes < 30) setDurationMinutes(45);
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      mode === "standard"
                        ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                        : "border-ink-200 hover:border-ink-300"
                    }`}
                  >
                    <p className="text-sm font-bold text-ink-950">Standard Battle</p>
                    <p className="mt-0.5 text-xs text-ink-500">50 questions · deep tournament</p>
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-ink-800">
                      Host-Controlled Time Limit
                    </label>
                    <span className="text-sm font-bold text-brand-700">
                      {durationMinutes} Minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-ink-200 accent-brand-600"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-ink-400">
                    <span>5 mins (Blitz)</span>
                    <span>30 mins</span>
                    <span>90 mins (Full Length)</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Summary Panel */}
          <div className="space-y-6">
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Room Summary</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-3 rounded-2xl bg-ink-50/80 p-4 text-xs font-medium text-ink-700">
                  <div className="flex justify-between">
                    <span className="text-ink-500">Target Exam:</span>
                    <span className="font-bold text-ink-900">{exam}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Subjects Selected:</span>
                    <span className="font-bold text-ink-900">{selectedSubjects.length} subjects</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Question Count:</span>
                    <span className="font-bold text-ink-900">
                      {mode === "quick" ? "10 Questions" : "50 Questions"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Duration:</span>
                    <span className="font-bold text-ink-900">{durationMinutes} Minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Leaderboard:</span>
                    <span className="font-bold text-emerald-700">Live Real-Time</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={hostLoading || selectedSubjects.length === 0}
                  className="w-full text-base font-bold shadow-lg shadow-brand-600/20"
                >
                  {hostLoading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Creating Room...
                    </>
                  ) : (
                    <>
                      Create Battle Room
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-ink-400">
                  You will get a 6-digit room code to share with your friends.
                </p>
              </CardBody>
            </Card>
          </div>
        </form>
      ) : (
        /* Join Form */
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Users className="size-6" />
              </div>
              <CardTitle className="text-xl">Enter Battle Room Code</CardTitle>
              <p className="mt-1 text-sm text-ink-500">
                Got a 6-digit code from your host? Enter it below to join the showdown.
              </p>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                {joinError && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
                    <AlertCircle className="size-4 shrink-0 text-rose-600" />
                    {joinError}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">
                    6-Digit Room Code
                  </label>
                  <Input
                    type="text"
                    maxLength={8}
                    placeholder="e.g. PX7K2M"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="text-center text-2xl font-black tracking-widest uppercase text-brand-700"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">
                    Your Name / Nickname
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Ibrahim, Tobi, Ngozi"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="font-medium"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={joinLoading || !joinCode.trim() || !displayName.trim()}
                  className="w-full text-base font-bold shadow-lg shadow-brand-600/20"
                >
                  {joinLoading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Joining Room...
                    </>
                  ) : (
                    <>
                      Join Battle
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
