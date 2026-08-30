import { LoadingScreen } from "@/components/ui/loading-screen";

export default function RootLoading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-50/60 p-4">
      <LoadingScreen
        label="Loading PREP CLASS..."
        sublabel="Preparing your study workspace"
        fullPage={false}
      />
    </div>
  );
}
