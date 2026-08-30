import { LoadingScreen } from "@/components/ui/loading-screen";

export default function ExamLoading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-950 p-4 text-white">
      <LoadingScreen
        label="Setting up timed exam session..."
        sublabel="Shuffling past questions and preparing timer"
        fullPage={false}
        className="text-white [&_h3]:text-white [&_p]:text-ink-400 [&_span]:text-white [&_.bg-ink-100]:bg-ink-800"
      />
    </div>
  );
}
