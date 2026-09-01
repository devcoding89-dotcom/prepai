import { LoadingScreen } from "@/components/ui/loading-screen";

export default function ExamLoading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-950 p-4 text-white">
      <LoadingScreen
        label="Setting up timed CBT exam session..."
        sublabel="Shuffling past questions and calibrating exam timer"
        fullPage={false}
        showMotivation={true}
        showAntiAIWarning={true}
        className="text-white [&_h3]:text-white [&_p]:text-ink-400 [&_span]:text-white [&_.bg-ink-100]:bg-ink-800 [&_.bg-brand-50\/70]:bg-ink-900/90 [&_.border-brand-200\/80]:border-brand-500/30 [&_.text-ink-900]:text-white [&_.text-ink-600]:text-ink-300 [&_.bg-amber-50\/90]:bg-amber-950/80 [&_.border-amber-300]:border-amber-500/40 [&_.text-amber-950]:text-amber-300 [&_.text-amber-800]:text-amber-200"
      />
    </div>
  );
}
