import { AlertTriangle, BookOpen, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { createBibliographyItem } from "@/app/admin/actions";
import { isAdminWritable } from "@/lib/admin-cms";
import { listAdminBibliographyItems } from "@/lib/admin-bibliography";

export const dynamic = "force-dynamic";

export default async function AdminBibliographyPage() {
  const items = await listAdminBibliographyItems();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Bibliography</h2>
          <p className="mt-1 text-sm text-archive-muted">
            Curate secondary scholarship, citation metadata, and era relationships.
          </p>
        </div>
        <div className="ml-auto flex min-w-[18rem] items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm text-archive-muted">
          <Search className="h-4 w-4" />
          Browser find is enough for this local slice.
        </div>
      </div>

      {!isAdminWritable && <SetupNotice />}

      <form action={createBibliographyItem} className="grid gap-3 rounded-md border border-archive-line bg-archive-surface p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem_12rem_auto]">
        <TextField label="Title" name="title" required />
        <SelectField label="Type" name="item_type" options={ITEM_TYPES} />
        <SelectField label="Status" name="status" options={STATUSES} />
        <button className="focus-ring mt-6 h-10 rounded-md bg-archive-violet px-4 text-sm font-semibold text-white" type="submit">
          Create
        </button>
      </form>

      <div className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-archive-lavender2 text-xs uppercase tracking-[0.08em] text-archive-muted">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Recommendation</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-t border-archive-line align-top hover:bg-archive-warm-hover/55" key={item.id}>
                <td className="max-w-[34rem] px-4 py-3">
                  <Link className="font-semibold text-archive-ink hover:text-archive-violet" href={`/admin/bibliography/${item.id}`}>
                    {item.title}
                  </Link>
                  <div className="mt-1 font-mono text-xs text-archive-muted">{item.slug}</div>
                  {item.publication_title && <div className="mt-1 text-xs text-archive-muted">{item.publication_title}</div>}
                </td>
                <td className="px-4 py-3 text-archive-muted">{item.item_type}</td>
                <td className="px-4 py-3">{item.year || "n.d."}</td>
                <td className="px-4 py-3">{item.recommendation_status || "recommended"}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href={`/admin/bibliography/${item.id}`} title="Edit">
                      <BookOpen className="h-4 w-4" />
                    </Link>
                    <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href="/further-reading" title="Open bibliography">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!items.length && (
          <div className="border-t border-archive-line p-6 text-sm text-archive-muted">
            No bibliography table rows found. Apply `scripts/supabase_schema.sql` and seed bibliography items.
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
        <p className="text-archive-muted">Add server-only Supabase service-role environment variables before editing.</p>
      </div>
    </section>
  );
}

function TextField({ label, name, required }: { label: string; name: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <input className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-archive-paper px-3 text-sm" name={name} required={required} />
    </label>
  );
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <select className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-archive-paper px-3 text-sm" name={name}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  return (
    <span className="inline-flex rounded-full border border-archive-line bg-archive-paper px-2.5 py-1 text-xs font-semibold capitalize">
      {(status || "draft").replaceAll("_", " ")}
    </span>
  );
}

const ITEM_TYPES = ["book", "article", "chapter", "dissertation", "edited_volume", "report"];
const STATUSES = ["draft", "published", "archived"];
