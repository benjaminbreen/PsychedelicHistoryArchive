import { AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type React from "react";
import { setDraftReview } from "@/app/admin/drafts/actions";
import { DraftReviewBadge } from "@/components/admin/draft-review-badge";
import { MarkdownContent } from "@/components/markdown-content";
import { getDraftSource, listDraftSources, readDraftRawText, reviewStatusOf, type DraftSourceRecord } from "@/lib/draft-sources";

export const dynamic = "force-dynamic";

export default async function AdminDraftReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const draft = getDraftSource(slug);
  if (!draft) notFound();

  const all = listDraftSources();
  const index = all.findIndex((item) => item.slug === draft.slug);
  const previous = index > 0 ? all[index - 1] : null;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const raw = draft.draft?.textSource?.rawFile ? readDraftRawText(draft.draft.textSource.rawFile) : null;
  const status = reviewStatusOf(draft);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link className="focus-ring inline-flex items-center gap-1 rounded font-semibold text-archive-violet hover:text-archive-violetDark" href="/admin/drafts">
          <ArrowLeft className="h-4 w-4" /> All drafts
        </Link>
        <span className="text-archive-muted">
          {index + 1} of {all.length}
        </span>
        <div className="ml-auto flex gap-2">
          {previous && <NavLink href={`/admin/drafts/${previous.slug}`} label={`← ${previous.year}`} />}
          {next && <NavLink href={`/admin/drafts/${next.slug}`} label={`${next.year} →`} />}
        </div>
      </div>

      <header className="rounded-md border border-archive-line bg-archive-surface p-5">
        <div className="flex flex-wrap items-start gap-3">
          <DraftReviewBadge status={status} />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold leading-8">{draft.title}</h2>
            {draft.subtitle && <p className="mt-1 text-archive-muted">{draft.subtitle}</p>}
            <p className="mt-2 text-sm text-archive-muted">
              {draft.author} · {draft.displayDate} · {draft.region} · {draft.type} · {draft.language}
            </p>
          </div>
          <a
            className="focus-ring inline-flex h-9 items-center gap-1 rounded-md border border-archive-line px-3 text-xs font-semibold hover:bg-archive-lavender2"
            href={draft.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open source <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="mt-4 max-w-3xl leading-7">{draft.summary}</p>
        {draft.excerpt && (
          <blockquote className="mt-4 border-l-2 border-archive-violet pl-4 text-sm italic leading-6 text-archive-muted">
            {draft.excerpt}
          </blockquote>
        )}
        {draft.issues.length > 0 && (
          <ul className="mt-4 space-y-1 rounded-md border border-yellow-200 bg-archive-warning/50 p-3 text-sm text-yellow-900">
            {draft.issues.map((issue) => (
              <li className="flex items-start gap-2" key={issue}>
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {issue}
              </li>
            ))}
          </ul>
        )}
      </header>

      <section className="rounded-md border border-archive-line bg-archive-surface p-5">
        <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Review decision</h3>
        <form action={setDraftReview} className="mt-3 space-y-3">
          <input name="slug" type="hidden" value={draft.slug} />
          <label className="block">
            <span className="text-sm font-semibold">Note to self</span>
            <textarea
              className="focus-ring mt-1 w-full rounded-md border border-archive-line bg-archive-paper p-2 text-sm"
              defaultValue={draft.draft?.reviewNote ?? ""}
              name="reviewNote"
              placeholder="What needs changing before import, or why this is out"
              rows={2}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <DecisionButton current={status} label="Accept" tone="good" value="accepted" />
            <DecisionButton current={status} label="Hold" tone="warn" value="hold" />
            <DecisionButton current={status} label="Reject" tone="bad" value="rejected" />
            <DecisionButton current={status} label="Reset" tone="plain" value="unreviewed" />
          </div>
          {draft.draft?.reviewedOn && (
            <p className="text-xs text-archive-muted">Last decision recorded {draft.draft.reviewedOn}.</p>
          )}
        </form>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="min-w-0 rounded-md border border-archive-line bg-archive-surface">
          <div className="border-b border-archive-line px-5 py-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">
              Proposed transcript {draft.transcriptWords ? `· ${draft.transcriptWords.toLocaleString()} words` : ""}
            </h3>
          </div>
          <div className="px-5 py-4">
            {draft.transcript ? (
              <MarkdownContent className="source-prose max-w-none" markdown={draft.transcript} />
            ) : (
              <p className="text-sm text-archive-muted">
                No transcript. This draft is a {draft.accessType.replace("_", " ")} record; the text stays with the host.
              </p>
            )}
          </div>
          {draft.translationText && (
            <div className="border-t border-archive-line px-5 py-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">
                Translation ({draft.translationLanguage ?? "English"}, {draft.translationProvider ?? "unknown"})
              </h3>
              {draft.translationNote && <p className="mt-1 text-xs text-archive-muted">{draft.translationNote}</p>}
              <div className="mt-3">
                <MarkdownContent className="source-prose max-w-none" markdown={draft.translationText} />
              </div>
            </div>
          )}
          {raw && (
            <details className="border-t border-archive-line px-5 py-4">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.08em] text-archive-violet">
                Raw fetched text ({draft.draft?.textSource?.rawFile})
              </summary>
              <pre className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded bg-archive-paper p-3 text-xs leading-5 text-archive-muted">
                {raw}
              </pre>
            </details>
          )}
        </section>

        <aside className="space-y-5">
          <Panel title="Why this source">
            <p className="text-sm leading-6">{draft.draft?.rationale ?? "—"}</p>
            {draft.draft?.duplicateCheck && (
              <p className="mt-2 text-xs text-archive-muted">{draft.draft.duplicateCheck}</p>
            )}
          </Panel>

          <Panel title="Text provenance">
            <Rows
              rows={[
                ["Fetched from", draft.draft?.textSource?.url ? <a className="break-all text-archive-violet hover:underline" href={draft.draft.textSource.url} rel="noreferrer" target="_blank">{draft.draft.textSource.url}</a> : "—"],
                ["Host", draft.draft?.textSource?.kind ?? "—"],
                ["Fetched on", draft.draft?.textSource?.fetchedOn ?? "—"],
                ["Raw file", draft.draft?.textSource?.rawFile ? `${draft.draft.textSource.rawFile}${draft.rawFileExists ? "" : " (missing)"}` : "—"],
                ["Scope", draft.draft?.textSource?.scope ?? "—"],
                ["Correction pass", draft.draft?.textQuality?.ocrPass ?? "—"],
                ["Confidence", draft.draft?.textQuality?.confidence ?? "—"],
              ]}
            />
            {draft.draft?.textQuality?.notes && (
              <p className="mt-3 text-sm leading-6 text-archive-muted">{draft.draft.textQuality.notes}</p>
            )}
            {draft.draft?.textQuality?.uncertainReadings?.length ? (
              <div className="mt-3">
                <div className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Still uncertain</div>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
                  {draft.draft.textQuality.uncertainReadings.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ) : null}
          </Panel>

          <Panel title="Catalogue record">
            <Rows
              rows={[
                ["Slug", <code className="break-all text-xs" key="slug">{draft.slug}</code>],
                ["Year", String(draft.year)],
                ["Era", draft.era],
                ["Type", draft.type],
                ["Medium", draft.medium],
                ["Access", draft.accessType.replace("_", " ")],
                ["Hosting", draft.hostingStatus ?? "—"],
                ["Rights", draft.rights],
                ["Citation", draft.citation],
                ["Substances", (draft.substances ?? []).join(", ") || "—"],
                ["People", (draft.people ?? []).join(", ") || "—"],
                ["Tags", (draft.tags ?? []).join(", ") || "—"],
                ["Proposed by", draft.draft?.proposedBy ?? "—"],
                ["Imported", draft.draft?.importedOn ? <a className="text-archive-violet hover:underline" href={`/archive/${draft.slug}`} key="live">live in the archive since {draft.draft.importedOn}</a> : "not imported"],
                ["File", `data/draft-sources/sources/${draft.file}`],
              ]}
            />
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5">
      <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Rows({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div className="grid grid-cols-[8.5rem_1fr] gap-2" key={label}>
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-archive-ink/70">{label}</dt>
          <dd className="min-w-0 break-words leading-6">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DecisionButton({ current, label, tone, value }: { current: string; label: string; tone: "good" | "warn" | "bad" | "plain"; value: string }) {
  const active = current === value;
  const toneClass =
    tone === "good"
      ? "border-green-300 text-green-800 hover:bg-green-50"
      : tone === "warn"
        ? "border-yellow-300 text-yellow-900 hover:bg-archive-warning"
        : tone === "bad"
          ? "border-red-300 text-red-800 hover:bg-red-50"
          : "border-archive-line text-archive-muted hover:bg-archive-lavender2";

  return (
    <button
      className={`focus-ring inline-flex h-9 items-center rounded-md border px-4 text-sm font-semibold ${toneClass} ${active ? "ring-2 ring-archive-violet" : ""}`}
      name="reviewStatus"
      type="submit"
      value={value}
    >
      {label}
    </button>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="focus-ring rounded-md border border-archive-line px-2.5 py-1 text-xs font-semibold hover:bg-archive-lavender2" href={href}>
      {label}
    </Link>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const draft: DraftSourceRecord | null = getDraftSource(slug);
  return { title: draft ? `Draft: ${draft.title}` : "Draft not found" };
}
