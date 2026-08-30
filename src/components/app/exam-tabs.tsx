"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { EXAMS, type Exam } from "@/lib/types";

interface ExamTabsProps {
  currentExam: Exam;
}

export function ExamTabs({ currentExam }: ExamTabsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleTabClick = (exam: Exam) => {
    if (exam === currentExam) return;
    startTransition(() => {
      router.push(`/practice?exam=${encodeURIComponent(exam)}`);
    });
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {EXAMS.map((option) => {
        const isActive = option === currentExam;
        const isLoading = isPending && !isActive;
        return (
          <button
            key={option}
            type="button"
            onClick={() => handleTabClick(option as Exam)}
            disabled={isPending}
            className={[
              "rounded-lg border px-3 py-1.5 text-xs font-bold transition-all duration-150",
              isActive
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-ink-200 bg-white text-ink-500 hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-700 active:scale-95",
              isPending ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            {option} questions
            {isLoading && (
              <span className="ml-1 inline-block size-2.5 animate-spin rounded-full border border-current border-t-transparent opacity-60" />
            )}
          </button>
        );
      })}
    </div>
  );
}
