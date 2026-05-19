"use client";

import { useRef, useState } from "react";
import type React from "react";
import { Bold, Image, Images, Italic } from "lucide-react";
import { clsx } from "clsx";
import { MarkdownContent } from "@/components/markdown-content";
import type { SourceFigure } from "@/lib/types";

type MarkdownSectionEditorProps = {
  body?: string | null;
  bodyFormat?: string | null;
  compact?: boolean;
  figures: SourceFigure[];
  heading?: string | null;
  sectionTypes: string[];
  formats: string[];
  type?: string | null;
};

export function MarkdownSectionEditor({
  body,
  bodyFormat,
  compact = false,
  figures,
  heading,
  sectionTypes,
  formats,
  type
}: MarkdownSectionEditorProps) {
  const [sectionType, setSectionType] = useState(type || "transcript");
  const [format, setFormat] = useState(bodyFormat || "markdown");
  const [text, setText] = useState(body ?? "");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isNote = sectionType === "note";

  function applyMarkdown(marker: "*" | "**") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = text.slice(start, end);
    const next = `${text.slice(0, start)}${marker}${selected}${marker}${text.slice(end)}`;
    setText(next);

    window.requestAnimationFrame(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start, end + marker.length * 2);
      } else {
        textarea.setSelectionRange(start + marker.length, start + marker.length);
      }
    });
  }

  function insertBlock(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = text.slice(0, start);
    const after = text.slice(end);
    const prefix = before && !before.endsWith("\n\n") ? before.endsWith("\n") ? "\n" : "\n\n" : "";
    const suffix = after && !after.startsWith("\n\n") ? after.startsWith("\n") ? "\n" : "\n\n" : "";
    const insertion = `${prefix}${snippet}${suffix}`;
    const next = `${before}${insertion}${after}`;
    setText(next);

    window.requestAnimationFrame(() => {
      const cursor = start + prefix.length + snippet.length;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  const rowToken = figures.slice(0, 4).map((figure) => figure.token || figure.id).join(",");

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_10rem]">
        <TextInput label="Heading" name="heading" value={heading || ""} />
        <SelectInput label="Type" name="section_type" onChange={setSectionType} options={sectionTypes} value={sectionType} />
        <SelectInput label="Format" name="body_format" onChange={setFormat} options={formats} value={format} />
      </div>

      <div className={clsx("mt-4 grid gap-4", !compact && "lg:grid-cols-2")}>
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Body</span>
          <div className="mt-1 flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-archive-line bg-archive-surface px-2 py-1.5">
            <ToolbarButton label="Bold" onClick={() => applyMarkdown("**")}>
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Italic" onClick={() => applyMarkdown("*")}>
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            {figures.length > 0 && (
              <>
                <span className="mx-1 h-5 w-px bg-archive-line" />
                {rowToken && (
                  <ToolbarButton label="Insert figure row" onClick={() => insertBlock(`{{figure-row:${rowToken}}}`)}>
                    <Images className="h-4 w-4" />
                  </ToolbarButton>
                )}
                <details className="relative">
                  <summary className="focus-ring flex h-8 cursor-pointer list-none items-center gap-1 rounded-md px-2 text-xs font-semibold text-archive-ink hover:bg-white">
                    <Image className="h-4 w-4" />
                    Figures
                  </summary>
                  <div className="absolute left-0 top-9 z-20 max-h-64 w-64 overflow-auto rounded-md border border-archive-line bg-white p-2 shadow-lg">
                    {figures.map((figure) => {
                      const token = figure.token || figure.id;
                      return (
                        <button
                          className="block w-full rounded px-2 py-1.5 text-left font-mono text-xs hover:bg-archive-lavender2"
                          key={figure.id}
                          onClick={() => insertBlock(`{{figure:${token}}}`)}
                          type="button"
                        >
                          {token}
                        </button>
                      );
                    })}
                  </div>
                </details>
              </>
            )}
          </div>
          <textarea
            className={clsx(
              "focus-ring w-full rounded-b-md border border-archive-line bg-white px-3 py-2 font-mono leading-6",
              compact ? "min-h-[11rem]" : "min-h-[28rem]",
              isNote ? "text-xs leading-5" : "text-sm"
            )}
            name="body"
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (!(event.metaKey || event.ctrlKey)) return;
              const key = event.key.toLowerCase();
              if (key === "b") {
                event.preventDefault();
                applyMarkdown("**");
              }
              if (key === "i") {
                event.preventDefault();
                applyMarkdown("*");
              }
            }}
            ref={textareaRef}
            value={text}
          />
        </div>
        {!compact && (
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Live preview</div>
            <div className="mt-1 min-h-[28rem] rounded-md border border-archive-line bg-white p-4">
              {format === "markdown" ? (
                <MarkdownContent className={clsx("source-transcript source-markdown space-y-5 text-archive-ink", isNote && "source-transcript-note-body")} figures={figures} markdown={text} />
              ) : (
                <div className={clsx("source-transcript space-y-5 text-archive-ink", isNote && "source-transcript-note-body")}>
                  {text.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => (
                    <p key={`${index}-${paragraph.slice(0, 18)}`}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function TextInput({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <input className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" defaultValue={value} name={name} />
    </label>
  );
}

function SelectInput({ label, name, onChange, options, value }: { label: string; name: string; onChange: (value: string) => void; options: string[]; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <select className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" name={name} onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">Not set</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ToolbarButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} className="focus-ring flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-archive-ink hover:border-archive-line hover:bg-white" onClick={onClick} title={label} type="button">
      {children}
    </button>
  );
}
