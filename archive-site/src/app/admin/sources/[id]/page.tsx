import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { createDocumentSection, saveDocumentSection, seedSectionFromImportedText, updateSourceMetadata } from "@/app/admin/actions";
import { getAdminSource, isAdminWritable, type AdminDocumentFigure, type AdminDocumentSection, type AdminSource } from "@/lib/admin-cms";
import { getStoragePublicUrl } from "@/lib/supabase";
import type { SourceFigure } from "@/lib/types";

export const dynamic = "force-dynamic";

type AdminSourcePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSourcePage({ params }: AdminSourcePageProps) {
  const { id } = await params;
  const source = await getAdminSource(id);
  if (!source) notFound();

  const figures = mapAdminFigures(source.document_figures);
  const sections = [...(source.document_sections ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const importedTextStats = getImportedTextStats(source.pages);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm font-semibold hover:bg-archive-lavender2" href="/admin/sources">
          <ArrowLeft className="h-4 w-4" />
          Sources
        </Link>
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 py-2 text-sm font-semibold hover:bg-archive-lavender2" href={`/archive/${source.slug}`}>
          <ExternalLink className="h-4 w-4" />
          Public page
        </Link>
        <div className="ml-auto text-sm text-archive-muted">
          {isAdminWritable ? "Local write mode" : "Read-only until service role env is configured"}
        </div>
      </div>

      <header className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-archive-violet">{source.document_type || "Source"}</p>
        <h2 className="mt-2 text-2xl font-semibold">{source.title}</h2>
        <p className="mt-1 font-mono text-xs text-archive-muted">{source.id} · {source.slug}</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-6">
          <MetadataForm source={source} />
          <TranscriptSections sourceId={source.id} slug={source.slug} sections={sections} figures={figures} />
        </div>
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <SourceHealthPanel source={source} sectionCount={sections.length} figureCount={figures.length} />
          <ImportedTextPanel sourceId={source.id} slug={source.slug} stats={importedTextStats} />
          <FigureReferencePanel figures={figures} />
          <CreateSectionForm sourceId={source.id} slug={source.slug} />
        </aside>
      </div>
    </div>
  );
}

function MetadataForm({ source }: { source: AdminSource }) {
  return (
    <form action={updateSourceMetadata} className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <input name="id" type="hidden" value={source.id} />
      <h3 className="text-lg font-semibold">Metadata And Reader Settings</h3>
      <p className="mt-1 text-sm text-archive-muted">Direct edits save to Supabase and revalidate the public source page.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TextField label="Title" name="title" required value={source.title} />
        <TextField label="Short title" name="short_title" value={source.short_title} />
        <TextField label="Subtitle" name="subtitle" value={source.subtitle} />
        <TextField label="Display date" name="display_date" value={source.display_date} />
        <TextField label="Start year" name="date_start" type="number" value={source.date_start?.toString()} />
        <TextField label="End year" name="date_end" type="number" value={source.date_end?.toString()} />
        <SelectField label="Type" name="document_type" options={SOURCE_TYPES} value={source.document_type} />
        <SelectField label="Medium" name="medium" options={MEDIUMS} value={source.medium} />
        <TextField label="Language" name="language" value={source.language} />
        <TextField label="Region" name="region" value={source.region} />
        <TextField label="Publisher" name="publisher" value={source.publisher} />
        <TextField label="Publication title" name="publication_title" value={source.publication_title} />
        <TextField label="Source URL" name="source_url" value={source.source_url} />
        <TextField label="External access URL" name="external_access_url" value={source.external_access_url} />
        <SelectField label="Access type" name="access_type" options={ACCESS_TYPES} value={source.access_type} />
        <SelectField label="Hosting status" name="hosting_status" options={HOSTING_STATUSES} value={source.hosting_status} />
        <SelectField label="Source kind" name="source_kind" options={SOURCE_KINDS} value={source.source_kind} />
        <SelectField label="Reader mode" name="reader_mode" options={READER_MODES} value={source.reader_mode} />
        <TextField label="Media embed URL" name="media_embed_url" value={source.media_embed_url} />
        <SelectField label="Public status" name="status" options={STATUSES} value={source.status} />
        <TextField label="Published at" name="published_at" value={source.published_at} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextAreaField label="Summary" name="summary" rows={5} value={source.summary} />
        <TextAreaField label="Abstract" name="abstract" rows={5} value={source.abstract} />
        <TextAreaField label="Citation" name="citation" rows={3} value={source.citation} />
        <TextAreaField label="Rights statement" name="rights_statement" rows={3} value={source.rights_statement} />
      </div>

      <TextField label="Change note" name="change_note" value="" />

      <div className="mt-5 flex justify-end">
        <SaveButton label="Save metadata" />
      </div>
    </form>
  );
}

function TranscriptSections({ sourceId, slug, sections, figures }: { sourceId: string; slug: string; sections?: AdminDocumentSection[]; figures: SourceFigure[] }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Markdown Sections</h3>
      <p className="mt-1 text-sm text-archive-muted">
        Curated section bodies should use Markdown. Legacy plain text remains supported until reviewed.
      </p>

      <div className="mt-5 space-y-5">
        {sections?.length ? sections.map((section) => (
          <form action={saveDocumentSection} className="rounded-md border border-archive-line bg-archive-paper p-4" key={section.id}>
            <input name="section_id" type="hidden" value={section.id} />
            <input name="document_id" type="hidden" value={sourceId} />
            <input name="slug" type="hidden" value={slug} />

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_10rem]">
              <TextField label="Heading" name="heading" value={section.heading} />
              <SelectField label="Type" name="section_type" options={SECTION_TYPES} value={section.section_type} />
              <SelectField label="Format" name="body_format" options={BODY_FORMATS} value={section.body_format || "plain"} />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Body</span>
                <textarea
                  className="focus-ring mt-1 min-h-[28rem] w-full rounded-md border border-archive-line bg-white px-3 py-2 font-mono text-sm leading-6"
                  name="body"
                  defaultValue={section.body ?? ""}
                />
              </label>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Current preview</div>
                <div className="mt-1 min-h-[28rem] rounded-md border border-archive-line bg-white p-4">
                  {(section.body_format === "markdown") ? (
                    <MarkdownContent className="source-transcript source-markdown space-y-5 text-archive-ink" figures={figures} markdown={section.body ?? ""} />
                  ) : (
                    <div className="source-transcript space-y-5 text-archive-ink">
                      {(section.body ?? "").split(/\n{2,}/).filter(Boolean).map((paragraph: string, index: number) => (
                        <p key={`${index}-${paragraph.slice(0, 18)}`}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <TextField label="Change note" name="change_note" value="" />
              <SaveButton label="Save section" />
            </div>
          </form>
        )) : (
          <div className="rounded-md border border-dashed border-archive-line p-5 text-sm text-archive-muted">
            No curated sections yet. Add one here, then the public reader can use it instead of OCR-derived transcript text.
          </div>
        )}
      </div>
    </section>
  );
}

function CreateSectionForm({ sourceId, slug }: { sourceId: string; slug: string }) {
  return (
    <form action={createDocumentSection} className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <input name="document_id" type="hidden" value={sourceId} />
      <input name="slug" type="hidden" value={slug} />
      <h3 className="font-semibold">Add Section</h3>
      <div className="mt-4 space-y-3">
        <TextField label="Heading" name="heading" value="Transcript" />
        <SelectField label="Type" name="section_type" options={SECTION_TYPES} value="transcript" />
        <TextAreaField label="Starter body" name="body" rows={5} value="" />
      </div>
      <div className="mt-4">
        <SaveButton label="Create section" />
      </div>
    </form>
  );
}

function ImportedTextPanel({ sourceId, slug, stats }: { sourceId: string; slug: string; stats: { pages: number; words: number } }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="font-semibold">Imported Text</h3>
      <p className="mt-1 text-sm text-archive-muted">
        Existing transcripts from older imports live in page OCR. Seed them into a curated Markdown section before editing.
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        <AdminDetail label="Pages" value={`${stats.pages}`} />
        <AdminDetail label="Words" value={`${stats.words}`} />
      </dl>
      <form action={seedSectionFromImportedText} className="mt-4 space-y-3">
        <input name="document_id" type="hidden" value={sourceId} />
        <input name="slug" type="hidden" value={slug} />
        <TextField label="New section heading" name="heading" value="Transcript" />
        <SaveButton label="Seed transcript" />
      </form>
    </section>
  );
}

function SourceHealthPanel({ figureCount, sectionCount, source }: { figureCount: number; sectionCount: number; source: AdminSource }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="font-semibold">Record State</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <AdminDetail label="Status" value={source.status || "draft"} />
        <AdminDetail label="Sections" value={`${sectionCount}`} />
        <AdminDetail label="Figures" value={`${figureCount}`} />
        <AdminDetail label="Reader" value={source.reader_mode || "auto"} />
        <AdminDetail label="Updated" value={source.updated_at || "Not recorded"} />
      </dl>
    </section>
  );
}

function FigureReferencePanel({ figures }: { figures: SourceFigure[] }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="font-semibold">Figure Tokens</h3>
      <p className="mt-1 text-sm text-archive-muted">Place a figure in Markdown by inserting its token on a line by itself.</p>
      <div className="mt-4 space-y-3">
        {figures.length ? figures.map((figure) => (
          <div className="rounded-md border border-archive-line bg-archive-paper p-3" key={figure.id}>
            <code className="text-xs">{`{{figure:${figure.token || figure.id}}}`}</code>
            <p className="mt-2 line-clamp-2 text-xs text-archive-muted">{figure.caption || figure.alt}</p>
          </div>
        )) : (
          <p className="text-sm text-archive-muted">No structured figures yet.</p>
        )}
      </div>
    </section>
  );
}

function TextField({ label, name, required, type = "text", value }: { label: string; name: string; required?: boolean; type?: string; value?: string | null }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <input
        className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm"
        defaultValue={value ?? ""}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function TextAreaField({ label, name, rows, value }: { label: string; name: string; rows: number; value?: string | null }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <textarea
        className="focus-ring mt-1 w-full rounded-md border border-archive-line bg-white px-3 py-2 text-sm leading-6"
        defaultValue={value ?? ""}
        name={name}
        rows={rows}
      />
    </label>
  );
}

function SelectField({ label, name, options, value }: { label: string; name: string; options: string[]; value?: string | null }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <select className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-white px-3 text-sm" defaultValue={value ?? ""} name={name}>
        <option value="">Not set</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
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

function AdminDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-3 border-b border-archive-line pb-3 last:border-b-0">
      <dt className="font-semibold">{label}</dt>
      <dd className="text-archive-muted">{value}</dd>
    </div>
  );
}

function mapAdminFigures(figures: AdminDocumentFigure[] = []): SourceFigure[] {
  return figures.map((figure) => ({
    id: figure.id,
    imagePath: getStoragePublicUrl(figure.image_path),
    alt: figure.alt_text || figure.caption || "Archive figure",
    caption: figure.caption || "",
    position: figure.placement || "inline",
    token: figure.token || figure.id,
    credit: figure.credit || undefined
  }));
}

function getImportedTextStats(pages: AdminSource["pages"] = []) {
  const text = pages.map((page) => page.ocr_text || "").join("\n\n");
  return {
    pages: pages.filter((page) => Boolean(page.ocr_text?.trim())).length,
    words: text.match(/\b\w+\b/g)?.length ?? 0
  };
}

const SOURCE_TYPES = ["Book", "Academic Article", "Essay", "Letter", "Patient Report", "Medical Report", "Audio/Video", "Film", "Field Notes", "Manuscript", "Newspaper Article", "Source", "Testimony"];
const MEDIUMS = ["Text", "Image", "Audio/Video", "Personal History", "Biography"];
const ACCESS_TYPES = ["hosted", "external", "metadata_only"];
const HOSTING_STATUSES = ["metadata_only", "external_link", "transcript_only", "page_images", "pdf", "page_images_and_pdf"];
const SOURCE_KINDS = ["single", "collection", "collection_item"];
const READER_MODES = ["transcript", "translation", "overview", "pdf", "audio", "video", "images"];
const STATUSES = ["draft", "published", "archived"];
const SECTION_TYPES = ["overview", "transcript", "translation", "note"];
const BODY_FORMATS = ["plain", "markdown"];
