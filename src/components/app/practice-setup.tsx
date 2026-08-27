"use client";

import { useActionState, useMemo, useState } from "react";
import { Clock, GraduationCap, ListChecks, Loader2, Play, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Alert, Checkbox, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { startPracticeAction, type PracticeFormState } from "@/app/(app)/practice/actions";
import { cn, formatClock } from "@/lib/utils";
import type { Exam } from "@/lib/types";

const initial: PracticeFormState = {};

interface Props {
  exam: Exam;
  subjectCounts: { subject: string; count: number }[];
  presetSubject?: string;
  presetTopic?: string;
  topicsBySubject: Record<string, string[]>;
  subscribed: boolean;
}

const modes = [
  { id: "quick", label: "Quick drill", count: 10, desc: "10 questions · warm-up", icon: Sparkles },
  { id: "standard", label: "Standard set", count: 50, desc: "50 questions · exam pace", icon: ListChecks },
  { id: "mock", label: "Full mock", count: 0, desc: "Full length · real timing", icon: GraduationCap },
] as const;

export function PracticeSetup({ exam, subjectCounts, presetSubject, presetTopic, topicsBySubject, subscribed }: Props) {
  const [state, action, pending] = useActionState(startPracticeAction, initial);
  const [selected, setSelected] = useState<string[]>(
    presetSubject ? [presetSubject] : subjectCounts.find((s) => s.count > 0)?.subject ? [subjectCounts.find((s) => s.count > 0)!.subject] : [],
  );
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>(presetTopic ? "quick" : "quick");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState(presetTopic ?? "");
  const [shuffle, setShuffle] = useState<"yes" | "no">("yes");
  const topics = [...new Set(selected.flatMap((subject) => topicsBySubject[subject] ?? []))].sort();

  const mockCount = exam === "JAMB" ? 180 : 100;
  const available = useMemo(
    () => subjectCounts.filter((s) => selected.includes(s.subject)).reduce((a, b) => a + b.count, 0),
    [selected, subjectCounts],
  );
  const requested = mode === "quick" ? 10 : mode === "standard" ? 50 : mockCount;
  const actual = Math.min(requested, topic ? Math.min(available, 15) : available);
  const perQ = mode === "mock" ? (exam === "JAMB" ? 40 : 54) : mode === "standard" ? 55 : 60;
  const estimate = actual * perQ;

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <input type="hidden" name="exam" value={exam} />
      {topic && <input type="hidden" name="topics" value={topic} />}
      <input type="hidden" name="shuffle" value={shuffle} />

      <div className="space-y-6">
        {state.error && <Alert>{state.error}</Alert>}

        {/* subjects */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Select subject(s)</CardTitle>
              <p className="mt-1 text-sm text-ink-500">Questions are spread evenly across what you pick.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelected(subjectCounts.filter((s) => s.count > 0).map((s) => s.subject))}
                className="text-[12px] font-semibold text-brand-700 hover:underline"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="text-[12px] font-semibold text-ink-400 hover:underline"
              >
                Clear
              </button>
            </div>
          </CardHeader>
          <CardBody>
            {subjectCounts.length === 0 ? (
              <p className="rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
                There are no {exam} questions in the bank yet. An admin needs to import questions first.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {subjectCounts.map((s) => {
                  const on = selected.includes(s.subject);
                  return (
                    <label
                      key={s.subject}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors",
                        s.count === 0 ? "cursor-not-allowed border-ink-100 bg-ink-50/60 opacity-60" : on ? "cursor-pointer border-brand-500 bg-brand-50/60" : "cursor-pointer border-ink-200 hover:border-ink-300",
                      )}
                    >
                      <Checkbox checked={on} onChange={() => toggle(s.subject)} disabled={s.count === 0} readOnly />
                      {on && s.count > 0 && <input type="hidden" name="subjects" value={s.subject} />}
                      <span className="flex-1 text-sm font-medium text-ink-800">{s.subject}</span>
                      <span className="text-[11px] font-semibold text-ink-400">{s.count}q</span>
                    </label>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* mode */}
        <Card>
          <CardHeader>
            <CardTitle>Session length</CardTitle>
            <p className="mt-1 text-sm text-ink-500">Pick how much time you have right now.</p>
          </CardHeader>
          <CardBody className="grid gap-3 sm:grid-cols-3">
            {modes.map((m) => {
              const on = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    on ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/15" : "border-ink-200 hover:border-ink-300",
                  )}
                >
                  <m.icon className={cn("size-5", on ? "text-brand-600" : "text-ink-400")} />
                  <p className="mt-2.5 text-sm font-bold text-ink-950">{m.label}</p>
                  <p className="mt-0.5 text-[12px] text-ink-500">
                    {m.id === "mock" ? `${mockCount} questions · real timing` : m.desc}
                  </p>
                </button>
              );
            })}
            <input type="hidden" name="mode" value={mode} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shuffle questions?</CardTitle>
            <p className="mt-1 text-sm text-ink-500">Choose whether questions appear in a random order.</p>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-3">
            {(["yes", "no"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setShuffle(option)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm font-bold capitalize transition-colors",
                  shuffle === option ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600 hover:border-ink-300",
                )}
              >
                {option}
              </button>
            ))}
          </CardBody>
        </Card>

        {/* filters */}
        <Card>
          <CardHeader>
            <CardTitle>Fine-tune (optional)</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Difficulty</label>
              <Select name="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="">Mixed (recommended)</option>
                <option value="easy">Easy only</option>
                <option value="medium">Medium only</option>
                <option value="hard">Hard only</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Focus on one topic</label>
              <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="">All topics in selected subjects</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* summary */}
      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Session summary</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <dl className="space-y-2.5 text-sm">
            <Row label="Exam" value={<Badge tone="brand">{exam}</Badge>} />
            <Row label="Subjects" value={selected.length ? `${selected.length} selected` : "None"} />
            <Row label="Questions" value={actual || "—"} />
            <Row label="Time limit" value={estimate ? formatClock(estimate) : "—"} />
            <Row label="Difficulty" value={difficulty ? difficulty : "Mixed"} />
            {topic && <Row label="Topic" value={topic} />}
          </dl>

          {actual < requested && actual > 0 && (
            <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-800">
              Only {actual} matching question{actual === 1 ? "" : "s"} available — the session will use those.
            </p>
          )}

          {!subscribed && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-3">
              <p className="text-[13px] font-semibold text-brand-900">Subscription required</p>
              <p className="mt-1 text-[12px] leading-relaxed text-brand-800">
                You&apos;ll be sent to checkout when you start. ₦1,000 unlocks 30 days of unlimited practice.
              </p>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={!selected.length || pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4 fill-current" />}
            {pending ? "Preparing questions…" : "Start practice"}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-[12px] text-ink-400">
            <Clock className="size-3.5" />
            Timer starts as soon as the first question loads
          </p>
        </CardBody>
      </Card>
    </form>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-100 pb-2.5 last:border-0">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
