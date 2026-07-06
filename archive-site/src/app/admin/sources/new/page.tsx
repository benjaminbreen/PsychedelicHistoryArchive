import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createSource } from "@/app/admin/actions";
import { isAdminWritable } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default function AdminNewSourcePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm font-semibold hover:bg-archive-lavender2" href="/admin/sources">
          <ArrowLeft className="h-4 w-4" />
          Sources
        </Link>
        <div className="ml-auto text-sm text-archive-muted">
          {isAdminWritable ? "Local write mode" : "Read-only until service role env is configured"}
        </div>
      </div>

      <form action={createSource} className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
        <h2 className="text-2xl font-semibold">New Source</h2>
        <p className="mt-1 text-sm text-archive-muted">
          Create the source shell first, then add metadata, people, sections, figures, files, and collection membership.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField label="Title" name="title" required />
          <TextField label="Slug" name="slug" />
          <TextField label="Display date" name="display_date" />
          <TextField label="Start year" name="date_start" type="number" />
          <SelectField label="Type" name="document_type" options={SOURCE_TYPES} value="Source" />
          <SelectField label="Medium" name="medium" options={MEDIUMS} value="Text" />
          <SelectField label="Source kind" name="source_kind" options={SOURCE_KINDS} value="single" />
          <SelectField label="Reader mode" name="reader_mode" options={READER_MODES} value="" />
          <SelectField label="Status" name="status" options={STATUSES} value="draft" />
        </div>

        <div className="mt-5 flex justify-end">
          <SaveButton label="Create source" />
        </div>
      </form>
    </div>
  );
}

function TextField({ label, name, required, type = "text" }: { label: string; name: string; required?: boolean; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <input className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" name={name} required={required} type={type} />
    </label>
  );
}

function SelectField({ label, name, options, value }: { label: string; name: string; options: string[]; value?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <select className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" defaultValue={value ?? ""} name={name}>
        <option value="">Not set</option>
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

const SOURCE_TYPES = ["Book", "Academic Article", "Ancient Text", "Archaeological Site", "Architectural Site", "Essay", "Letter", "Iconography", "Material Artifact", "Patient Report", "Medical Report", "Audio/Video", "Film", "Field Notes", "Manuscript", "Newspaper Article", "Source", "Testimony"];
const MEDIUMS = ["Text", "Image", "Audio/Video", "Personal History", "Biography"];
const SOURCE_KINDS = ["single", "collection", "collection_item"];
const READER_MODES = ["", "transcript", "translation", "overview", "pdf", "audio", "video", "images"];
const STATUSES = ["draft", "published", "archived"];
