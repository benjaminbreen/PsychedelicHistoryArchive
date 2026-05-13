"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Settings } from "lucide-react";
import { clsx } from "clsx";

const SERIF_OPTIONS = [
  { label: "Georgia", value: "georgia", className: "[font-family:Georgia,serif]" },
  { label: "Source Sans 3", value: "source-sans", className: "[font-family:var(--font-sans),system-ui,sans-serif]" },
  { label: "Cormorant Garamond", value: "cormorant-garamond", className: "[font-family:var(--font-cormorant-garamond),Georgia,serif]" },
  { label: "Newsreader", value: "newsreader", className: "[font-family:var(--font-newsreader),Georgia,serif]" },
  { label: "Source Serif 4", value: "source-serif", className: "[font-family:var(--font-source-serif),Georgia,serif]" }
] as const;

const SIZE_OPTIONS = [
  { label: "Compact", value: "compact", meta: "Smaller, tighter" },
  { label: "Comfortable", value: "comfortable", meta: "Default" },
  { label: "Large", value: "large", meta: "Larger, airier" }
] as const;

type SerifValue = (typeof SERIF_OPTIONS)[number]["value"];
type SizeValue = (typeof SIZE_OPTIONS)[number]["value"];

const SERIF_KEY = "archive-source-serif";
const SIZE_KEY = "archive-source-text-size";

export function SourceTextSettings() {
  const [open, setOpen] = useState(false);
  const [serif, setSerif] = useState<SerifValue>("newsreader");
  const [size, setSize] = useState<SizeValue>("comfortable");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedSerif = localStorage.getItem(SERIF_KEY) as SerifValue | null;
    const storedSize = localStorage.getItem(SIZE_KEY) as SizeValue | null;

    if (storedSerif && SERIF_OPTIONS.some((option) => option.value === storedSerif)) {
      setSerif(storedSerif);
      document.documentElement.dataset.sourceSerif = storedSerif;
    } else {
      document.documentElement.dataset.sourceSerif = "newsreader";
    }

    if (storedSize && SIZE_OPTIONS.some((option) => option.value === storedSize)) {
      setSize(storedSize);
      document.documentElement.dataset.sourceTextSize = storedSize;
    } else {
      document.documentElement.dataset.sourceTextSize = "comfortable";
    }
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function updateSerif(value: SerifValue) {
    setSerif(value);
    document.documentElement.dataset.sourceSerif = value;
    localStorage.setItem(SERIF_KEY, value);
  }

  function updateSize(value: SizeValue) {
    setSize(value);
    document.documentElement.dataset.sourceTextSize = value;
    localStorage.setItem(SIZE_KEY, value);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        aria-expanded={open}
        aria-label="Source text settings"
        className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md border border-archive-line bg-white text-archive-ink shadow-sm transition hover:bg-archive-lavender2"
        data-testid="source-text-settings-trigger"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        type="button"
      >
        <Settings className="h-[1.125rem] w-[1.125rem]" />
      </button>

      {open && (
        <div className="fixed right-6 top-[4.35rem] z-50 w-[20rem] rounded-lg border border-archive-line bg-white p-4 text-sm shadow-soft xl:right-12" data-testid="source-text-settings-panel">
          <div>
            <div className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-archive-muted">Source serif</div>
            <div className="mt-2 grid gap-1">
              {SERIF_OPTIONS.map((option) => (
                <button
                  className={clsx(
                    "focus-ring flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition hover:bg-archive-lavender2",
                    serif === option.value && "bg-archive-lavender2 text-archive-violet"
                  )}
                  key={option.value}
                  onClick={() => updateSerif(option.value)}
                  type="button"
                >
                  <span className={option.className}>
                    {option.label}
                  </span>
                  {serif === option.value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-archive-line pt-4">
            <div className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-archive-muted">Text size</div>
            <div className="mt-2 grid gap-1">
              {SIZE_OPTIONS.map((option) => (
                <button
                  className={clsx(
                    "focus-ring flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition hover:bg-archive-lavender2",
                    size === option.value && "bg-archive-lavender2 text-archive-violet"
                  )}
                  key={option.value}
                  onClick={() => updateSize(option.value)}
                  type="button"
                >
                  <span>
                    <span className="block font-medium">{option.label}</span>
                    <span className="block text-xs text-archive-muted">{option.meta}</span>
                  </span>
                  {size === option.value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
