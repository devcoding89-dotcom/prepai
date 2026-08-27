import "server-only";

const API = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export interface TutorMessage {
  role: "user" | "model";
  text: string;
}

export async function askGemini(opts: {
  message: string;
  history?: TutorMessage[];
  exam?: string | null;
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");

  const history = (opts.history ?? []).slice(-10).map((item) => ({
    role: item.role,
    parts: [{ text: item.text.slice(0, 4000) }],
  }));
  const context = opts.exam ? `The student is preparing for ${opts.exam}.` : "";
  const contents = [
    ...history,
    {
      role: "user" as const,
      parts: [
        {
          text: `${context}\nYou are PrepAI Tutor, a patient CBT exam tutor. Explain concepts clearly, use short steps, and guide the student without inventing facts. Prefer examples relevant to JAMB, WAEC, or NECO. Student question:\n${opts.message}`,
        },
      ],
    },
  ];

  const response = await fetch(`${API}/${MODEL}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  if (!response.ok) throw new Error(payload.error?.message || "Gemini could not answer right now.");

  const answer = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!answer) throw new Error("Gemini returned an empty answer.");
  return answer;
}
