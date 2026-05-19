import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { addSourceToTopic, removeSourceFromTopic, updateTopicMetadata } from "@/app/admin/actions";
import { getAdminTopic, isAdminWritable, listAdminSources, type AdminSourceListItem, type AdminTopic, type AdminTopicDocument } from "@/lib/admin-cms";
import { MarkdownContent } from "@/components/markdown-content";

export const dynamic = "force-dynamic";

type AdminTopicPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminTopicPage({ params }: AdminTopicPageProps) {
  const { id } = await params;
  const [topic, sources] = await Promise.all([
    getAdminTopic(id),
    listAdminSources()
  ]);

  if (!topic) notFound();

  const memberships = [...(topic.topic_documents ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const attachedIds = new Set(memberships.map((membership) => membership.document_id));
  const availableSources = sources.filter((source) => !attachedIds.has(source.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm font-semibold hover:bg-archive-lavender2" href="/admin/topics">
          <ArrowLeft className="h-4 w-4" />
          Topics
        </Link>
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm font-semibold hover:bg-archive-lavender2" href={`/topics/${topic.slug}`}>
          <ExternalLink className="h-4 w-4" />
          Public page
        </Link>
        <div className="ml-auto text-sm text-archive-muted">
          {isAdminWritable ? "Local write mode" : "Read-only until service role env is configured"}
        </div>
      </div>

      <header className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-archive-violet">Curated Topic</p>
        <h2 className="mt-2 text-2xl font-semibold">{topic.name}</h2>
        <p className="mt-1 font-mono text-xs text-archive-muted">{topic.id} · /topics/{topic.slug}</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-6">
          <TopicMetadataForm topic={topic} />
          <TopicSourceMemberships sources={availableSources} topic={topic} memberships={memberships} />
        </div>
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <TopicPreview topic={topic} memberships={memberships} />
          <TopicHealthPanel topic={topic} memberships={memberships} />
        </aside>
      </div>
    </div>
  );
}

function TopicMetadataForm({ topic }: { topic: AdminTopic }) {
  return (
    <form action={updateTopicMetadata} className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <input name="id" type="hidden" value={topic.id} />
      <h3 className="text-lg font-semibold">Editorial Topic Page</h3>
      <p className="mt-1 text-sm text-archive-muted">
        Markdown body and SEO fields publish to the public topic page when status is published.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TextField label="Name" name="name" required value={topic.name} />
        <TextField label="Slug" name="slug" required value={topic.slug} />
        <TextField label="Icon" name="icon" value={topic.icon} />
        <TextField label="Sort order" name="sort_order" type="number" value={topic.sort_order?.toString()} />
        <TextField label="SEO title" name="seo_title" value={topic.seo_title} />
        <SelectField label="Status" name="status" options={STATUSES} value={topic.status || "draft"} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextAreaField label="Dek" name="dek" rows={4} value={topic.dek} />
        <TextAreaField label="SEO description" name="seo_description" rows={4} value={topic.seo_description} />
      </div>

      <div className="mt-4">
        <TextAreaField label="Body Markdown" name="body_markdown" rows={16} value={topic.body_markdown} />
      </div>

      <TextField label="Change note" name="change_note" value="" />

      <div className="mt-5 flex justify-end">
        <SaveButton label="Save topic" />
      </div>
    </form>
  );
}

function TopicSourceMemberships({ memberships, sources, topic }: { memberships: AdminTopicDocument[]; sources: AdminSourceListItem[]; topic: AdminTopic }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Sources In This Topic</h3>
      <p className="mt-1 text-sm text-archive-muted">
        Use position for display order. Featured sources appear first on the public topic page.
      </p>

      <div className="mt-5 space-y-3">
        {memberships.length ? memberships.map((membership) => (
          <form action={addSourceToTopic} className="rounded-md border border-archive-line bg-archive-paper p-4" key={membership.document_id}>
            <input name="topic_id" type="hidden" value={topic.id} />
            <input name="topic_slug" type="hidden" value={topic.slug} />
            <input name="document_id" type="hidden" value={membership.document_id} />
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{membership.document?.title || membership.document_id}</p>
                <p className="mt-0.5 font-mono text-xs text-archive-muted">{membership.document?.status || "draft"} · {membership.document?.slug || membership.document_id}</p>
              </div>
              <button className="focus-ring rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700" formAction={removeSourceFromTopic} type="submit">
                Remove
              </button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-[8rem_1fr_auto] md:items-end">
              <TextField label="Position" name="position" type="number" value={membership.position?.toString()} />
              <TextField label="Label" name="relationship_label" value={membership.relationship_label} />
              <CheckboxField label="Featured" name="is_featured" checked={Boolean(membership.is_featured)} />
            </div>
            <TextAreaField label="Editorial note" name="editorial_note" rows={2} value={membership.editorial_note} />
            <div className="mt-3">
              <button className="focus-ring h-9 rounded-md bg-archive-violet px-3 text-xs font-semibold text-white hover:bg-archive-violetDark" type="submit">
                Save membership
              </button>
            </div>
          </form>
        )) : <p className="rounded-md border border-dashed border-archive-line bg-archive-paper px-4 py-8 text-center text-sm text-archive-muted">No sources attached yet.</p>}
      </div>

      <form action={addSourceToTopic} className="mt-5 rounded-md border border-archive-line bg-archive-paper p-4">
        <input name="topic_id" type="hidden" value={topic.id} />
        <input name="topic_slug" type="hidden" value={topic.slug} />
        <h4 className="font-semibold">Add Source</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem_auto] md:items-end">
          <SelectObjectField label="Source" name="document_id" options={sources.map((source) => ({ label: `${source.title} (${source.status || "draft"})`, value: source.id }))} />
          <TextField label="Position" name="position" type="number" value="" />
          <CheckboxField label="Featured" name="is_featured" />
        </div>
        <TextField label="Label" name="relationship_label" value="" />
        <TextAreaField label="Editorial note" name="editorial_note" rows={2} value="" />
        <div className="mt-3">
          <SaveButton label="Add source" />
        </div>
      </form>
    </section>
  );
}

function TopicPreview({ topic, memberships }: { topic: AdminTopic; memberships: AdminTopicDocument[] }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Preview</h3>
      <p className="mt-1 text-sm text-archive-muted">Approximate Markdown rendering for the public topic intro.</p>
      <div className="mt-4 rounded-md border border-archive-line bg-white p-4">
        <p className="display-label text-[0.7rem] text-archive-muted">Topic</p>
        <h4 className="mt-1 font-serif text-2xl font-semibold">{topic.name}</h4>
        {topic.dek && <p className="mt-2 text-sm leading-6 text-archive-muted">{topic.dek}</p>}
        {topic.body_markdown ? (
          <MarkdownContent className="source-markdown mt-4 space-y-4 text-sm leading-6 text-archive-ink" markdown={topic.body_markdown} />
        ) : (
          <p className="mt-4 text-sm text-archive-muted">No topic body yet.</p>
        )}
      </div>
      <div className="mt-4 text-sm text-archive-muted">
        {memberships.filter((membership) => membership.is_featured).length} featured · {memberships.length} total sources
      </div>
    </section>
  );
}

function TopicHealthPanel({ topic, memberships }: { topic: AdminTopic; memberships: AdminTopicDocument[] }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Health</h3>
      <dl className="mt-4 divide-y divide-archive-line text-sm">
        <AdminDetail label="Status" value={topic.status || "draft"} />
        <AdminDetail label="Sources" value={String(memberships.length)} />
        <AdminDetail label="Featured" value={String(memberships.filter((membership) => membership.is_featured).length)} />
        <AdminDetail label="SEO title" value={topic.seo_title ? "Set" : "Fallback"} />
        <AdminDetail label="SEO description" value={topic.seo_description ? "Set" : "Fallback"} />
        <AdminDetail label="Updated" value={topic.updated_at || "Not recorded"} />
      </dl>
    </section>
  );
}

function AdminDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 py-3 first:pt-0 last:pb-0">
      <dt className="font-semibold text-archive-ink">{label}</dt>
      <dd className="text-archive-muted">{value}</dd>
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
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
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
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function CheckboxField({ checked = false, label, name }: { checked?: boolean; label: string; name: string }) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-md border border-archive-line bg-white px-3 text-sm font-semibold">
      <input className="h-4 w-4 accent-archive-violet" defaultChecked={checked} name={name} type="checkbox" />
      {label}
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
