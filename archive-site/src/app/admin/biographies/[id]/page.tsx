import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save, Trash2 } from "lucide-react";
import { addBiographyBibliographyLink, removeBiographyBibliographyLink, updateBiographyProfile } from "@/app/admin/actions";
import { MarkdownContent } from "@/components/markdown-content";
import { getAdminBiographyProfile, profileFormDefaults, type AdminBiographyBibliographyLink, type AdminBiographyProfile } from "@/lib/admin-biographies";
import { listAdminBibliographyItems, type AdminBibliographyItem } from "@/lib/admin-bibliography";
import { isAdminWritable } from "@/lib/admin-cms";
import { getStoragePublicUrl } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type AdminBiographyEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBiographyEditPage({ params }: AdminBiographyEditPageProps) {
  const { id } = await params;
  const [profile, bibliographyItems] = await Promise.all([
    getAdminBiographyProfile(id),
    listAdminBibliographyItems()
  ]);
  if (!profile) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm font-semibold hover:bg-archive-lavender2" href="/admin/biographies">
          <ArrowLeft className="h-4 w-4" />
          Biographies
        </Link>
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm font-semibold hover:bg-archive-lavender2" href={`/biographies/${profile.slug}`}>
          <ExternalLink className="h-4 w-4" />
          Public page
        </Link>
        <div className="ml-auto text-sm text-archive-muted">
          {isAdminWritable ? "Local write mode" : "Read-only until service role env is configured"}
        </div>
      </div>

      <header className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-archive-violet">{profile.storage === "static" ? "Static profile" : profile.status}</p>
        <h2 className="mt-2 text-2xl font-semibold">{profile.name}</h2>
        <p className="mt-1 font-mono text-xs text-archive-muted">{profile.id} · /biographies/{profile.slug}</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-6">
          <BiographyForm profile={profile} />
          {profile.storage === "database" ? (
            <BiographyBibliographyPanel bibliographyItems={bibliographyItems} links={profile.bibliographyLinks ?? []} profile={profile} />
          ) : (
            <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
              <h3 className="text-lg font-semibold">Works And Further Reading</h3>
              <p className="mt-1 text-sm text-archive-muted">
                Save this static profile to Supabase first, then link canonical bibliography records here.
              </p>
            </section>
          )}
        </div>
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <BiographyPreview profile={profile} />
          <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
            <h3 className="font-semibold">Editing Notes</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-archive-muted">
              <li>Saving a static profile migrates it into Supabase.</li>
              <li>Use the structured fact fields for dates, places, occupations, regions, and known-for entries.</li>
              <li>Works and further reading should be linked to canonical bibliography records, not typed manually.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function BiographyForm({ profile }: { profile: AdminBiographyProfile }) {
  const defaults = profileFormDefaults(profile);

  return (
    <form action={updateBiographyProfile} className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm" encType="multipart/form-data">
      <input name="id" type="hidden" value={profile.id} />
      <input name="storage" type="hidden" value={profile.storage} />
      <h3 className="text-lg font-semibold">Biography Profile</h3>
      <p className="mt-1 text-sm text-archive-muted">
        Biography pages publish when status is published. Draft profiles remain visible only in admin.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TextField label="Name" name="name" required value={profile.name} />
        <TextField label="Slug" name="slug" required value={profile.slug} />
        <TextField label="Years" name="years" value={profile.years} />
        <SelectField label="Status" name="status" options={STATUSES} value={profile.status === "static" ? "published" : profile.status} />
      </div>

      <div className="mt-4">
        <TextAreaField label="Dek" name="dek" rows={3} value={profile.dek} />
      </div>

      <div className="mt-4">
        <TextAreaField label="Body Markdown" name="body_markdown" rows={18} value={profile.bodyMarkdown ?? profile.paragraphs.join("\n\n")} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Portrait upload</span>
          <input className="focus-ring mt-1 w-full rounded-md border border-archive-line bg-white px-3 py-2 text-sm" name="portrait_file" type="file" accept="image/*" />
        </label>
        <TextField label="Image path" name="image_path" value={profile.imagePath} />
        <TextField label="Image alt" name="image_alt" value={profile.imageAlt} />
        <TextField label="Image caption" name="image_caption" value={profile.imageCaption} />
      </div>

      <section className="mt-6 rounded-md border border-archive-line bg-archive-paper p-4">
        <h4 className="font-semibold">Structured Facts</h4>
        <p className="mt-1 text-sm text-archive-muted">
          These fields drive the public biography sidebar and keep common metadata consistent across profiles.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField label="Birth date" name="birth_date" value={defaults.birth_date} />
          <TextField label="Birth year" name="birth_year" value={defaults.birth_year} />
          <TextField label="Birth place" name="birth_place" value={defaults.birth_place} />
          <div />
          <TextField label="Death date" name="death_date" value={defaults.death_date} />
          <TextField label="Death year" name="death_year" value={defaults.death_year} />
          <TextField label="Death place" name="death_place" value={defaults.death_place} />
          <div />
          <TextAreaField label="Occupations" name="occupations_text" rows={4} value={defaults.occupations_text} />
          <TextAreaField label="Regions" name="regions_text" rows={4} value={defaults.regions_text} />
          <TextAreaField label="Known for" name="known_for_text" rows={4} value={defaults.known_for_text} />
          <TextAreaField label="Affiliations" name="affiliations_text" rows={4} value={defaults.affiliations_text} />
          <TextAreaField label="Custom facts" name="custom_facts_text" rows={4} value={defaults.custom_facts_text} />
        </div>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextAreaField label="Tags" name="tags_text" rows={8} value={defaults.tags_text} />
        <TextAreaField label="Notes and references" name="source_notes_text" rows={8} value={defaults.source_notes_text} />
        <TextAreaField label="Related sources" name="related_sources_text" rows={8} value={defaults.related_sources_text} />
        <TextAreaField label="Collaborators" name="collaborators_text" rows={8} value={defaults.collaborators_text} />
      </div>

      <TextField label="Change note" name="change_note" value="" />

      <div className="mt-5 flex justify-end">
        <SaveButton label={profile.storage === "static" ? "Save to Supabase" : "Save biography"} />
      </div>
    </form>
  );
}

function BiographyBibliographyPanel({ bibliographyItems, links, profile }: { bibliographyItems: AdminBibliographyItem[]; links: AdminBiographyBibliographyLink[]; profile: AdminBiographyProfile }) {
  const linkedKeys = new Set(links.map((link) => `${link.bibliography_item_id}:${link.relationship_type}`));
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Works And Further Reading</h3>
      <p className="mt-1 text-sm text-archive-muted">
        Link canonical bibliography records here. This prevents duplicate citations and lets the public site format/copy citations consistently.
      </p>

      <div className="mt-5 space-y-3">
        {links.length ? links.map((link) => {
          const item = firstRelated(link.bibliography_item);
          return (
            <form action={addBiographyBibliographyLink} className="rounded-md border border-archive-line bg-archive-paper p-4" key={`${link.bibliography_item_id}-${link.relationship_type}`}>
              <input name="biography_profile_id" type="hidden" value={profile.id} />
              <input name="biography_slug" type="hidden" value={profile.slug} />
              <input name="bibliography_item_id" type="hidden" value={link.bibliography_item_id} />
              <div className="flex flex-wrap items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item?.title || link.bibliography_item_id}</p>
                  <p className="mt-0.5 font-mono text-xs text-archive-muted">{item?.slug || "unknown"} · {item?.year || "n.d."} · {item?.status || "draft"}</p>
                </div>
                <button className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-xs font-semibold text-red-700" formAction={removeBiographyBibliographyLink} type="submit">
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[12rem_8rem_1fr]">
                <SelectField label="Relationship" name="relationship_type" options={BIOGRAPHY_BIBLIOGRAPHY_RELATIONSHIPS} value={link.relationship_type} />
                <TextField label="Position" name="position" value={link.position?.toString()} />
                <TextAreaField label="Editorial note" name="editorial_note" rows={2} value={link.editorial_note} />
              </div>
              <button className="focus-ring mt-3 h-9 rounded-md bg-archive-violet px-3 text-xs font-semibold text-white" type="submit">Save link</button>
            </form>
          );
        }) : <p className="rounded-md border border-dashed border-archive-line bg-archive-paper p-4 text-sm text-archive-muted">No canonical bibliography records linked yet.</p>}
      </div>

      <form action={addBiographyBibliographyLink} className="mt-5 rounded-md border border-archive-line bg-archive-paper p-4">
        <input name="biography_profile_id" type="hidden" value={profile.id} />
        <input name="biography_slug" type="hidden" value={profile.slug} />
        <h4 className="font-semibold">Add Canonical Record</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_8rem]">
          <SelectBibliographyField bibliographyItems={bibliographyItems} linkedKeys={linkedKeys} />
          <SelectField label="Relationship" name="relationship_type" options={BIOGRAPHY_BIBLIOGRAPHY_RELATIONSHIPS} value="recommended_reading" />
          <TextField label="Position" name="position" value="" />
        </div>
        <TextAreaField label="Editorial note" name="editorial_note" rows={2} value="" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm font-semibold text-archive-violet hover:text-archive-violetDark" href="/admin/bibliography">
            Create or edit bibliography records →
          </Link>
          <button className="focus-ring h-10 rounded-md border border-archive-line px-4 text-sm font-semibold" type="submit">Add record</button>
        </div>
      </form>
    </section>
  );
}

function SelectBibliographyField({ bibliographyItems, linkedKeys }: { bibliographyItems: AdminBibliographyItem[]; linkedKeys: Set<string> }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Bibliography item</span>
      <select className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" name="bibliography_item_id" required>
        <option value="">Choose...</option>
        {bibliographyItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}{item.year ? ` (${item.year})` : ""}{linkedKeys.has(`${item.id}:recommended_reading`) ? " · already linked" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function BiographyPreview({ profile }: { profile: AdminBiographyProfile }) {
  const imageUrl = profile.imagePath ? displayImagePath(profile.imagePath) : "";
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="font-semibold">Preview</h3>
      <div className="mt-4 rounded-md border border-archive-line bg-white p-4">
        <p className="display-label text-[0.68rem] text-archive-muted">Biography</p>
        <h4 className="mt-1 font-serif text-2xl font-semibold">{profile.name}</h4>
        {imageUrl && <img alt={profile.imageAlt || profile.name} className="mt-3 aspect-[4/3] w-full rounded border border-archive-line object-contain grayscale" src={imageUrl} />}
        {profile.years && <p className="mt-1 text-sm font-semibold text-archive-violet">{profile.years}</p>}
        {profile.dek && <p className="mt-3 text-sm leading-6 text-archive-muted">{profile.dek}</p>}
        <MarkdownContent className="source-markdown mt-4 space-y-4 text-sm leading-6 text-archive-ink" markdown={profile.bodyMarkdown ?? profile.paragraphs.join("\n\n")} />
      </div>
    </section>
  );
}

function displayImagePath(path: string) {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  return getStoragePublicUrl(path);
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

function firstRelated<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value ?? undefined;
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
const BIOGRAPHY_BIBLIOGRAPHY_RELATIONSHIPS = ["work_by", "work_about", "recommended_reading", "primary_source", "archival_context"];
