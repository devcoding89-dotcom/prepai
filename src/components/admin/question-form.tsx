"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, Save, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { Button, buttonClass } from "@/components/ui/button";
import { createQuestionAction, updateQuestionAction, type AdminState } from "@/app/admin/actions";
import { EXAMS, LETTERS, SUBJECTS_BY_EXAM, type Exam, type Question } from "@/lib/types";
import { cn } from "@/lib/utils";

export function QuestionForm({ question }: { question?: Question }) {
  const [state, action, pending] = useActionState(
    question ? updateQuestionAction : createQuestionAction,
    {} as AdminState,
  );
  const [exam, setExam] = useState<Exam>(question?.exam ?? "JAMB");
  const [subject, setSubject] = useState(question?.subject ?? "");
  const [topic, setTopic] = useState(question?.topic ?? "");
  const [difficulty, setDifficulty] = useState(question?.difficulty ?? "medium");
  const [answer, setAnswer] = useState(question?.correct_answer ?? "A");
  const [optionCount, setOptionCount] = useState(question?.options.length ?? 4);
  const [questionText, setQuestionText] = useState(question?.question_text ?? "");
  const [options, setOptions] = useState(question?.options ?? ["", "", "", ""]);
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  async function generateQuestion() {
    if (!subject || !topic) {
      setGenerationError("Enter a subject and topic before generating.");
      return;
    }
    setGenerating(true);
    setGenerationError(null);
    try {
      const response = await fetch("/api/admin/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam, subject, topic, difficulty }),
      });
      const data = (await response.json()) as { question?: { question_text: string; options: string[]; correct_answer: string; explanation: string }; error?: string };
      if (!response.ok || !data.question) throw new Error(data.error || "Could not generate a question.");
      setQuestionText(data.question.question_text);
      setOptions(data.question.options);
      setOptionCount(data.question.options.length);
      setAnswer(data.question.correct_answer);
      setExplanation(data.question.explanation);
    } catch (cause) {
      setGenerationError(cause instanceof Error ? cause.message : "Could not generate a question.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      {question && <input type="hidden" name="id" value={question.id} />}

      <div className="space-y-5">
        {state.error && <Alert>{state.error}</Alert>}
        {state.ok && <Alert tone="success">{state.ok}</Alert>}

        <Card>
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Field label="Question text" htmlFor="question_text">
              <Textarea
                id="question_text"
                name="question_text"
                required
                value={questionText}
                onChange={(event) => setQuestionText(event.target.value)}
                placeholder="e.g. Solve for x: x² − 5x + 6 = 0"
                className="min-h-28"
              />
            </Field>

            <div>
              <p className="mb-2 text-sm font-medium text-ink-800">Options — tick the correct one</p>
              <div className="space-y-2.5">
                {LETTERS.slice(0, optionCount).map((letter, i) => (
                  <div
                    key={letter}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border p-2.5",
                      answer === letter ? "border-emerald-400 bg-emerald-50/60" : "border-ink-200",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setAnswer(letter)}
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg text-[12px] font-bold",
                        answer === letter ? "bg-emerald-600 text-white" : "bg-ink-100 text-ink-600",
                      )}
                    >
                      {letter}
                    </button>
                    <Input
                      name={`option_${i + 1}`}
                      value={options[i] ?? ""}
                      onChange={(event) => setOptions((current) => current.map((option, index) => (index === i ? event.target.value : option)))}
                      placeholder={`Option ${letter}`}
                      required={i < 2}
                      className="border-0 focus:ring-0"
                    />
                  </div>
                ))}
              </div>
              <input type="hidden" name="correct_answer" value={answer} />
              <div className="mt-2 flex gap-2">
                {optionCount < 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      setOptions((current) => [...current, ""]);
                      setOptionCount((c) => c + 1);
                    }}
                    className="text-[12px] font-semibold text-brand-700 hover:underline"
                  >
                    + Add option
                  </button>
                )}
                {optionCount > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setOptions((current) => current.slice(0, -1));
                      setOptionCount((c) => c - 1);
                    }}
                    className="text-[12px] font-semibold text-ink-400 hover:underline"
                  >
                    − Remove last
                  </button>
                )}
              </div>
            </div>

            <Field label="Explanation" htmlFor="explanation" hint="Shown to the student when reviewing the session.">
              <Textarea
                id="explanation"
                name="explanation"
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                placeholder="Factorising gives (x − 2)(x − 3) = 0, so x = 2 or 3."
              />
            </Field>
          </CardBody>
        </Card>
      </div>

      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Classification</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="rounded-xl border border-brand-200 bg-brand-50/70 p-3.5">
            <div className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-bold text-brand-900">AI-generated question</p>
                <p className="mt-0.5 text-xs leading-relaxed text-brand-800">Uses the selected exam, subject and topic. Review it before saving.</p>
              </div>
            </div>
            <Button type="button" variant="secondary" onClick={generateQuestion} disabled={generating} className="mt-3 w-full">
              {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {generating ? "Generating..." : "Generate with AI"}
            </Button>
            {generationError && <p className="mt-2 text-xs font-medium text-rose-700">{generationError}</p>}
          </div>

          <Field label="Exam" htmlFor="exam">
            <Select id="exam" name="exam" value={exam} onChange={(e) => setExam(e.target.value as Exam)}>
              {EXAMS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Subject" htmlFor="subject">
            <Input
              id="subject"
              name="subject"
              required
              list="subject-options"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
              placeholder="Mathematics"
            />
            <datalist id="subject-options">
              {SUBJECTS_BY_EXAM[exam].map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>

          <Field label="Topic" htmlFor="topic" hint="Used by the AI report and textbook matching — keep it consistent.">
            <Input id="topic" name="topic" required value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Quadratic Equations" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Difficulty" htmlFor="difficulty">
              <Select id="difficulty" name="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value as typeof difficulty)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </Field>
            <Field label="Year" htmlFor="year">
              <Input id="year" name="year" type="number" min={1980} max={2100} defaultValue={question?.year ?? ""} placeholder="2023" />
            </Field>
          </div>

          <Field label="Image URL (optional)" htmlFor="image_url">
            <Input id="image_url" name="image_url" defaultValue={question?.image_url ?? ""} placeholder="https://…" />
          </Field>

          <label className="flex items-center gap-2.5 text-sm text-ink-700">
            <Checkbox name="is_active" defaultChecked={question?.is_active ?? true} />
            Active (available in practice sessions)
          </label>

          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" loading={pending} className="w-full">
              <Save className="size-4" />
              {question ? "Save changes" : "Create question"}
            </Button>
            {!question && (
              <Button type="submit" name="another" value="1" variant="outline" className="w-full" disabled={pending}>
                Save and add another
              </Button>
            )}
            <Link href="/admin/questions" className={buttonClass("ghost", "md", "w-full")}>
              Cancel
            </Link>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
