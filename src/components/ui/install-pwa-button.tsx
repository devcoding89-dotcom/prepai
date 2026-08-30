"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Share, PlusSquare, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(Boolean(standalone));
    if (standalone) return;

    // Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("pwa_dismissed");

    // Capture standard install prompt on Android/Chrome/Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed) {
        setTimeout(() => setShowNotification(true), 2000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowNotification(false);
      setDeferredPrompt(null);
    });

    // On iOS or devices where beforeinstallprompt doesn't fire, show banner after delay
    if (isIosDevice && !dismissed) {
      setTimeout(() => setShowNotification(true), 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalled(true);
          setShowNotification(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error("Install prompt error:", err);
      } finally {
        setInstalling(false);
      }
    } else if (isIos) {
      setShowIosModal(true);
    } else {
      // Fallback for browsers without direct prompt
      setShowIosModal(true);
    }
  }

  function handleDismiss() {
    setShowNotification(false);
    sessionStorage.setItem("pwa_dismissed", "true");
  }

  if (isStandalone || installed) return null;

  return (
    <>
      {/* ── Top Header / Quick Action Download Button ── */}
      <button
        onClick={handleInstallClick}
        type="button"
        title="Download PREP CLASS to Home Screen"
        className="group relative flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3 py-1.5 text-[12px] font-bold text-white shadow-sm transition-all duration-200 hover:from-brand-700 hover:to-indigo-700 hover:shadow active:scale-95"
      >
        <Download className="size-3.5 animate-bounce" />
        <span className="hidden xs:inline">Download App</span>
        <span className="xs:hidden">App</span>
      </button>

      {/* ── Floating Notification Banner ── */}
      {showNotification && (
        <aside
          aria-label="Install App notification"
          className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-md animate-fade-up sm:bottom-6 sm:right-6 sm:left-auto"
        >
          <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-white p-4 shadow-2xl ring-1 ring-brand-500/10">
            {/* Top color gradient accent bar */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600" />

            <button
              onClick={handleDismiss}
              type="button"
              className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              aria-label="Close notification"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-3.5 pr-6">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-md shadow-brand-500/20">
                <Smartphone className="size-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                    Faster &amp; Offline
                  </span>
                </div>
                <h4 className="mt-0.5 text-sm font-bold text-ink-950">Install PREP CLASS</h4>
                <p className="mt-0.5 text-xs text-ink-600">
                  Add to your home screen for quick 1-tap practice, CBT timer alerts, and offline past questions.
                </p>
              </div>
            </div>

            <div className="mt-3.5 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                disabled={installing}
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow transition-all hover:opacity-95 active:scale-95 disabled:opacity-60"
              >
                <Download className="size-3.5" />
                {installing ? "Installing..." : "Add to Home Screen"}
              </button>
              <button
                onClick={handleDismiss}
                type="button"
                className="rounded-xl border border-ink-200 px-3 py-2 text-xs font-medium text-ink-600 hover:bg-ink-50"
              >
                Later
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── iOS / Safari Step-by-Step Instructions Modal ── */}
      {showIosModal && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-ink-900/10">
            <button
              onClick={() => setShowIosModal(false)}
              className="absolute right-3.5 top-3.5 grid size-8 place-items-center rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <div className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 mb-3">
                <Smartphone className="size-6" />
              </div>
              <h3 className="text-base font-bold text-ink-950">Add PREP CLASS to Home Screen</h3>
              <p className="mt-1 text-xs text-ink-500">
                Follow these simple steps to install the app on your iPhone or browser:
              </p>
            </div>

            <div className="mt-4 space-y-3 rounded-2xl bg-ink-50 p-4 text-left text-xs text-ink-700">
              <div className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                  1
                </span>
                <p>
                  Tap the <strong className="font-semibold text-ink-900">Share</strong> button{" "}
                  <Share className="inline size-3.5 mx-0.5 text-brand-600" /> in Safari / browser.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                  2
                </span>
                <p>
                  Scroll down and select <strong className="font-semibold text-ink-900">Add to Home Screen</strong>{" "}
                  <PlusSquare className="inline size-3.5 mx-0.5 text-brand-600" />.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                  3
                </span>
                <p>
                  Tap <strong className="font-semibold text-ink-900">Add</strong> at top right. Done!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white hover:bg-brand-700 active:scale-95"
            >
              <CheckCircle2 className="size-4" /> Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
