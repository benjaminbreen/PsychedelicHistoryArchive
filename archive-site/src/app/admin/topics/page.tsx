import Link from "next/link";
import { Edit3, Save } from "lucide-react";
import { createTopic } from "@/app/admin/actions";
import { isAdminWritable, listAdminTopics } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function AdminTopicsPage() {
  const topics = await listAdminTopics();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Topics</h2>
            <p className="mt-1 text-sm text-archive-muted">
              Curated topic pages override tag-derived topic pages when published.
            </p>
          </div>
          <div className="ml-auto text-sm text-archive-muted">
            {isAdminWritable ? "Local write mode" : "Read-only until service role env is configured"}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-md border border-archive-line">
          <table className="min-w-full divide-y divide-archive-line text-sm">
            <thead className="bg-archive-paper text-left text-xs uppercase tracking-[0.08em] text-archive-muted">
              <tr>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sources</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-archive-line bg-white">
              {topics.map((topic) => (
                <tr key={topic.id}>
                  <td className="px-4 py-3">
                    <Link className="font-semibold text-archive-ink hover:text-archive-violet" href={`/admin/topics/${topic.id}`}>
                      {topic.name}
                    </Link>
                    <div className="mt-0.5 font-mono text-xs text-archive-muted">/topics/{topic.slug}</div>
                  </td>
                  <td className="px-4 py-3">{topic.status || "draft"}</td>
                  <td className="px-4 py-3">{topic.topic_documents?.length ?? 0}</td>
                  <td className="px-4 py-3">{topic.sort_order ?? "Not set"}</td>
                  <td className="px-4 py-3 text-archive-muted">{topic.updated_at || "Not recorded"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href={`/admin/topics/${topic.id}`} title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!topics.length && (
            <div className="bg-white px-4 py-10 text-center text-sm text-archive-muted">
              No curated topics loaded. Apply <code>scripts/supabase_schema.sql</code>, then seed or create topics here.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm xl:sticky xl:top-6 xl:self-start">
        <h3 className="text-lg font-semibold">Create Topic</h3>
        <p className="mt-1 text-sm text-archive-muted">
          Start as draft, add editorial copy and source membership, then publish.
        </p>
        <form action={createTopic} className="mt-5 space-y-4">
          <TextField label="Name" name="name" required value="" />
          <TextField label="Slug" name="slug" value="" />
          <TextField label="Icon" name="icon" value="" />
          <TextField label="Sort order" name="sort_order" type="number" value="" />
          <SelectField label="Status" name="status" options={STATUSES} value="draft" />
          <TextAreaField label="Dek" name="dek" rows={3} value="" />
          <SaveButton label="Create topic" />
        </form>
      </aside>
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

function SaveButton({ label }: { label: string }) {
  return (
    <button className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-archive-violet px-4 text-sm font-semibold text-white hover:bg-archive-violetDark" type="submit">
      <Save className="h-4 w-4" />
      {label}
    </button>
  );
}

const STATUSES = ["draft", "published", "archived"];
