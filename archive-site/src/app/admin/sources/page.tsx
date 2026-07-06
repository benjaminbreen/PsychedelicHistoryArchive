import { AlertTriangle, ExternalLink, FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { isAdminWritable, listAdminSources } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

type AdminSourcesPageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function AdminSourcesPage({ searchParams }: AdminSourcesPageProps) {
  const params = await searchParams;
  const sources = filterSources(await listAdminSources(), params);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Sources</h2>
          <p className="mt-1 text-sm text-archive-muted">
            Edit source metadata, reader settings, and curated Markdown sections.
          </p>
        </div>
        <Link className="focus-ring ml-auto inline-flex h-10 items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 text-sm font-semibold hover:bg-archive-lavender2" href="/admin/sources/new">
          <Plus className="h-4 w-4" />
          New source
        </Link>
      </div>

      {!isAdminWritable && (
        <SetupNotice />
      )}

      <form className="grid gap-3 rounded-md border border-archive-line bg-archive-surface p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem_auto]">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Search</span>
          <span className="mt-1 flex h-10 items-center gap-2 rounded-md border border-archive-line bg-white px-3">
            <Search className="h-4 w-4 text-archive-muted" />
            <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" defaultValue={params.q ?? ""} name="q" placeholder="Title, slug, type, date..." />
          </span>
        </label>
        <SelectField label="Status" name="status" options={["", "draft", "published", "archived"]} value={params.status ?? ""} />
        <button className="focus-ring mt-6 h-10 rounded-md border border-archive-line px-4 text-sm font-semibold hover:bg-archive-lavender2" type="submit">
          Filter
        </button>
      </form>

      <div className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-archive-lavender2 text-xs uppercase tracking-[0.08em] text-archive-muted">
            <tr>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reader</th>
              <th className="px-4 py-3">Sections</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr className="border-t border-archive-line align-top hover:bg-archive-warm-hover/55" key={source.id}>
                <td className="max-w-[28rem] px-4 py-3">
                  <Link className="font-semibold text-archive-ink hover:text-archive-violet" href={`/admin/sources/${source.id}`}>
                    {source.title}
                  </Link>
                  <div className="mt-1 font-mono text-xs text-archive-muted">{source.slug}</div>
                </td>
                <td className="px-4 py-3 text-archive-muted">
                  <div>{source.document_type || "Source"}</div>
                  <div className="mt-1 text-xs">{source.medium || "Text"}</div>
                </td>
                <td className="px-4 py-3">{source.display_date || "Undated"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={source.status} />
                </td>
                <td className="px-4 py-3 text-archive-muted">
                  {source.reader_mode || (source.media_embed_url ? "media embed" : "auto")}
                </td>
                <td className="px-4 py-3">{source.document_sections?.length ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href={`/admin/sources/${source.id}`} title="Edit">
                      <FileText className="h-4 w-4" />
                    </Link>
                    <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href={`/archive/${source.slug}`} title="Open public source">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!sources.length && (
          <div className="border-t border-archive-line p-6 text-sm text-archive-muted">
            No sources loaded. Check Supabase environment variables for the local admin server.
          </div>
        )}
      </div>
    </div>
  );
}

function SetupNotice() {
  return (
    <section className="flex gap-3 rounded-md border border-archive-line bg-archive-warning/40 p-4 text-sm leading-6">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-archive-violet" />
      <div>
        <p className="font-semibold">Admin writes are not configured.</p>
        <p className="text-archive-muted">
          Add server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` values to the local environment before editing. The service role key must not be exposed with a `NEXT_PUBLIC_` prefix.
        </p>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const label = status || "draft";
  return (
    <span className="inline-flex rounded-full border border-archive-line bg-archive-paper px-2.5 py-1 text-xs font-semibold capitalize">
      {label.replaceAll("_", " ")}
    </span>
  );
}

function SelectField({ label, name, options, value }: { label: string; name: string; options: string[]; value?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <select className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" defaultValue={value ?? ""} name={name}>
        {options.map((option) => <option key={option || "all"} value={option}>{option || "All"}</option>)}
      </select>
    </label>
  );
}

function filterSources<T extends { title: string; slug: string; document_type: string | null; medium: string | null; display_date: string | null; status: string | null }>(sources: T[], params: { q?: string; status?: string }) {
  const q = params.q?.trim().toLowerCase();
  const status = params.status?.trim();
  return sources.filter((source) => {
    const matchesStatus = !status || (source.status || "draft") === status;
    if (!matchesStatus) return false;
    if (!q) return true;
    return [source.title, source.slug, source.document_type, source.medium, source.display_date]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(q));
  });
}
