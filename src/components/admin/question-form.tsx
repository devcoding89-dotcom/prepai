"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Loader2, Save, Sparkles, Trash2, UploadCloud, ZoomIn } from "lucide-react";
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
  const [imageUrl, setImageUrl] = useState(question?.image_url ?? "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (PNG, JPG, WEBP, or SVG).");
      return;
    }
    setUploadingImage(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Failed to upload image.");
      setImageUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload diagram.");
    } finally {
      setUploadingImage(false);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          void handleFileUpload(file);
          break;
        }
      }
    }
  }

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
      const data = (await response.json()) as {
        question?: { question_text: string; options: string[]; correct_answer: string; explanation: string };
        error?: string;
      };
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
    <form
      action={action}
      onPaste={handlePaste}
      className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start"
    >
      {question && <input type="hidden" name="id" value={question.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />

      <div className="space-y-5">
        {state.error && <Alert>{state.error}</Alert>}
        {state.ok && <Alert tone="success">{state.ok}</Alert>}

        <Card>
          <CardHeader>
            <CardTitle>Question Content</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Field label="Question text" htmlFor="question_text" hint="You can paste a screenshot directly with Ctrl+V">
              <Textarea
                id="question_text"
                name="question_text"
                required
                value={questionText}
                onChange={(event) => setQuestionText(event.target.value)}
                placeholder="e.g. In the diagram below, find the value of angle x in degrees..."
                className="min-h-28"
              />
            </Field>

            {/* Math / Geometry Diagram Attachment Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-ink-800">
                  Question Diagram / Drawing (Optional)
                </label>
                <span className="text-[11px] text-ink-400">
                  Angle diagrams, geometry, graphs, etc.
                </span>
              </div>

              {uploadError && <Alert className="mb-2">{uploadError}</Alert>}

              {imageUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-brand-200 bg-brand-50/30 p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-brand-100">
                    <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-brand-600" /> Attached Diagram
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </button>
                  </div>
                  <div className="mt-3 flex justify-center bg-white rounded-lg p-2 border border-ink-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Question diagram preview"
                      className="max-h-56 max-w-full object-contain rounded"
                    />
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) void handleFileUpload(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50/40 p-5 text-center cursor-pointer transition-all hover:border-brand-400 hover:bg-brand-50/30",
                    uploadingImage && "pointer-events-none opacity-60",
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) void handleFileUpload(e.target.files[0]);
                    }}
                  />
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="size-6 animate-spin text-brand-600" />
                      <p className="text-xs font-semibold text-brand-700">Uploading diagram...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid size-10 place-items-center rounded-xl bg-white text-ink-600 shadow-2xs group-hover:text-brand-600">
                        <UploadCloud className="size-5" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-ink-800 group-hover:text-brand-900">
                        Click to upload diagram, drag & drop, or press Ctrl+V to paste screenshot
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-400">
                        Supports PNG, JPG, WEBP, and SVG (Up to 12MB)
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

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
                    <input
                      name={`option_${letter.toLowerCase()}`}
                      required
                      value={options[i] ?? ""}
                      onChange={(event) => {
                        const next = [...options];
                        next[i] = event.target.value;
                        setOptions(next);
                      }}
                      placeholder={`Option ${letter}`}
                      className="h-10 flex-1 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-ink-500">Correct answer: <strong>Option {answer}</strong></span>
                <div className="flex gap-2">
                  {optionCount < 5 && (
                    <button
                      type="button"
                      onClick={() => setOptionCount((prev) => Math.min(5, prev + 1))}
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      + Add Option E
                    </button>
                  )}
                  {optionCount > 2 && (
                    <button
                      type="button"
                      onClick={() => setOptionCount((prev) => Math.max(2, prev - 1))}
                      className="font-semibold text-ink-400 hover:underline"
                    >
                      Remove last option
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Field label="Explanation (optional)" htmlFor="explanation" hint="Shown to students during test review and AI diagnosis.">
              <Textarea
                id="explanation"
                name="explanation"
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                placeholder="Explain the step-by-step angle theorem or method..."
                className="min-h-24"
              />
            </Field>
          </CardBody>
        </Card>
      </div>

      {/* sidebar metadata */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Metadata</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateQuestion}
            loading={generating}
            className="text-xs"
          >
            <Sparkles className="size-3.5 text-brand-600" />
            AI Draft
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          {generationError && <Alert>{generationError}</Alert>}

          <Field label="Exam" htmlFor="exam">
            <Select id="exam" name="exam" value={exam} onChange={(event) => setExam(event.target.value as Exam)}>
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
            <Input
              id="topic"
              name="topic"
              required
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Circle Geometry & Angles"
            />
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

          <Field label="Image URL / Direct Link" htmlFor="image_url_direct" hint="Auto-filled when uploading, or paste an external URL.">
            <Input
              id="image_url_direct"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://… or upload above"
            />
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
