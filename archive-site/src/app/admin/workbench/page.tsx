import { AlertTriangle, CheckCircle2, FilePlus2, Inbox, ListChecks, Search, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { getAdminWorkbenchData, type WorkbenchSeverity, type WorkbenchTask, type WorkbenchTrack } from "@/lib/admin-workbench";

export const dynamic = "force-dynamic";

type ActiveTrack = WorkbenchTrack | "all";

type AdminWorkbenchPageProps = {
  searchParams: Promise<{ track?: string }>;
};

const TRACKS: Array<{ id: WorkbenchTrack; label: string; description: string }> = [
  { id: "biographies", label: "Biographies", description: "People generated from source metadata or missing profile details." },
  { id: "source_qa", label: "Sources", description: "File-backed source import and public-record issues." },
  { id: "citations", label: "Citations", description: "Unresolved inline citations from the citation QA pass." },
  { id: "bibliography", label: "Bibliography", description: "Further-reading records missing metadata, links, or notes." },
];

export default async function AdminWorkbenchPage({ searchParams }: AdminWorkbenchPageProps) {
  const params = await searchParams;
  const data = await getAdminWorkbenchData();
  const activeTrack = normalizeTrack(params.track);
  const visibleTasks = activeTrack === "all" ? data.tasks : data.tasks.filter((task) => task.track === activeTrack);
  const tasksByTrack = groupBy(visibleTasks, (task) => task.track);
  const trackCounts = countTasksByTrack(data.tasks);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-archive-violet">Editorial operations</p>
          <h2 className="mt-1 text-2xl font-semibold">Workbench</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-archive-muted">
            A focused editorial queue for source cleanup, missing biographies, bibliography maintenance, and citation-linking follow-up.
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2 text-xs font-semibold">
          <Link className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-archive-violet bg-archive-violet px-3 text-white hover:bg-archive-violetDark" href="/admin/sources/new">
            <FilePlus2 className="h-4 w-4" />
            New source
          </Link>
          <Link className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-archive-violet bg-archive-violet px-3 text-white hover:bg-archive-violetDark" href="/admin/biographies/new">
            <UserPlus className="h-4 w-4" />
            New biography
          </Link>
          <Link className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 hover:bg-archive-lavender2" href="/admin/drafts">
            <Inbox className="h-4 w-4" />
            Proposed sources
          </Link>
          <Link className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 hover:bg-archive-lavender2" href="/admin/qa">
            <ListChecks className="h-4 w-4" />
            QA dashboard
          </Link>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<ListChecks className="h-5 w-5" />} label="Open Tasks" value={data.metrics.totalTasks} />
        <MetricCard icon={<AlertTriangle className="h-5 w-5" />} label="High Priority" tone={data.metrics.highTasks > 0 ? "high" : "default"} value={data.metrics.highTasks} />
        <MetricCard icon={<UserRound className="h-5 w-5" />} label="Bio Stubs" value={data.metrics.biographyStubs} />
        <MetricCard icon={<Search className="h-5 w-5" />} label="Citations" value={data.metrics.unresolvedCitations} />
      </section>

      <TaskQueue activeTrack={activeTrack} taskCounts={trackCounts} tasksByTrack={tasksByTrack} totalCount={data.metrics.totalTasks} />
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

function TaskQueue({
  activeTrack,
  taskCounts,
  tasksByTrack,
  totalCount,
}: {
  activeTrack: ActiveTrack;
  taskCounts: Record<WorkbenchTrack, number>;
  tasksByTrack: Partial<Record<WorkbenchTrack, WorkbenchTask[]>>;
  totalCount: number;
}) {
  const tracks = TRACKS.filter((track) => activeTrack === "all" || track.id === activeTrack);
  const rowLimit = activeTrack === "all" ? 8 : 25;

  return (
    <section className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-sm">
      <div className="border-b border-archive-line px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-archive-violet" />
              <h3 className="font-semibold">Action Queue</h3>
            </div>
            <p className="mt-1 text-sm text-archive-muted">Primary actions open the relevant editor. Supporting links live inside each row.</p>
          </div>
          <nav aria-label="Workbench queue filters" className="flex flex-wrap gap-2 text-xs font-semibold">
            <QueueFilter active={activeTrack === "all"} count={totalCount} href="/admin/workbench" label="All" />
            {TRACKS.map((track) => (
              <QueueFilter
                active={activeTrack === track.id}
                count={taskCounts[track.id]}
                href={`/admin/workbench?track=${track.id}`}
                key={track.id}
                label={track.label}
              />
            ))}
          </nav>
        </div>
      </div>
      <div className="divide-y divide-archive-line">
        {tracks.map((track) => {
          const tasks = tasksByTrack[track.id] ?? [];
          const visibleRows = tasks.slice(0, rowLimit);
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
              {visibleRows.map((task) => <TaskRow key={task.id} task={task} />)}
              {tasks.length > visibleRows.length && (
                <div className="px-4 py-3 text-sm text-archive-muted">
                  Showing {visibleRows.length.toLocaleString()} of {tasks.length.toLocaleString()} items in this queue.
                </div>
              )}
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

function QueueFilter({ active, count, href, label }: { active: boolean; count: number; href: string; label: string }) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`focus-ring inline-flex h-8 items-center gap-2 rounded-md border px-3 ${
        active
          ? "border-archive-violet bg-archive-violet text-white"
          : "border-archive-line bg-archive-surface text-archive-ink hover:bg-archive-lavender2"
      }`}
      href={href}
    >
      <span>{label}</span>
      <span className={`rounded-full px-1.5 py-0.5 text-[0.68rem] ${active ? "bg-white/20" : "bg-archive-lavender2 text-archive-muted"}`}>
        {count.toLocaleString()}
      </span>
    </Link>
  );
}

function TaskRow({ task }: { task: WorkbenchTask }) {
  return (
    <article className="p-4 hover:bg-archive-warm-hover/55">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <SeverityBadge severity={task.severity} />
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold leading-6">{task.title}</h4>
          <p className="mt-1 text-sm leading-6 text-archive-muted">{task.description}</p>
          <details className="group mt-3">
            <summary className="cursor-pointer text-xs font-semibold text-archive-violet hover:text-archive-violetDark">
              Details and links
            </summary>
            <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {task.meta.map((item) => (
                <div className="flex gap-1" key={item.label}>
                  <dt className="font-bold uppercase tracking-[0.08em] text-archive-ink/75">{item.label}</dt>
                  <dd className="text-archive-muted">{item.value}</dd>
                </div>
              ))}
            </dl>
            {task.links?.length ? (
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                {task.links.map((link) => link.external ? (
                  <a className="focus-ring rounded border border-archive-line px-2 py-1 hover:bg-archive-lavender2" href={link.href} key={link.href} rel="noreferrer" target="_blank">
                    {link.label}
                  </a>
                ) : (
                  <Link className="focus-ring rounded border border-archive-line px-2 py-1 hover:bg-archive-lavender2" href={link.href} key={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </details>
        </div>
        <Link className="focus-ring inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-archive-violet bg-archive-violet px-3 text-xs font-semibold text-white hover:bg-archive-violetDark" href={task.href}>
          {primaryActionLabel(task)}
        </Link>
      </div>
    </article>
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

function primaryActionLabel(task: WorkbenchTask) {
  if (task.track === "biographies") return task.title.startsWith("Create biography") ? "Create bio" : "Edit bio";
  if (task.track === "source_qa") return "Edit source";
  if (task.track === "citations") return "Review citations";
  return "Edit item";
}

function groupBy<T, K extends string>(items: T[], getKey: (item: T) => K) {
  return items.reduce<Partial<Record<K, T[]>>>((groups, item) => {
    const key = getKey(item);
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});
}

function normalizeTrack(track: string | undefined): ActiveTrack {
  return TRACKS.some((item) => item.id === track) ? track as WorkbenchTrack : "all";
}

function countTasksByTrack(tasks: WorkbenchTask[]): Record<WorkbenchTrack, number> {
  return {
    biographies: tasks.filter((task) => task.track === "biographies").length,
    bibliography: tasks.filter((task) => task.track === "bibliography").length,
    citations: tasks.filter((task) => task.track === "citations").length,
    source_qa: tasks.filter((task) => task.track === "source_qa").length,
  };
}
