"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TutorMessage = { role: "user" | "assistant"; text: string };

function splitTableRow(row: string) {
  const cells = row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|");
  return cells.map((cell) => cell.trim());
}

function isTableDivider(row: string) {
  const cells = splitTableRow(row);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function AssistantMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  const content: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    if (index + 1 < lines.length && lines[index].includes("|") && isTableDivider(lines[index + 1])) {
      const headers = splitTableRow(lines[index]);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|")) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }

      content.push(
        <div key={`table-${index}`} className="my-3 max-w-full overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[30rem] border-collapse text-left text-[13px]">
            <thead className="bg-ink-100 text-ink-900">
              <tr>
                {headers.map((header, cellIndex) => (
                  <th key={cellIndex} className="border-b border-ink-200 px-3 py-2.5 font-bold whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 bg-white">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="align-top even:bg-ink-50/60">
                  {headers.map((_, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2.5 leading-relaxed text-ink-700">
                      {row[cellIndex] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    content.push(
      <span key={`line-${index}`}>
        {lines[index]}
        {index < lines.length - 1 && "\n"}
      </span>,
    );
    index += 1;
  }

  return <>{content}</>;
}

export function AiTutor({ exam }: { exam: string | null }) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || pending) return;
    setInput("");
    setError(null);
    setPending(true);
    const nextMessages: TutorMessage[] = [...messages, { role: "user", text: message }];
    setMessages(nextMessages);

    try {
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: messages }),
      });
      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !data.answer) throw new Error(data.error || "The AI tutor could not answer.");
      setMessages([...nextMessages, { role: "assistant", text: data.answer }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The AI tutor could not answer.");
      setMessages(messages);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <section className="flex min-h-[560px] flex-col rounded-2xl border border-ink-200 bg-white card-shadow">
        <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-ink-950">PrepAI Tutor</h2>
            <p className="text-xs text-ink-500">Ask for an explanation, example, or revision tip.</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="grid min-h-72 place-items-center text-center">
              <div className="max-w-sm">
                <Sparkles className="mx-auto size-8 text-brand-500" />
                <p className="mt-3 text-base font-bold text-ink-950">What would you like to learn?</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">
                  Try: “Explain quadratic equations step by step” or “Give me a WAEC-style probability example.”
                </p>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={cn("flex gap-3", message.role === "user" && "justify-end")}>
              {message.role === "assistant" && <Sparkles className="mt-1 size-4 shrink-0 text-brand-600" />}
              <div
                className={cn(
                  "max-w-[min(90%,680px)] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user" ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-800",
                )}
              >{message.role === "assistant" ? <AssistantMessage text={message.text} /> : message.text}</div>
              {message.role === "user" && <UserRound className="mt-1 size-4 shrink-0 text-ink-400" />}
            </div>
          ))}
          {pending && (
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Loader2 className="size-4 animate-spin text-brand-600" /> Thinking...
            </div>
          )}
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </div>

        <form onSubmit={submit} className="border-t border-ink-100 p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={pending}
              rows={2}
              maxLength={2000}
              placeholder="Ask your tutor a question..."
              className="min-h-12 flex-1 resize-none rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <Button type="submit" disabled={pending || !input.trim()} aria-label="Send question" className="self-end">
              <Send className="size-4" />
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-ink-400">{exam ? `Tutor context: ${exam}` : "Tutor context: general CBT preparation"}</p>
        </form>
      </section>

      <aside className="h-fit rounded-2xl border border-ink-200 bg-white p-5 card-shadow">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Try asking</p>
        <div className="mt-3 space-y-2 text-sm text-ink-600">
          {["Explain this topic simply", "Give me a worked example", "Quiz me with five questions", "What should I revise next?"] .map((prompt) => (
            <button key={prompt} type="button" onClick={() => setInput(prompt)} className="block w-full rounded-xl border border-ink-200 px-3 py-2 text-left hover:border-brand-300 hover:bg-brand-50">
              {prompt}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
