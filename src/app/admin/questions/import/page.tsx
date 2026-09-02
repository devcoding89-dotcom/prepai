import { ImportTabs } from "@/components/admin/import-tabs";

export const dynamic = "force-dynamic";

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950">Import Questions</h1>
        <p className="mt-1 text-sm text-ink-500">
          Instantly sync live past questions from WAEC &amp; JAMB via API, or paste your own spreadsheet/text.
        </p>
      </div>
      <ImportTabs />
    </div>
  );
}
