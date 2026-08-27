import "server-only";

const API = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export interface TutorMessage {
  role: "user" | "assistant";
  text: string;
}

export async function askOpenAI(opts: {
  message: string;
  history?: TutorMessage[];
  exam?: string | null;
}): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured.");

  const context = opts.exam ? `The student is preparing for ${opts.exam}.` : "";
  const messages = [
    {
      role: "system" as const,
      content: `${context} You are PrepAI Tutor, a patient CBT exam tutor. Explain concepts clearly, use short steps, and guide the student without inventing facts. Prefer examples relevant to JAMB, WAEC, or NECO.`,
    },
    ...(opts.history ?? []).slice(-10).map((item) => ({
      role: item.role,
      content: item.text.slice(0, 4000),
    })),
    { role: "user" as const, content: opts.message },
  ];

  const response = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.4, max_tokens: 800 }),
    cache: "no-store",
  });

  const raw = await response.text();
  let payload: {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  } = {};
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    throw new Error(`OpenAI returned a non-JSON response (${response.status}).`);
  }
  if (!response.ok) throw new Error(payload.error?.message || "OpenAI could not answer right now.");

  const answer = payload.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("OpenAI returned an empty answer.");
  return answer;
}
