"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Megaphone,
  Plus,
  Radio,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { Badge, Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  createAnnouncementAction,
  deleteAnnouncementAction,
  toggleAnnouncementActiveAction,
} from "@/app/admin/actions";
import type { Announcement, AnnouncementType, Exam } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface AnnouncementsManagerProps {
  initialAnnouncements: Announcement[];
}

const TYPE_CONFIG: Record<
  AnnouncementType,
  { label: string; icon: typeof Info; badgeTone: "warning" | "info" | "danger" | "success"; border: string; bg: string; text: string }
> = {
  warning: {
    label: "Warning / Notice",
    icon: AlertTriangle,
    badgeTone: "warning",
    border: "border-amber-200",
    bg: "bg-amber-50/70",
    text: "text-amber-900",
  },
  info: {
    label: "Information",
    icon: Info,
    badgeTone: "info",
    border: "border-sky-200",
    bg: "bg-sky-50/70",
    text: "text-sky-900",
  },
  alert: {
    label: "Important Alert",
    icon: AlertCircle,
    badgeTone: "danger",
    border: "border-rose-200",
    bg: "bg-rose-50/70",
    text: "text-rose-900",
  },
  success: {
    label: "Good News / Update",
    icon: CheckCircle2,
    badgeTone: "success",
    border: "border-emerald-200",
    bg: "bg-emerald-50/70",
    text: "text-emerald-900",
  },
};

export function AnnouncementsManager({ initialAnnouncements }: AnnouncementsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<AnnouncementType>("warning");
  const [targetExam, setTargetExam] = useState<Exam | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeCount = initialAnnouncements.filter((a) => a.is_active).length;

  const handleApplyPreset = (preset: "subjects" | "added" | "maintenance") => {
    setError(null);
    setSuccess(null);
    if (preset === "subjects") {
      setTitle("Subject Availability Notice");
      setType("warning");
      setTargetExam("ALL");
      setMessage(
        "Questions for Agricultural Science, Arabic, Computer Studies, French, and Further Mathematics are currently being compiled and reviewed manually. CBT practice for these subjects will be available shortly. Thank you for your patience!"
      );
    } else if (preset === "added") {
      setTitle("New Past Questions Available!");
      setType("success");
      setTargetExam("ALL");
      setMessage(
        "We have recently updated our question bank with the latest WAEC, JAMB, and NECO past questions. Try out a mock session now to test your speed and accuracy!"
      );
    } else if (preset === "maintenance") {
      setTitle("Scheduled Platform Maintenance");
      setType("info");
      setTargetExam("ALL");
      setMessage(
        "Our CBT database server will undergo a brief scheduled performance upgrade tonight between 12:00 AM and 1:00 AM. Practice sessions will resume normally immediately afterwards."
      );
    }
  };

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("message", message);
    formData.set("type", type);
    formData.set("target_exam", targetExam);

    startTransition(async () => {
      const res = await createAnnouncementAction({}, formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(res.ok || "Notice published to students!");
        setTitle("");
        setMessage("");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      await deleteAnnouncementAction(formData);
      setConfirmDeleteId(null);
    });
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("is_active", String(currentActive));
      await toggleAnnouncementActiveAction(formData);
    });
  };

  const TypeIcon = TYPE_CONFIG[type].icon;

  return (
    <div className="space-y-8">
      {/* Overview Stat Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3.5 rounded-2xl border border-ink-200/80 bg-white p-4 shadow-xs">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Bell className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Active Notices</p>
            <p className="text-2xl font-black text-ink-950">{activeCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-ink-200/80 bg-white p-4 shadow-xs">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Megaphone className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Total Created</p>
            <p className="text-2xl font-black text-ink-950">{initialAnnouncements.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-ink-200/80 bg-white p-4 shadow-xs">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Radio className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Live Broadcast</p>
            <p className="text-xs font-medium text-ink-600">
              {activeCount > 0 ? "Visible to students on Dashboard & Practice" : "No active broadcast"}
            </p>
          </div>
        </div>
      </div>

      {/* Creation Box */}
      <Card className="border-ink-200/90 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-ink-100 bg-ink-50/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold text-ink-950 flex items-center gap-2">
                <Plus className="size-5 text-brand-600" />
                Write Note for Students
              </CardTitle>
              <p className="mt-0.5 text-xs text-ink-500">
                Inform students about missing subjects, updates, or maintenance. You can delete it whenever you solve it.
              </p>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mr-1">
                Quick Template:
              </span>
              <button
                type="button"
                onClick={() => handleApplyPreset("subjects")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <Sparkles className="size-3.5 text-amber-600" />
                Subject Availability Notice
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("added")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                New Questions Added
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("maintenance")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50 transition-colors"
              >
                Maintenance
              </button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="pt-6">
          <form onSubmit={handleCreateSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-700">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Subject Availability Notice"
                  className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {/* Target Exam */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-700">
                  Target Audience
                </label>
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value as Exam | "ALL")}
                  className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="ALL">All Students (Every Exam)</option>
                  <option value="JAMB">JAMB Students Only</option>
                  <option value="WAEC">WAEC Students Only</option>
                  <option value="NECO">NECO Students Only</option>
                  <option value="AI GENERATED">AI Questions Practice</option>
                </select>
              </div>
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-1.5">
                Notice Tone & Color
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(TYPE_CONFIG) as AnnouncementType[]).map((t) => {
                  const cfg = TYPE_CONFIG[t];
                  const Icon = cfg.icon;
                  const isSelected = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                        isSelected
                          ? `${cfg.border} ${cfg.bg} ${cfg.text} ring-2 ring-brand-500/20 shadow-xs font-bold`
                          : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50/80"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Text */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700">
                Notice Content / Note *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain the situation to students (e.g. Agricultural Science, Arabic, and Computer Studies are currently being compiled manually and will be ready shortly...)"
                className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white p-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Student Preview */}
            {(title || message) && (
              <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-3.5 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
                  <Wand2 className="size-3.5 text-brand-600" />
                  Live Student Preview (Dashboard display)
                </p>
                <div
                  className={`rounded-xl border p-3.5 flex items-start gap-3 shadow-xs ${TYPE_CONFIG[type].border} ${TYPE_CONFIG[type].bg}`}
                >
                  <TypeIcon className={`size-5 shrink-0 mt-0.5 ${TYPE_CONFIG[type].text}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${TYPE_CONFIG[type].text}`}>
                        {title || "Notice Title"}
                      </h4>
                      <Badge tone={TYPE_CONFIG[type].badgeTone}>
                        {targetExam === "ALL" ? "All Exams" : targetExam}
                      </Badge>
                    </div>
                    <p className={`mt-0.5 text-xs ${TYPE_CONFIG[type].text} opacity-90 leading-relaxed`}>
                      {message || "Notice message will appear here..."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" loading={isPending} className="gap-2">
                <Megaphone className="size-4" />
                Publish Notice to Students
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Existing Notices List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-950">Active & Published Notices</h2>
            <p className="text-xs text-ink-500">
              When a missing subject or issue is resolved, click &ldquo;Delete&rdquo; to remove it immediately.
            </p>
          </div>
          <span className="text-xs font-semibold text-ink-500">
            {initialAnnouncements.length} {initialAnnouncements.length === 1 ? "Notice" : "Notices"}
          </span>
        </div>

        {initialAnnouncements.length === 0 ? (
          <Card className="border-dashed border-ink-200 py-12 text-center">
            <CardBody className="space-y-2">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
                <Bell className="size-6" />
              </div>
              <p className="text-sm font-bold text-ink-800">No active notices right now</p>
              <p className="text-xs text-ink-500 max-w-sm mx-auto">
                Use the form above to compose a note informing students about subject availability or announcements.
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {initialAnnouncements.map((ann) => {
              const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.warning;
              const Icon = cfg.icon;
              const isDeleting = confirmDeleteId === ann.id;

              return (
                <Card
                  key={ann.id}
                  className={`border transition-all ${
                    ann.is_active ? "border-ink-200/90 shadow-xs" : "border-ink-200/50 opacity-60 bg-ink-50/40"
                  }`}
                >
                  <CardBody className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${cfg.border} border`}>
                        <Icon className={`size-5 ${cfg.text}`} />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-ink-950">{ann.title}</h3>
                          <Badge tone={cfg.badgeTone}>{cfg.label}</Badge>
                          <Badge tone="neutral">
                            {ann.target_exam === "ALL" ? "All Exams" : ann.target_exam}
                          </Badge>
                          {!ann.is_active && (
                            <span className="rounded-md bg-ink-200 px-1.5 py-0.5 text-[10px] font-bold text-ink-700">
                              Paused / Inactive
                            </span>
                          )}
                          <span className="text-[11px] text-ink-400">
                            {timeAgo(ann.created_at)}
                          </span>
                        </div>

                        <p className="text-xs text-ink-700 leading-relaxed whitespace-pre-wrap">
                          {ann.message}
                        </p>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(ann.id, ann.is_active)}
                        disabled={isPending}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          ann.is_active
                            ? "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
                            : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        {ann.is_active ? "Pause" : "Activate"}
                      </button>

                      {isDeleting ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDelete(ann.id)}
                            disabled={isPending}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-xs"
                          >
                            Yes, Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(ann.id)}
                          disabled={isPending}
                          title="Delete notice once solved"
                          className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete (Solved)</span>
                        </button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
