import { AlertTriangle, CheckCircle2, ExternalLink, FileWarning, ListChecks, RefreshCw, Search, Wrench } from "lucide-react";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type React from "react";

export const dynamic = "force-dynamic";

type IssueSeverity = "high" | "medium" | "low";

type QaIssue = {
  severity: IssueSeverity;
  kind: string;
  track: string;
  import_dir: string;
  slug: string;
  title: string;
  field: string;
  excerpt: string;
  suggestion?: string;
};

type QaReport = {
  issues_total: number;
  issues_by_severity: Record<IssueSeverity, number>;
  issues_by_track: Record<string, number>;
  issues_by_kind: Record<string, number>;
  issues_by_import_dir: Record<string, number>;
  top_sources: Record<string, number>;
  issues: QaIssue[];
};

type CitationReport = {
  source_slug: string;
  inline_citation_count: number;
  auto_linked_count: number;
  unresolved_count: number;
  unresolved: Array<{ text: string; reason: string }>;
};

type SourceIndexEntry = {
  id: string;
  title: string;
};

const REPORT_FILES = {
  quality: ["data", "qa", "archive-quality-report.json"],
  actionable: ["data", "qa", "archive-actionable-report.json"],
  citations: ["data", "qa", "citation-link-report.json"]
};

export default async function AdminQaPage() {
  const quality = readQaReport(REPORT_FILES.quality);
  const actionable = readQaReport(REPORT_FILES.actionable);
  const citations = readCitationReport(REPORT_FILES.citations);
  const sourceIndex = buildSourceIndex();
  const generatedAt = getReportTimestamp(REPORT_FILES.quality);

  if (!quality || !actionable) {
    return (
      <div className="space-y-5">
        <PageHeader generatedAt={generatedAt} />
        <section className="rounded-md border border-archive-line bg-archive-warning/40 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-archive-violet" />
            <div>
              <h2 className="font-semibold">QA reports are not available.</h2>
              <p className="mt-1 text-sm text-archive-muted">
                Run <code className="rounded bg-archive-paper px-1.5 py-0.5">npm run qa:sources</code> from the repository root, then reload this page.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader generatedAt={generatedAt} />

      <section className="grid gap-3 md:grid-cols-4">
        <SummaryCard icon={<FileWarning className="h-5 w-5" />} label="Total Issues" value={quality.issues_total} />
        <SummaryCard icon={<AlertTriangle className="h-5 w-5" />} label="High" tone="high" value={quality.issues_by_severity.high} />
        <SummaryCard icon={<Wrench className="h-5 w-5" />} label="Editorial Cleanup" value={quality.issues_by_track.editorial_cleanup ?? 0} />
        <SummaryCard icon={<ListChecks className="h-5 w-5" />} label="Metadata Review" value={quality.issues_by_track.metadata_review ?? 0} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <ActionableQueue issues={actionable.issues} sourceIndex={sourceIndex} />
        <aside className="space-y-5">
          <CitationLinkSummary report={citations} sourceIndex={sourceIndex} />
          <ReportSummary report={quality} />
        </aside>
      </section>
    </div>
  );
}

function PageHeader({ generatedAt }: { generatedAt: string | null }) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <h2 className="text-2xl font-semibold">Source QA</h2>
        <p className="mt-1 text-sm text-archive-muted">
          File-backed dashboard for the latest archive source QA reports.
        </p>
        <p className="mt-2 text-xs text-archive-muted">
          Last generated: {generatedAt ?? "not found"}
        </p>
      </div>
      <div className="ml-auto rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm text-archive-muted">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>
            Refresh data with <code className="rounded bg-archive-paper px-1.5 py-0.5">npm run qa:sources</code> and{" "}
            <code className="rounded bg-archive-paper px-1.5 py-0.5">npm run qa:citations</code>
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone = "default"
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "default" | "high";
}) {
  return (
    <div className="rounded-md border border-archive-line bg-archive-surface p-4 shadow-sm">
      <div className={`flex items-center gap-2 text-sm font-semibold ${tone === "high" && value > 0 ? "text-red-700" : "text-archive-violet"}`}>
        {icon}
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold">{value.toLocaleString()}</div>
    </div>
  );
}

function ActionableQueue({
  issues,
  sourceIndex
}: {
  issues: QaIssue[];
  sourceIndex: Map<string, SourceIndexEntry>;
}) {
  const grouped = groupBy(issues, (issue) => issue.track);

  return (
    <section className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-sm">
      <div className="border-b border-archive-line px-4 py-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-archive-violet" />
          <h3 className="font-semibold">Actionable Queue</h3>
        </div>
        <p className="mt-1 text-sm text-archive-muted">Capped report for the next practical cleanup pass.</p>
      </div>

      <div className="divide-y divide-archive-line">
        {Object.entries(grouped).map(([track, trackIssues]) => (
          <div key={track}>
            <div className="bg-archive-lavender2 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">
              {formatLabel(track)} ({trackIssues.length})
            </div>
            {trackIssues.map((issue, index) => (
              <IssueRow issue={issue} key={`${issue.slug}-${issue.kind}-${issue.field}-${index}`} source={sourceIndex.get(issue.slug)} />
            ))}
          </div>
        ))}
        {!issues.length && (
          <div className="flex items-center gap-2 p-5 text-sm text-archive-muted">
            <CheckCircle2 className="h-5 w-5 text-archive-violet" />
            No actionable issues in the current report.
          </div>
        )}
      </div>
    </section>
  );
}

function IssueRow({ issue, source }: { issue: QaIssue; source?: SourceIndexEntry }) {
  return (
    <article className="p-4 hover:bg-archive-warm-hover/55">
      <div className="flex flex-wrap items-start gap-3">
        <SeverityBadge severity={issue.severity} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h4 className="font-semibold">{issue.title || source?.title || issue.slug}</h4>
            <code className="rounded bg-archive-paper px-1.5 py-0.5 text-xs text-archive-muted">{issue.kind}</code>
          </div>
          <div className="mt-1 font-mono text-xs text-archive-muted">{issue.slug}</div>
          <div className="mt-2 text-sm">
            <span className="font-semibold">Field:</span> <code className="rounded bg-archive-paper px-1.5 py-0.5">{issue.field}</code>
          </div>
          <p className="mt-2 text-sm leading-6 text-archive-muted">{issue.excerpt || "(blank)"}</p>
          {issue.suggestion && (
            <p className="mt-2 text-sm leading-6">
              <span className="font-semibold">Suggestion:</span> {issue.suggestion}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {source && (
            <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href={`/admin/sources/${source.id}`} title="Edit source">
              <Search className="h-4 w-4" />
            </Link>
          )}
          <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href={`/archive/${issue.slug}`} title="Open public source">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CitationLinkSummary({ report, sourceIndex }: { report: CitationReport | null; sourceIndex: Map<string, SourceIndexEntry> }) {
  const source = report ? sourceIndex.get(report.source_slug) : undefined;
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-4 shadow-sm">
      <h3 className="font-semibold">Citation Linking</h3>
      {!report ? (
        <p className="mt-2 text-sm text-archive-muted">
          Run <code className="rounded bg-archive-paper px-1.5 py-0.5">npm run qa:citations</code> to generate citation-link diagnostics.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <Metric label="Found" value={report.inline_citation_count} />
            <Metric label="Auto-linked" value={report.auto_linked_count} />
            <Metric label="Unresolved" value={report.unresolved_count} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {source && (
              <Link className="focus-ring rounded border border-archive-line px-2 py-1 font-semibold hover:bg-archive-lavender2" href={`/admin/sources/${source.id}`}>
                Edit source
              </Link>
            )}
            <Link className="focus-ring rounded border border-archive-line px-2 py-1 font-semibold hover:bg-archive-lavender2" href={`/archive/${report.source_slug}`}>
              Public source
            </Link>
          </div>
          {report.unresolved.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Needs review</div>
              {report.unresolved.slice(0, 6).map((item) => (
                <div className="rounded border border-archive-line bg-archive-paper p-2 text-xs" key={`${item.text}-${item.reason}`}>
                  <code>{item.text}</code>
                  <div className="mt-1 text-archive-muted">{formatLabel(item.reason)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-archive-line bg-archive-paper p-2">
      <div className="font-mono text-lg font-semibold">{value.toLocaleString()}</div>
      <div className="text-xs text-archive-muted">{label}</div>
    </div>
  );
}

function ReportSummary({ report }: { report: QaReport }) {
  return (
    <>
      <SummaryList title="Issue Kinds" values={report.issues_by_kind} />
      <SummaryList title="Top Sources" values={report.top_sources} />
      <SummaryList title="Import Dirs" values={report.issues_by_import_dir} />
    </>
  );
}

function SummaryList({ title, values }: { title: string; values: Record<string, number> }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-4 shadow-sm">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-3 space-y-2">
        {Object.entries(values).slice(0, 10).map(([label, value]) => (
          <div className="flex gap-3 text-sm" key={label}>
            <div className="min-w-0 flex-1 truncate text-archive-muted">{label}</div>
            <div className="font-mono font-semibold">{value.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  const classes = {
    high: "border-red-200 bg-red-50 text-red-700",
    medium: "border-amber-200 bg-amber-50 text-amber-800",
    low: "border-archive-line bg-archive-paper text-archive-muted"
  }[severity];

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${classes}`}>
      {severity}
    </span>
  );
}

function readQaReport(parts: string[]): QaReport | null {
  const filePath = repoPath(...parts);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as QaReport;
}

function readCitationReport(parts: string[]): CitationReport | null {
  const filePath = repoPath(...parts);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as CitationReport;
}

function getReportTimestamp(parts: string[]): string | null {
  const filePath = repoPath(...parts);
  if (!fs.existsSync(filePath)) return null;
  return fs.statSync(filePath).mtime.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function buildSourceIndex(): Map<string, SourceIndexEntry> {
  const index = new Map<string, SourceIndexEntry>();
  const dataDir = repoPath("data");
  if (!fs.existsSync(dataDir)) return index;

  for (const entry of fs.readdirSync(dataDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.endsWith("-import")) continue;
    const documentsPath = path.join(dataDir, entry.name, "documents.json");
    if (!fs.existsSync(documentsPath)) continue;
    const documents = JSON.parse(fs.readFileSync(documentsPath, "utf8")) as Array<{ id?: string; slug?: string; title?: string }>;
    for (const document of documents) {
      if (document.slug && document.id) {
        index.set(document.slug, { id: document.id, title: document.title ?? document.slug });
      }
    }
  }

  return index;
}

function repoPath(...parts: string[]) {
  const cwd = process.cwd();
  const root = path.basename(cwd) === "archive-site" ? path.resolve(cwd, "..") : cwd;
  return path.join(root, ...parts);
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = getKey(item);
    groups[key] = groups[key] ?? [];
    groups[key].push(item);
    return groups;
  }, {});
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}
