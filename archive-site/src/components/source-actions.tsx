"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, ExternalLink, Share2 } from "lucide-react";
import type { ReactNode } from "react";

type SourceActionsProps = {
  citation: string;
  pdfUrl?: string;
  shareTitle: string;
  sourceUrl?: string;
  viewLabel?: string;
};

type CopyState = "citation" | "link" | null;

export function SourceActions({
  citation,
  pdfUrl,
  shareTitle,
  sourceUrl,
  viewLabel = "View original source"
}: SourceActionsProps) {
  const [copied, setCopied] = useState<CopyState>(null);
  const hasSourceUrl = sourceUrl && sourceUrl !== "#";

  async function copyValue(value: string, state: CopyState) {
    await navigator.clipboard.writeText(value);
    setCopied(state);
    window.setTimeout(() => setCopied(null), 1600);
  }

  async function shareSource() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: citation,
        url
      });
      return;
    }

    await copyValue(url, "link");
  }

  return (
    <div className="border-t border-archive-line">
      {hasSourceUrl && (
        <ActionLink href={sourceUrl} icon={<ExternalLink className="h-5 w-5" />} label={viewLabel} />
      )}
      {pdfUrl && (
        <ActionLink href={pdfUrl} icon={<Download className="h-5 w-5" />} label="Download PDF" meta="PDF" />
      )}
      <ActionButton
        icon={copied === "citation" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        label={copied === "citation" ? "Citation copied" : "Copy citation"}
        onClick={() => {
          void copyValue(citation, "citation").catch(() => undefined);
        }}
      />
      <ActionButton
        icon={copied === "link" ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
        label={copied === "link" ? "Link copied" : "Share"}
        onClick={() => {
          void shareSource().catch(() => undefined);
        }}
      />
    </div>
  );
}

function ActionLink({ href, icon, label, meta }: { href: string; icon: ReactNode; label: string; meta?: string }) {
  return (
    <Link className="focus-ring flex w-full items-center justify-between border-b border-archive-line px-5 py-4 text-left transition last:border-b-0 hover:bg-archive-paper" href={href}>
      <span className="flex items-center gap-3 text-archive-ink">
        {icon}
        <span className="font-medium">{label}</span>
      </span>
      {meta && <span className="text-xs text-archive-muted">{meta}</span>}
    </Link>
  );
}

function ActionButton({
  icon,
  label,
  meta,
  onClick
}: {
  icon: ReactNode;
  label: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button className="focus-ring flex w-full items-center justify-between border-b border-archive-line px-5 py-4 text-left transition last:border-b-0 hover:bg-archive-paper" type="button" onClick={onClick}>
      <span className="flex items-center gap-3 text-archive-ink">
        {icon}
        <span className="font-medium">{label}</span>
      </span>
      {meta && <span className="text-xs text-archive-muted">{meta}</span>}
    </button>
  );
}
