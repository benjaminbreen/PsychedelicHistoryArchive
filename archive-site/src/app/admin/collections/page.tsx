import { ExternalLink, FileText, Save } from "lucide-react";
import Link from "next/link";
import { createCollection } from "@/app/admin/actions";
import { isAdminWritable, listAdminCollections } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await listAdminCollections();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="space-y-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Collections</h2>
            <p className="mt-1 text-sm text-archive-muted">
              Publish, draft, and organize collection cards and collection source membership.
            </p>
          </div>
          <div className="ml-auto text-sm text-archive-muted">
            {isAdminWritable ? "Local write mode" : "Read-only until service role env is configured"}
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-archive-lavender2 text-xs uppercase tracking-[0.08em] text-archive-muted">
            <tr>
              <th className="px-4 py-3">Collection</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr className="border-t border-archive-line align-top hover:bg-archive-warm-hover/55" key={collection.id}>
                <td className="max-w-[32rem] px-4 py-3">
                  <Link className="font-semibold text-archive-ink hover:text-archive-violet" href={`/admin/collections/${collection.id}`}>
                    {collection.title}
                  </Link>
                  <div className="mt-1 font-mono text-xs text-archive-muted">{collection.slug}</div>
                  {collection.summary && <p className="mt-2 line-clamp-2 text-xs leading-5 text-archive-muted">{collection.summary}</p>}
                </td>
                <td className="px-4 py-3"><StatusBadge status={collection.status} /></td>
                <td className="px-4 py-3">{collection.collection_documents?.length ?? 0}</td>
                <td className="px-4 py-3 text-archive-muted">{collection.updated_at || "Not recorded"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href={`/admin/collections/${collection.id}`} title="Edit">
                      <FileText className="h-4 w-4" />
                    </Link>
                    {collection.status === "published" && (
                      <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href={`/collections/${collection.slug}`} title="Open public collection">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>

          {!collections.length && (
            <div className="border-t border-archive-line p-6 text-sm text-archive-muted">
              No Supabase collections are loaded yet.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm xl:sticky xl:top-6 xl:self-start">
        <h3 className="text-lg font-semibold">Create Collection</h3>
        <p className="mt-1 text-sm text-archive-muted">
          Start as draft, attach source records, then publish the collection page.
        </p>
        <form action={createCollection} className="mt-5 space-y-4">
          <TextField label="Title" name="title" required value="" />
          <TextField label="Slug" name="slug" value="" />
          <TextField label="Subtitle" name="subtitle" value="" />
          <SelectField label="Status" name="status" options={STATUSES} value="draft" />
          <TextAreaField label="Summary" name="summary" rows={4} value="" />
          <SaveButton label="Create collection" />
        </form>
      </aside>
    </div>
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

function TextField({ label, name, required, value }: { label: string; name: string; required?: boolean; value?: string | null }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <input className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" defaultValue={value ?? ""} name={name} required={required} />
    </label>
  );
}

function TextAreaField({ label, name, rows, value }: { label: string; name: string; rows: number; value?: string | null }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <textarea className="focus-ring mt-1 w-full rounded-md border border-archive-line bg-white px-3 py-2 text-sm leading-6" defaultValue={value ?? ""} name={name} rows={rows} />
    </label>
  );
}

function SelectField({ label, name, options, value }: { label: string; name: string; options: string[]; value?: string | null }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <select className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" defaultValue={value ?? options[0]} name={name}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function SaveButton({ label }: { label: string }) {
  return (
    <button className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-archive-violet px-4 text-sm font-semibold text-white hover:bg-archive-violetDark" type="submit">
      <Save className="h-4 w-4" />
      {label}
    </button>
  );
}

const STATUSES = ["draft", "published", "archived"];
