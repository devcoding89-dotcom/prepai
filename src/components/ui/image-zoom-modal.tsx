"use client";

import { useEffect, useState } from "react";
import { Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageZoomModalProps {
  src: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  caption?: string;
}

export function ImageZoomModal({
  src,
  alt = "Diagram",
  className,
  imageClassName,
  caption,
}: ImageZoomModalProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset scale when modal closes
  useEffect(() => {
    if (!open) setScale(1);
  }, [open]);

  return (
    <>
      {/* Thumbnail View with click to expand badge */}
      <div className={cn("group relative inline-block overflow-hidden rounded-xl border border-ink-200 bg-white shadow-2xs transition-all hover:border-brand-400 hover:shadow-md", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onClick={() => setOpen(true)}
          className={cn(
            "max-h-72 max-w-full cursor-zoom-in object-contain transition-transform group-hover:scale-[1.015]",
            imageClassName,
          )}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-ink-950/75 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-xs transition-opacity group-hover:bg-brand-600 sm:opacity-90"
        >
          <Maximize2 className="size-3" />
          <span>Click to zoom diagram</span>
        </button>
        {caption && (
          <p className="border-t border-ink-100 bg-ink-50/70 px-3 py-1.5 text-center text-xs font-medium text-ink-600">
            {caption}
          </p>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink-950/85 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setOpen(false)}
        >
          {/* Top control bar */}
          <div
            className="flex w-full max-w-4xl items-center justify-between pb-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold text-white">
                Diagram Viewer
              </span>
              <span className="text-xs text-ink-300">
                {caption || alt} · Use buttons or scroll to inspect angle details
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                className="grid size-9 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
                title="Zoom Out"
              >
                <ZoomOut className="size-4" />
              </button>
              <span className="min-w-10 text-center text-xs font-mono font-bold">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(3, s + 0.25))}
                className="grid size-9 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
                title="Zoom In"
              >
                <ZoomIn className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-xl bg-white/15 text-white transition-colors hover:bg-rose-600"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Interactive Zoomable Image container */}
          <div
            className="relative flex max-h-[85vh] max-w-4xl items-center justify-center overflow-auto rounded-2xl border border-white/10 bg-ink-900/60 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              style={{ transform: `scale(${scale})`, transition: "transform 0.15s ease-out" }}
              className="max-h-[75vh] max-w-full origin-center select-none rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
