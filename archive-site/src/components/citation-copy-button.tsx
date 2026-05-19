"use client";

import { Check, Copy } from "lucide-react";
import { useState, useTransition } from "react";

type CitationCopyButtonProps = {
  citation: string;
  label: string;
};

export function CitationCopyButton({ citation, label }: CitationCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <button
      className="focus-ring inline-flex h-8 items-center gap-1.5 rounded border border-archive-line bg-archive-surface px-2.5 text-xs font-semibold text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2"
      onClick={() => {
        startTransition(async () => {
          await navigator.clipboard.writeText(citation);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
      type="button"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}
