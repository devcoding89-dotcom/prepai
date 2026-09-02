"use client";

import { useState } from "react";
import { CloudDownload, FileText, Sparkles } from "lucide-react";
import { WaecApiImporter } from "@/components/admin/waec-api-importer";
import { QuestionImporter } from "@/components/admin/question-importer";
import { cn } from "@/lib/utils";

export function ImportTabs() {
  const [activeTab, setActiveTab] = useState<"api" | "manual">("api");

  return (
    <div className="space-y-6">
      <div className="flex border-b border-ink-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("api")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
            activeTab === "api"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800"
          )}
        >
          <CloudDownload className="size-4" />
          WAEC &amp; JAMB API Sync (1-Click Import)
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800">
            Recommended
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
            activeTab === "manual"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800"
          )}
        >
          <FileText className="size-4" />
          Manual Bulk Paste &amp; CSV
        </button>
      </div>

      {activeTab === "api" ? <WaecApiImporter /> : <QuestionImporter />}
    </div>
  );
}
