import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save, Trash2 } from "lucide-react";
import { addSourceToCollection, removeSourceFromCollection, updateCollectionMetadata } from "@/app/admin/actions";
import { getAdminCollection, isAdminWritable, listAdminSources } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

type AdminCollectionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCollectionPage({ params }: AdminCollectionPageProps) {
  const { id } = await params;
  const [collection, sources] = await Promise.all([
    getAdminCollection(id),
    listAdminSources()
  ]);
  if (!collection) notFound();

  const items = [...(collection.collection_documents ?? [])].sort((a, b) => (a.sequence_number ?? a.position ?? 0) - (b.sequence_number ?? b.position ?? 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm font-semibold hover:bg-archive-lavender2" href="/admin/collections">
          <ArrowLeft className="h-4 w-4" />
          Collections
        </Link>
        {collection.status === "published" && (
          <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm font-semibold hover:bg-archive-lavender2" href={`/collections/${collection.slug}`}>
            <ExternalLink className="h-4 w-4" />
            Public page
          </Link>
        )}
        <div className="ml-auto text-sm text-archive-muted">
          {isAdminWritable ? "Local write mode" : "Read-only until service role env is configured"}
        </div>
      </div>

      <header className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-archive-violet">{collection.status || "draft"}</p>
        <h2 className="mt-2 text-2xl font-semibold">{collection.title}</h2>
        <p className="mt-1 font-mono text-xs text-archive-muted">{collection.id} · {collection.slug}</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="space-y-6">
          <form action={updateCollectionMetadata} className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
            <input name="id" type="hidden" value={collection.id} />
            <h3 className="text-lg font-semibold">Collection Card And Visibility</h3>
            <p className="mt-1 text-sm text-archive-muted">
              Draft collections stay editable in admin but are excluded from public collection listings and public collection pages.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextField label="Title" name="title" required value={collection.title} />
              <SelectField label="Public status" name="status" options={STATUSES} value={collection.status || "draft"} />
              <TextField label="Subtitle" name="subtitle" value={collection.subtitle} />
              <TextField label="Cover image path" name="cover_image_path" value={collection.cover_image_path} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextAreaField label="Summary" name="summary" rows={5} value={collection.summary} />
              <TextAreaField label="Body" name="body" rows={5} value={collection.body} />
            </div>
            <TextField label="Change note" name="change_note" value="" />
            <div className="mt-5 flex justify-end">
              <SaveButton label="Save collection" />
            </div>
          </form>

          <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Collection Items</h3>
            <p className="mt-1 text-sm text-archive-muted">These items drive the public collection overview ordering.</p>
            <div className="mt-5 space-y-4">
              {items.length ? items.map((item) => (
                <form action={addSourceToCollection} className="rounded-md border border-archive-line bg-archive-paper p-4" key={`${item.collection_id}-${item.document_id}`}>
                  <input name="collection_id" type="hidden" value={collection.id} />
                  <input name="document_id" type="hidden" value={item.document_id} />
                  <input name="slug" type="hidden" value={item.document?.slug || ""} />
                  <div className="flex flex-wrap items-start gap-3 border-b border-archive-line pb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.document?.title || item.document_id}</p>
                      <p className="mt-1 font-mono text-xs text-archive-muted">{item.document?.slug || item.document_id} · {item.document?.status || "draft"}</p>
                    </div>
                    <button className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50" formAction={removeSourceFromCollection} type="submit">
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <TextField label="Position" name="position" type="number" value={item.position?.toString()} />
                    <TextField label="Sequence no." name="sequence_number" type="number" value={item.sequence_number?.toString()} />
                    <TextField label="Sequence label" name="sequence_label" value={item.sequence_label} />
                    <TextField label="Issue date" name="issue_date" value={item.issue_date} />
                  </div>
                  <TextAreaField label="Editorial caption" name="editorial_caption" rows={2} value={item.editorial_caption} />
                  <div className="mt-4 flex justify-end">
                    <SaveButton label="Save item" />
                  </div>
                </form>
              )) : (
                <div className="rounded-md border border-dashed border-archive-line p-5 text-sm text-archive-muted">
                  No source records are attached to this collection yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
            <h3 className="font-semibold">Add Source</h3>
            <form action={addSourceToCollection} className="mt-4 space-y-3">
              <input name="collection_id" type="hidden" value={collection.id} />
              <input name="slug" type="hidden" value="" />
              <SelectObjectField label="Source" name="document_id" options={sources.map((source) => ({ label: `${source.title} (${source.status || "draft"})`, value: source.id }))} />
              <TextField label="Position" name="position" type="number" value="" />
              <TextField label="Sequence label" name="sequence_label" value="" />
              <SaveButton label="Add source" />
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}

function TextField({ label, name, required, type = "text", value }: { label: string; name: string; required?: boolean; type?: string; value?: string | null }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <input className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" defaultValue={value ?? ""} name={name} required={required} type={type} />
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
      <select className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" defaultValue={value ?? ""} name={name}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function SelectObjectField({ label, name, options }: { label: string; name: string; options: Array<{ label: string; value: string }> }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <select className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" name={name} required>
        <option value="">Choose...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
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
