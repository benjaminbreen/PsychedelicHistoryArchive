import { AlertTriangle, BookOpen, CheckCircle2, ExternalLink, FileText, Library, ListChecks, Search, UserRound } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { getAdminWorkbenchData, type BiographyStubCandidate, type WorkbenchSeverity, type WorkbenchTask, type WorkbenchTrack } from "@/lib/admin-workbench";

export const dynamic = "force-dynamic";

export default async function AdminWorkbenchPage() {
  const data = await getAdminWorkbenchData();
  const biographyQueue = data.biographyCandidates.filter((candidate) => candidate.status === "metadata_stub").slice(0, 12);
  const tasksByTrack = groupBy(data.tasks, (task) => task.track);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-archive-violet">Editorial operations</p>
          <h2 className="mt-1 text-2xl font-semibold">Workbench</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-archive-muted">
            Review queues for source cleanup, missing biography stubs, bibliography maintenance, and citation-linking follow-up.
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2 text-xs font-semibold">
          <Link className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 hover:bg-archive-lavender2" href="/admin/qa">
            <ListChecks className="h-4 w-4" />
            QA dashboard
          </Link>
          <Link className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 hover:bg-archive-lavender2" href="/people">
            <ExternalLink className="h-4 w-4" />
            Public people
          </Link>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard icon={<ListChecks className="h-5 w-5" />} label="Open Tasks" value={data.metrics.totalTasks} />
        <MetricCard icon={<AlertTriangle className="h-5 w-5" />} label="High Priority" tone={data.metrics.highTasks > 0 ? "high" : "default"} value={data.metrics.highTasks} />
        <MetricCard icon={<UserRound className="h-5 w-5" />} label="Bio Stubs" value={data.metrics.biographyStubs} />
        <MetricCard icon={<Library className="h-5 w-5" />} label="Bibliography" value={data.metrics.bibliographyNeedsReview} />
        <MetricCard icon={<FileText className="h-5 w-5" />} label="QA Issues" value={data.metrics.qaIssues} />
        <MetricCard icon={<Search className="h-5 w-5" />} label="Citations" value={data.metrics.unresolvedCitations} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(23rem,0.85fr)]">
        <TaskQueue tasksByTrack={tasksByTrack} />
        <BiographyStubQueue candidates={biographyQueue} totalCount={data.metrics.biographyStubs} />
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  tone = "default",
  value
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "default" | "high";
  value: number;
}) {
  return (
    <div className="rounded-md border border-archive-line bg-archive-surface p-4 shadow-sm">
      <div className={`flex items-center gap-2 text-sm font-semibold ${tone === "high" ? "text-red-700" : "text-archive-violet"}`}>
        {icon}
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold">{value.toLocaleString()}</div>
    </div>
  );
}

function TaskQueue({ tasksByTrack }: { tasksByTrack: Partial<Record<WorkbenchTrack, WorkbenchTask[]>> }) {
  const tracks: Array<{ id: WorkbenchTrack; label: string; description: string }> = [
    { id: "biographies", label: "Biographies", description: "People generated from source metadata or missing profile details." },
    { id: "source_qa", label: "Source QA", description: "File-backed source import and public-record issues." },
    { id: "citations", label: "Citation Links", description: "Unresolved inline citations from the citation QA pass." },
    { id: "bibliography", label: "Bibliography", description: "Further-reading records missing metadata, links, or notes." },
  ];

  return (
    <section className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-sm">
      <div className="border-b border-archive-line px-4 py-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-archive-violet" />
          <h3 className="font-semibold">Action Queue</h3>
        </div>
        <p className="mt-1 text-sm text-archive-muted">Ordered by priority. Primary actions open the relevant editor.</p>
      </div>
      <div className="divide-y divide-archive-line">
        {tracks.map((track) => {
          const tasks = tasksByTrack[track.id] ?? [];
          return (
            <div key={track.id}>
              <div className="bg-archive-lavender2 px-4 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{track.label} ({tasks.length})</div>
                    <p className="mt-0.5 text-xs text-archive-muted">{track.description}</p>
                  </div>
                </div>
              </div>
              {tasks.slice(0, 8).map((task) => <TaskRow key={task.id} task={task} />)}
              {!tasks.length && (
                <div className="flex items-center gap-2 px-4 py-5 text-sm text-archive-muted">
                  <CheckCircle2 className="h-5 w-5 text-archive-violet" />
                  No current items in this queue.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TaskRow({ task }: { task: WorkbenchTask }) {
  return (
    <article className="p-4 hover:bg-archive-warm-hover/55">
      <div className="flex flex-wrap items-start gap-3">
        <SeverityBadge severity={task.severity} />
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold leading-6">{task.title}</h4>
          <p className="mt-1 text-sm leading-6 text-archive-muted">{task.description}</p>
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {task.meta.map((item) => (
              <div className="flex gap-1" key={item.label}>
                <dt className="font-bold uppercase tracking-[0.08em] text-archive-ink/75">{item.label}</dt>
                <dd className="text-archive-muted">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex shrink-0 gap-2">
          {task.secondaryHref && (
            <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href={task.secondaryHref} title="Open related view">
              <BookOpen className="h-4 w-4" />
            </Link>
          )}
          <Link className="focus-ring inline-flex h-9 items-center justify-center rounded-md border border-archive-line px-3 text-xs font-semibold hover:bg-archive-lavender2" href={task.href} title="Open editor">
            Edit
          </Link>
        </div>
      </div>
    </article>
  );
}

function BiographyStubQueue({ candidates, totalCount }: { candidates: BiographyStubCandidate[]; totalCount: number }) {
  return (
    <section className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-sm">
      <div className="border-b border-archive-line px-4 py-3">
        <div className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-archive-violet" />
          <h3 className="font-semibold">Biography Stub Queue</h3>
        </div>
        <p className="mt-1 text-sm text-archive-muted">
          Source-linked people without full editorial profiles. Showing {candidates.length.toLocaleString()} of {totalCount.toLocaleString()}.
        </p>
      </div>
      <div className="divide-y divide-archive-line">
        {candidates.map((candidate) => (
          <article className="p-4 hover:bg-archive-warm-hover/55" key={candidate.slug}>
            <div className="flex items-start gap-3">
              <SeverityBadge severity={candidate.priority} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold">{candidate.name}</h4>
                  <span className="rounded-full border border-archive-line bg-archive-lavender2 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-archive-muted">
                    Metadata stub
                  </span>
                </div>
                <p className="mt-1 text-sm text-archive-muted">
                  {candidate.sourceCount} linked {candidate.sourceCount === 1 ? "source" : "sources"} · {candidate.years}
                </p>
                <p className="mt-2 text-sm leading-6 text-archive-muted">
                  Needs: {candidate.needs.join(", ") || "Review"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <Link className="focus-ring rounded border border-archive-violet bg-archive-violet px-2 py-1 text-white hover:bg-archive-violetDark" href={`/admin/biographies/new?name=${encodeURIComponent(candidate.name)}&slug=${encodeURIComponent(candidate.slug)}&years=${encodeURIComponent(candidate.years)}`}>
                    Create bio
                  </Link>
                  <Link className="focus-ring rounded border border-archive-line px-2 py-1 hover:bg-archive-lavender2" href={`/biographies/${candidate.slug}`}>
                    Public stub
                  </Link>
                  <Link className="focus-ring rounded border border-archive-line px-2 py-1 hover:bg-archive-lavender2" href={`/archive?people=${encodeURIComponent(candidate.name)}`}>
                    Sources
                  </Link>
                  <a className="focus-ring rounded border border-archive-line px-2 py-1 hover:bg-archive-lavender2" href={candidate.wikipediaSearchUrl} rel="noreferrer" target="_blank">
                    Wikipedia search
                  </a>
                  <a className="focus-ring rounded border border-archive-line px-2 py-1 hover:bg-archive-lavender2" href={candidate.wikidataSearchUrl} rel="noreferrer" target="_blank">
                    Wikidata search
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
        {!candidates.length && (
          <div className="flex items-center gap-2 p-5 text-sm text-archive-muted">
            <CheckCircle2 className="h-5 w-5 text-archive-violet" />
            Every source-linked person currently has a full profile.
          </div>
        )}
      </div>
    </section>
  );
}

function SeverityBadge({ severity }: { severity: WorkbenchSeverity }) {
  const className = severity === "high"
    ? "border-red-200 bg-red-50 text-red-800"
    : severity === "medium"
      ? "border-yellow-200 bg-archive-warning text-yellow-900"
      : "border-archive-line bg-archive-lavender2 text-archive-muted";

  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] ${className}`}>
      {severity}
    </span>
  );
}

function groupBy<T, K extends string>(items: T[], getKey: (item: T) => K) {
  return items.reduce<Partial<Record<K, T[]>>>((groups, item) => {
    const key = getKey(item);
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});
}
