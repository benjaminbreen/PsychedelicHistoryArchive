"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

export function CopyTokenButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="focus-ring inline-flex h-7 items-center gap-1 rounded-md border border-archive-line bg-white px-2 text-xs font-semibold text-archive-ink hover:bg-archive-lavender2"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      type="button"
    >
      <Copy className="h-3.5 w-3.5" />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
