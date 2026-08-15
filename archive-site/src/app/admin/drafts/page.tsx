import { AlertTriangle, CheckCircle2, ExternalLink, FileText, Link2, PauseCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { DraftReviewBadge } from "@/components/admin/draft-review-badge";
import type React from "react";
import {
  ERA_ORDER,
  listBrokenDraftFiles,
  listDraftSources,
  reviewStatusOf,
  summarizeDrafts,
  type DraftReviewStatus,
  type DraftSourceRecord,
} from "@/lib/draft-sources";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ review?: string; era?: string; access?: string; q?: string }>;

const REVIEW_FILTERS: Array<{ id: DraftReviewStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "unreviewed", label: "Unreviewed" },
  { id: "accepted", label: "Accepted" },
  { id: "hold", label: "On hold" },
  { id: "rejected", label: "Rejected" },
];

export default async function AdminDraftsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const all = listDraftSources();
  const broken = listBrokenDraftFiles();
  const facets = summarizeDrafts(all);

  const review = REVIEW_FILTERS.some((filter) => filter.id === params.review) ? params.review! : "all";
  const era = params.era && ERA_ORDER.includes(params.era) ? params.era : "";
  const access = params.access ?? "";
  const query = (params.q ?? "").trim().toLowerCase();

  const drafts = all.filter((draft) => {
    if (review !== "all" && reviewStatusOf(draft) !== review) return false;
    if (era && draft.era !== era) return false;
    if (access && draft.accessType !== access) return false;
    if (query) {
      const haystack = [draft.title, draft.author, draft.summary, draft.region, ...(draft.substances ?? []), ...(draft.tags ?? []), ...(draft.people ?? [])]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const byEra = groupByEra(drafts);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold">Proposed sources</h2>
          <p className="mt-1 text-sm text-archive-muted">
            Proposed additions staged in <code className="rounded bg-archive-surface px-1.5 py-0.5">data/draft-sources/</code>,
            with the fetched text they were transcribed from. Drafts marked <em>imported</em> are already live in the archive;
            the rest are still only here. Import with{" "}
            <code className="rounded bg-archive-surface px-1.5 py-0.5">node scripts/build_draft_import.mjs --publish</code>.
          </p>
        </div>
        <div className="ml-auto rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-xs text-archive-muted">
          <div>Validate: <code className="rounded bg-archive-paper px-1.5 py-0.5">node scripts/validate_draft_sources.mjs</code></div>
          <div className="mt-1">{facets.hostedWords.toLocaleString()} words of hosted transcript staged</div>
        </div>
      </div>

      {broken.length > 0 && (
        <section className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <h3 className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            {broken.length} draft file{broken.length === 1 ? "" : "s"} could not be parsed and {broken.length === 1 ? "is" : "are"} not listed below
          </h3>
          <ul className="mt-2 space-y-1">
            {broken.map((item) => (
              <li key={item.file}>
                <code>{item.file}</code> — {item.error}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard icon={<FileText className="h-5 w-5" />} label="Drafts" value={facets.total} />
        <SummaryCard icon={<CheckCircle2 className="h-5 w-5" />} label="Accepted" tone="good" value={facets.byReview.accepted} />
        <SummaryCard icon={<PauseCircle className="h-5 w-5" />} label="On hold" value={facets.byReview.hold} />
        <SummaryCard icon={<XCircle className="h-5 w-5" />} label="Rejected" value={facets.byReview.rejected} />
        <SummaryCard icon={<Link2 className="h-5 w-5" />} label="Full text hosted" value={facets.byAccess.hosted ?? 0} />
        <SummaryCard icon={<AlertTriangle className="h-5 w-5" />} label="Flagged" tone={facets.flagged ? "high" : "default"} value={facets.flagged} />
      </section>

      <section className="rounded-md border border-archive-line bg-archive-surface">
        <div className="border-b border-archive-line px-4 py-3">
          <form className="flex flex-wrap items-center gap-2 text-sm" method="get">
            {REVIEW_FILTERS.map((filter) => (
              <FilterChip
                active={review === filter.id}
                count={filter.id === "all" ? all.length : facets.byReview[filter.id as DraftReviewStatus]}
                href={buildHref({ review: filter.id === "all" ? undefined : filter.id, era, access, q: params.q })}
                key={filter.id}
                label={filter.label}
              />
            ))}
            <span className="mx-1 h-5 w-px bg-archive-line" />
            <FilterChip active={!era} count={all.length} href={buildHref({ review, access, q: params.q })} label="All eras" />
            {ERA_ORDER.filter((name) => facets.byEra[name]).map((name) => (
              <FilterChip
                active={era === name}
                count={facets.byEra[name] ?? 0}
                href={buildHref({ review, era: name, access, q: params.q })}
                key={name}
                label={name}
              />
            ))}
            <span className="mx-1 h-5 w-px bg-archive-line" />
            {["hosted", "external", "metadata_only"].filter((name) => facets.byAccess[name]).map((name) => (
              <FilterChip
                active={access === name}
                count={facets.byAccess[name] ?? 0}
                href={buildHref({ review, era, access: access === name ? undefined : name, q: params.q })}
                key={name}
                label={name.replace("_", " ")}
              />
            ))}
            <label className="ml-auto flex items-center gap-2">
              <span className="sr-only">Search drafts</span>
              <input
                className="focus-ring h-8 w-56 rounded-md border border-archive-line bg-archive-paper px-2 text-sm"
                defaultValue={params.q ?? ""}
                name="q"
                placeholder="Search title, author, substance"
                type="search"
              />
            </label>
            {review !== "all" && <input name="review" type="hidden" value={review} />}
            {era && <input name="era" type="hidden" value={era} />}
            {access && <input name="access" type="hidden" value={access} />}
          </form>
        </div>

        {!drafts.length && (
          <p className="px-4 py-8 text-sm text-archive-muted">
            {all.length ? "No drafts match these filters." : "No drafts staged yet."}
          </p>
        )}

        <div className="divide-y divide-archive-line">
          {ERA_ORDER.filter((name) => byEra[name]?.length).map((name) => (
            <div key={name}>
              <div className="bg-archive-lavender2 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">
                {name} ({byEra[name]!.length})
              </div>
              {byEra[name]!.map((draft) => <DraftRow draft={draft} key={draft.slug} />)}
            </div>
          ))}
        </div>
      </section>

      {facets.substances.length > 0 && (
        <section className="rounded-md border border-archive-line bg-archive-surface p-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Substance coverage across drafts</h3>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs">
            {facets.substances.map((item) => (
              <li className="rounded-full border border-archive-line bg-archive-paper px-2.5 py-1" key={item.name}>
                {item.name} <span className="text-archive-muted">{item.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function DraftRow({ draft }: { draft: DraftSourceRecord }) {
  const status = reviewStatusOf(draft);
  return (
    <article className="p-4 hover:bg-archive-lavender2/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <DraftReviewBadge status={status} />
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold leading-6">
            <Link className="focus-ring rounded hover:text-archive-violetDark" href={`/admin/drafts/${draft.slug}`}>
              {draft.title}
            </Link>
          </h4>
          <p className="mt-0.5 text-sm text-archive-muted">
            {draft.author} · {draft.displayDate} · {draft.region} · {draft.type}
          </p>
          <p className="mt-2 text-sm leading-6">{draft.summary}</p>
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-archive-muted">
            <Meta label="Access">{draft.accessType.replace("_", " ")}</Meta>
            <Meta label="Text">{draft.transcriptWords ? `${draft.transcriptWords.toLocaleString()} words` : "none"}</Meta>
            <Meta label="Confidence">{draft.draft?.textQuality?.confidence ?? "—"}</Meta>
            {draft.draft?.importedOn ? <Meta label="In archive">imported {draft.draft.importedOn}</Meta> : null}
            <Meta label="OCR pass">{draft.draft?.textQuality?.ocrPass ?? "—"}</Meta>
            {draft.substances?.length ? <Meta label="Substances">{draft.substances.join(", ")}</Meta> : null}
          </dl>
          {draft.issues.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-yellow-900">
              {draft.issues.map((issue) => (
                <li className="flex items-start gap-1.5" key={issue}>
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2">
          <Link
            className="focus-ring inline-flex h-9 items-center justify-center rounded-md border border-archive-violet bg-archive-violet px-3 text-xs font-semibold text-white hover:bg-archive-violetDark"
            href={`/admin/drafts/${draft.slug}`}
          >
            Review
          </Link>
          <a
            className="focus-ring inline-flex h-9 items-center justify-center gap-1 rounded-md border border-archive-line px-3 text-xs font-semibold hover:bg-archive-lavender2"
            href={draft.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Source <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

function Meta({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex gap-1">
      <dt className="font-bold uppercase tracking-[0.08em] text-archive-ink/70">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function FilterChip({ active, count, href, label }: { active: boolean; count: number; href: string; label: string }) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`focus-ring inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-semibold ${
        active ? "border-archive-violet bg-archive-violet text-white" : "border-archive-line bg-archive-paper hover:bg-archive-lavender2"
      }`}
      href={href}
    >
      <span className="capitalize">{label}</span>
      <span className={`rounded-full px-1.5 py-0.5 text-[0.68rem] ${active ? "bg-white/20" : "bg-archive-lavender2 text-archive-muted"}`}>
        {count.toLocaleString()}
      </span>
    </Link>
  );
}

function SummaryCard({ icon, label, tone = "default", value }: { icon: React.ReactNode; label: string; tone?: "default" | "good" | "high"; value: number }) {
  const toneClass = tone === "high" ? "border-red-200 bg-red-50" : tone === "good" ? "border-green-200 bg-green-50" : "border-archive-line bg-archive-surface";
  return (
    <div className={`rounded-md border p-4 ${toneClass}`}>
      <div className="flex items-center gap-2 text-archive-violet">{icon}</div>
      <div className="mt-2 text-2xl font-semibold">{value.toLocaleString()}</div>
      <div className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</div>
    </div>
  );
}

function groupByEra(drafts: DraftSourceRecord[]) {
  return drafts.reduce<Record<string, DraftSourceRecord[]>>((groups, draft) => {
    groups[draft.era] = [...(groups[draft.era] ?? []), draft];
    return groups;
  }, {});
}

function buildHref(params: { review?: string; era?: string; access?: string; q?: string }) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "all") search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `/admin/drafts?${qs}` : "/admin/drafts";
}
