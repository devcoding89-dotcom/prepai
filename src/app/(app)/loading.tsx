import { LoadingScreen, SkeletonCard } from "@/components/ui/loading-screen";

export default function AppLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top Header Skeleton */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-xl bg-ink-100 animate-pulse" />
          <div className="h-4 w-44 rounded-md bg-ink-50 animate-pulse" />
        </div>
        <div className="h-10 w-40 rounded-xl bg-ink-100 animate-pulse" />
      </div>

      {/* Hero animated loader */}
      <div className="rounded-3xl border border-brand-100 bg-gradient-to-b from-brand-50/40 via-white to-ink-50/20 p-8 card-shadow">
        <LoadingScreen
          label="Fetching your CBT progress & AI reports..."
          sublabel="Syncing past questions and syllabus analytics"
          fullPage={false}
          className="py-4"
        />
      </div>

      {/* Skeleton Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
