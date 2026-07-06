import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createBiographyProfile } from "@/app/admin/actions";
import { slugifyPersonName } from "@/lib/biographies";
import { isAdminWritable } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

type AdminNewBiographyPageProps = {
  searchParams: Promise<{ name?: string; slug?: string; years?: string }>;
};

export default async function AdminNewBiographyPage({ searchParams }: AdminNewBiographyPageProps) {
  const params = await searchParams;
  const name = params.name || "";
  const slug = params.slug || (name ? slugifyPersonName(name) : "");
  const years = params.years || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm font-semibold hover:bg-archive-lavender2" href="/admin/biographies">
          <ArrowLeft className="h-4 w-4" />
          Biographies
        </Link>
        <div className="ml-auto text-sm text-archive-muted">
          {isAdminWritable ? "Local write mode" : "Read-only until service role env is configured"}
        </div>
      </div>

      <form action={createBiographyProfile} className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm" encType="multipart/form-data">
        <h2 className="text-2xl font-semibold">New Biography</h2>
        <p className="mt-1 text-sm text-archive-muted">
          Start with a draft profile, then publish when the editorial biography is ready.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField label="Name" name="name" required value={name} />
          <TextField label="Slug" name="slug" required value={slug} />
          <TextField label="Years" name="years" value={years} />
          <SelectField label="Status" name="status" options={STATUSES} value="draft" />
        </div>

        <div className="mt-4">
          <TextAreaField label="Dek" name="dek" rows={3} value="" />
        </div>

        <div className="mt-4">
          <TextAreaField label="Body Markdown" name="body_markdown" rows={16} value="This biography is being prepared." />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Portrait upload</span>
            <input className="focus-ring mt-1 w-full rounded-md border border-archive-line bg-white px-3 py-2 text-sm" name="portrait_file" type="file" accept="image/*" />
          </label>
          <TextField label="Image path" name="image_path" />
          <TextField label="Image alt" name="image_alt" value={name} />
          <TextField label="Image caption" name="image_caption" />
        </div>

        <section className="mt-6 rounded-md border border-archive-line bg-archive-paper p-4">
          <h3 className="font-semibold">Structured Facts</h3>
          <p className="mt-1 text-sm text-archive-muted">Use one item per line for list fields.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextField label="Birth date" name="birth_date" />
            <TextField label="Birth year" name="birth_year" />
            <TextField label="Birth place" name="birth_place" />
            <div />
            <TextField label="Death date" name="death_date" />
            <TextField label="Death year" name="death_year" />
            <TextField label="Death place" name="death_place" />
            <div />
            <TextAreaField label="Occupations" name="occupations_text" rows={4} value="" />
            <TextAreaField label="Regions" name="regions_text" rows={4} value="" />
            <TextAreaField label="Known for" name="known_for_text" rows={4} value="" />
            <TextAreaField label="Affiliations" name="affiliations_text" rows={4} value="" />
            <TextAreaField label="Custom facts" name="custom_facts_text" rows={4} value="" />
          </div>
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextAreaField label="Tags" name="tags_text" rows={7} value="" />
          <TextAreaField label="Notes and references" name="source_notes_text" rows={7} value="" />
          <TextAreaField label="Related sources" name="related_sources_text" rows={7} value="" />
          <TextAreaField label="Collaborators" name="collaborators_text" rows={7} value="" />
        </div>

        <div className="mt-5 flex justify-end">
          <SaveButton label="Create biography" />
        </div>
      </form>
    </div>
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
