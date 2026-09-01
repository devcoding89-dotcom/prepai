// ---------------------------------------------------------------------------
// PrepAI — Daily Study Motivations & Anti-AI Fair Play Guidelines
// ---------------------------------------------------------------------------

export interface DailyMotivation {
  id: string;
  quote: string;
  author: string;
  tip: string;
  category: "consistency" | "mindset" | "strategy" | "confidence";
}

export const DAILY_MOTIVATIONS: DailyMotivation[] = [
  {
    id: "m-1",
    quote: "Every question you get wrong today is one less surprise on your real exam day.",
    author: "PrepAI Exam Coach",
    tip: "Don't fear mistakes during practice. Look at the explanation, understand the concept, and you'll never miss it again.",
    category: "mindset",
  },
  {
    id: "m-2",
    quote: "Consistency beats cramming every single time.",
    author: "Top Percentile Strategy",
    tip: "Solving 20 past questions every day builds more exam confidence than solving 200 in a frantic weekend.",
    category: "consistency",
  },
  {
    id: "m-3",
    quote: "JAMB and WAEC do not test luck; they test familiarity with past question patterns.",
    author: "CBT Master Guide",
    tip: "Exams repeat core concepts with different numbers. The more patterns you see, the faster you answer.",
    category: "strategy",
  },
  {
    id: "m-4",
    quote: "Speed comes from certainty, and certainty comes from daily drills.",
    author: "PrepAI Speed Drills",
    tip: "In CBT exams, time management is half the battle. Aim to solve standard questions in under 45 seconds.",
    category: "confidence",
  },
  {
    id: "m-5",
    quote: "Your AI diagnostic report is your secret weapon. Study your weakest topics first.",
    author: "Smart Revision Rule",
    tip: "Turning your 'Critical' red topics into 'Strong' green topics guarantees the biggest jump in your final score.",
    category: "strategy",
  },
  {
    id: "m-6",
    quote: "Small daily improvements over time lead to stunning results on exam day.",
    author: "PrepAI Daily Fuel",
    tip: "Maintain your study streak! Even a 10-question quick drill keeps your mind sharp and active.",
    category: "consistency",
  },
  {
    id: "m-7",
    quote: "Focus on understanding the 'Why', not just memorising the option letter.",
    author: "Exam Principle",
    tip: "When you understand why an answer is right, you can solve any twist the examiners throw at you.",
    category: "mindset",
  },
];

export const ANTI_AI_WARNINGS = {
  title: "Solve With Your Own Brain — Real Exam Conditions",
  shortWarning: "Do not use ChatGPT, Gemini, or photo solvers during practice.",
  detailedMessage:
    "In the real JAMB/WAEC exam hall, you will have zero access to AI tools or phones. If you use AI to get 100% on PrepAI, our diagnostic engine cannot detect your true weaknesses to help you improve. Practice honestly so your AI report accurately guides your revision!",
  rules: [
    "No external AI solvers or browser extensions",
    "No search engines during timed drills",
    "Embrace wrong answers — they reveal where to read next",
  ],
};

export function getDailyMotivation(dayOffset = 0): DailyMotivation {
  // Use day of year so the motivation stays consistent throughout the day
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + dayOffset;
  const index = Math.abs(dayOfYear) % DAILY_MOTIVATIONS.length;
  return DAILY_MOTIVATIONS[index];
}

export function getRandomMotivation(): DailyMotivation {
  const randomIndex = Math.floor(Math.random() * DAILY_MOTIVATIONS.length);
  return DAILY_MOTIVATIONS[randomIndex];
}
