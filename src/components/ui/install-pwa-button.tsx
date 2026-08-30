"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPwaButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as installed PWA — hide the button
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      // Show banner after short delay so it feels intentional
      setTimeout(() => setShowBanner(true), 1500);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
      setPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    setInstalling(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setShowBanner(false);
        setPrompt(null);
      }
    } finally {
      setInstalling(false);
    }
  }

  function dismiss() {
    setShowBanner(false);
    // Hide for the rest of the session; don't show again until next visit
  }

  if (installed || !prompt) return null;

  return (
    <>
      {/* ── Top-bar icon button (always visible when prompt available) ── */}
      <button
        onClick={() => setShowBanner(true)}
        title="Add PREP CLASS to your home screen"
        className="relative grid size-9 place-items-center rounded-xl border border-ink-200 text-ink-600 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
        aria-label="Install app"
      >
        <Download className="size-4" />
        {/* pulsing dot */}
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-brand-600 ring-2 ring-white animate-pulse" />
      </button>

      {/* ── Install banner ── */}
      {showBanner && (
        <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-[60] lg:bottom-5 lg:left-auto lg:right-5 lg:w-80">
          <div
            className="relative overflow-hidden rounded-2xl border border-brand-200 bg-white p-4 shadow-xl ring-1 ring-brand-100"
            style={{ animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            {/* gradient accent strip */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-violet-500 to-brand-600 rounded-t-2xl" />

            <button
              onClick={dismiss}
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-700 text-white shadow-sm">
                <Smartphone className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink-950">Add to Home Screen</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                  Install <span className="font-semibold text-brand-700">PREP CLASS</span> for instant access — works offline too.
                </p>
              </div>
            </div>

            <button
              onClick={handleInstall}
              disabled={installing}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            >
              <Download className="size-4" />
              {installing ? "Installing…" : "Install now — it's free"}
            </button>

            <p className="mt-2 text-center text-[11px] text-ink-400">No app store needed · Works on Android &amp; iPhone</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </>
  );
}
