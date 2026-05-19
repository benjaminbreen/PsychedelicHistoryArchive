import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, Copy, ExternalLink, Save, Trash2 } from "lucide-react";
import { CopyTokenButton } from "@/components/admin/copy-token-button";
import { MarkdownSectionEditor } from "@/components/admin/markdown-section-editor";
import {
  addDocumentPerson,
  addDocumentTag,
  addSourceToCollection,
  createDocumentFigure,
  createDocumentSection,
  deleteDocumentFigure,
  deleteDocumentSection,
  duplicateDocumentSection,
  moveDocumentSection,
  removeDocumentPerson,
  removeDocumentTag,
  removeSourceFromCollection,
  saveDocumentSection,
  seedSectionFromImportedText,
  updateTagVisibility,
  updateDocumentFigure,
  updateSourceMetadata
} from "@/app/admin/actions";
import { getAdminSource, isAdminWritable, listAdminCollections, listAdminPeople, listAdminTags, type AdminCollectionListItem, type AdminDocumentFigure, type AdminDocumentPerson, type AdminDocumentSection, type AdminDocumentTag, type AdminPerson, type AdminSource, type AdminSourceCollectionMembership, type AdminTag } from "@/lib/admin-cms";
import { getStoragePublicUrl } from "@/lib/supabase";
import type { SourceFigure } from "@/lib/types";

export const dynamic = "force-dynamic";

type AdminSourcePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSourcePage({ params }: AdminSourcePageProps) {
  const { id } = await params;
  const [source, people, tags, collections] = await Promise.all([
    getAdminSource(id),
    listAdminPeople(),
    listAdminTags(),
    listAdminCollections()
  ]);
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
          <RelationshipsPanel collections={collections} people={people} source={source} tags={tags} />
          <TranscriptSections sourceId={source.id} slug={source.slug} sections={sections} figures={figures} />
        </div>
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <SourceHealthPanel source={source} sectionCount={sections.length} figureCount={figures.length} />
          <ImportedTextPanel sourceId={source.id} slug={source.slug} stats={importedTextStats} />
          <FigureReferencePanel figures={source.document_figures ?? []} sourceId={source.id} slug={source.slug} />
          <CreateFigureForm sourceId={source.id} slug={source.slug} />
          <CreateSectionForm figures={figures} sourceId={source.id} slug={source.slug} />
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

function RelationshipsPanel({ collections, people, source, tags }: { collections: AdminCollectionListItem[]; people: AdminPerson[]; source: AdminSource; tags: AdminTag[] }) {
  const sourcePeople = (source.document_people ?? []).map((item) => ({
    role: item.role || "person",
    person: firstRelated(item.people)
  })).filter((item) => Boolean(item.person?.id));
  const sourceTags = (source.document_tags ?? []).map((item) => firstRelated(item.tags)).filter((tag): tag is AdminTag => Boolean(tag?.id));
  const memberships = [...(source.collection_documents ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Relationships And Visibility</h3>
      <p className="mt-1 text-sm text-archive-muted">
        Source visibility is controlled by Public status above. Draft sources stay editable here but are excluded from archive listings and public source pages.
      </p>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="rounded-md border border-archive-line bg-archive-paper p-4">
          <h4 className="font-semibold">People</h4>
          <div className="mt-3 space-y-2">
            {sourcePeople.length ? sourcePeople.map(({ person, role }) => person && (
              <form action={removeDocumentPerson} className="flex items-center gap-2 rounded-md border border-archive-line bg-white px-3 py-2 text-sm" key={`${person.id}-${role}`}>
                <input name="document_id" type="hidden" value={source.id} />
                <input name="slug" type="hidden" value={source.slug} />
                <input name="person_id" type="hidden" value={person.id} />
                <input name="role" type="hidden" value={role} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{person.name}</span>
                  <span className="block text-xs text-archive-muted">{role}</span>
                </span>
                <button className="focus-ring rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700" type="submit">Remove</button>
              </form>
            )) : <p className="text-sm text-archive-muted">No people attached.</p>}
          </div>
          <form action={addDocumentPerson} className="mt-4 space-y-3">
            <input name="document_id" type="hidden" value={source.id} />
            <input name="slug" type="hidden" value={source.slug} />
            <SelectObjectField label="Add person" name="person_id" options={people.map((person) => ({ label: person.name, value: person.id }))} />
            <TextField label="Role" name="role" value="person" />
            <SaveButton label="Add person" />
          </form>
        </div>

        <div className="rounded-md border border-archive-line bg-archive-paper p-4">
          <h4 className="font-semibold">Tags And Topics</h4>
          <div className="mt-3 space-y-2">
            {sourceTags.length ? sourceTags.map((tag) => (
              <div className="rounded-md border border-archive-line bg-white px-3 py-2 text-sm" key={tag.id}>
                <div className="flex items-start gap-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{tag.name}</span>
                    <span className="block text-xs text-archive-muted">{tag.tag_type || "tag"} · {tag.status || "published"}</span>
                  </span>
                  <form action={removeDocumentTag}>
                    <input name="document_id" type="hidden" value={source.id} />
                    <input name="slug" type="hidden" value={source.slug} />
                    <input name="tag_id" type="hidden" value={tag.id} />
                    <button className="focus-ring rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700" type="submit">Remove</button>
                  </form>
                </div>
                <form action={updateTagVisibility} className="mt-2 flex items-end gap-2">
                  <input name="document_id" type="hidden" value={source.id} />
                  <input name="tag_id" type="hidden" value={tag.id} />
                  <SelectField label="Topic card" name="status" options={STATUSES} value={tag.status || "published"} />
                  <button className="focus-ring h-10 rounded-md border border-archive-line bg-white px-3 text-xs font-semibold" type="submit">Save</button>
                </form>
              </div>
            )) : <p className="text-sm text-archive-muted">No tags attached.</p>}
          </div>
          <form action={addDocumentTag} className="mt-4 space-y-3">
            <input name="document_id" type="hidden" value={source.id} />
            <input name="slug" type="hidden" value={source.slug} />
            <SelectObjectField label="Add tag" name="tag_id" options={tags.map((tag) => ({ label: `${tag.name}${tag.status === "draft" ? " (draft)" : ""}`, value: tag.id }))} />
            <SaveButton label="Add tag" />
          </form>
        </div>

        <div className="rounded-md border border-archive-line bg-archive-paper p-4">
          <h4 className="font-semibold">Collections</h4>
          <div className="mt-3 space-y-2">
            {memberships.length ? memberships.map((membership) => {
              const collection = firstRelated(membership.collections);
              return (
                <form action={addSourceToCollection} className="rounded-md border border-archive-line bg-white p-3 text-sm" key={`${membership.collection_id}-${membership.document_id}`}>
                  <input name="document_id" type="hidden" value={source.id} />
                  <input name="slug" type="hidden" value={source.slug} />
                  <input name="collection_id" type="hidden" value={membership.collection_id} />
                  <div className="flex items-start gap-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{collection?.title || membership.collection_id}</span>
                      <span className="block text-xs text-archive-muted">{collection?.status || "draft"}</span>
                    </span>
                    <button className="focus-ring rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700" formAction={removeSourceFromCollection} type="submit">Remove</button>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <TextField label="Position" name="position" type="number" value={membership.position?.toString()} />
                    <TextField label="Sequence no." name="sequence_number" type="number" value={membership.sequence_number?.toString()} />
                    <TextField label="Sequence label" name="sequence_label" value={membership.sequence_label} />
                    <TextField label="Issue date" name="issue_date" value={membership.issue_date} />
                  </div>
                  <TextAreaField label="Caption" name="editorial_caption" rows={2} value={membership.editorial_caption} />
                  <button className="focus-ring mt-3 h-9 rounded-md bg-archive-violet px-3 text-xs font-semibold text-white" type="submit">Save membership</button>
                </form>
              );
            }) : <p className="text-sm text-archive-muted">Not attached to a collection.</p>}
          </div>
          <form action={addSourceToCollection} className="mt-4 space-y-3">
            <input name="document_id" type="hidden" value={source.id} />
            <input name="slug" type="hidden" value={source.slug} />
            <SelectObjectField label="Add to collection" name="collection_id" options={collections.map((collection) => ({ label: `${collection.title} (${collection.status || "draft"})`, value: collection.id }))} />
            <SaveButton label="Add collection" />
          </form>
        </div>
      </div>
    </section>
  );
}

function TranscriptSections({ sourceId, slug, sections = [], figures }: { sourceId: string; slug: string; sections?: AdminDocumentSection[]; figures: SourceFigure[] }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Markdown Sections</h3>
      <p className="mt-1 text-sm text-archive-muted">
        Curated section bodies should use Markdown. Legacy plain text remains supported until reviewed.
      </p>

      <div className="mt-5 space-y-5">
        {sections.length ? sections.map((section, index) => (
          <form action={saveDocumentSection} className="rounded-md border border-archive-line bg-archive-paper p-4" key={section.id}>
            <input name="section_id" type="hidden" value={section.id} />
            <input name="document_id" type="hidden" value={sourceId} />
            <input name="slug" type="hidden" value={slug} />

            <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-archive-line pb-3">
              <span className="font-mono text-xs text-archive-muted">Section {index + 1}</span>
              <div className="ml-auto flex flex-wrap gap-2">
                <button className="focus-ring inline-flex h-8 items-center gap-1 rounded-md border border-archive-line bg-white px-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40" disabled={index === 0} formAction={moveDocumentSection} name="direction" type="submit" value="up">
                  <ArrowUp className="h-3.5 w-3.5" />
                  Up
                </button>
                <button className="focus-ring inline-flex h-8 items-center gap-1 rounded-md border border-archive-line bg-white px-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40" disabled={index === sections.length - 1} formAction={moveDocumentSection} name="direction" type="submit" value="down">
                  <ArrowDown className="h-3.5 w-3.5" />
                  Down
                </button>
                <button className="focus-ring inline-flex h-8 items-center gap-1 rounded-md border border-archive-line bg-white px-2 text-xs font-semibold" formAction={duplicateDocumentSection} type="submit">
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </button>
                <button className="focus-ring inline-flex h-8 items-center gap-1 rounded-md border border-red-200 bg-white px-2 text-xs font-semibold text-red-700 hover:bg-red-50" formAction={deleteDocumentSection} type="submit">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>

            <MarkdownSectionEditor
              body={section.body}
              bodyFormat={section.body_format || "plain"}
              figures={figures}
              formats={BODY_FORMATS}
              heading={section.heading}
              sectionTypes={SECTION_TYPES}
              type={section.section_type}
            />

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

function CreateSectionForm({ figures, sourceId, slug }: { figures: SourceFigure[]; sourceId: string; slug: string }) {
  return (
    <form action={createDocumentSection} className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <input name="document_id" type="hidden" value={sourceId} />
      <input name="slug" type="hidden" value={slug} />
      <h3 className="font-semibold">Add Section</h3>
      <div className="mt-4 space-y-3">
        <MarkdownSectionEditor
          body=""
          bodyFormat="markdown"
          compact
          figures={figures}
          formats={BODY_FORMATS}
          heading="Transcript"
          sectionTypes={SECTION_TYPES}
          type="transcript"
        />
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

function FigureReferencePanel({ figures, sourceId, slug }: { figures: AdminDocumentFigure[]; sourceId: string; slug: string }) {
  const sortedFigures = [...figures].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const rowToken = sortedFigures.slice(0, 4).map((figure) => figure.token || figure.id).join(",");

  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
      <h3 className="font-semibold">Figure Library</h3>
      <p className="mt-1 text-sm text-archive-muted">Place one figure or a clickable row in Markdown by inserting tokens on a line by themselves.</p>
      {rowToken && (
        <div className="mt-4 rounded-md border border-archive-line bg-archive-paper p-3">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Row example</p>
          <div className="mt-2 flex items-start gap-2">
            <code className="block min-w-0 flex-1 break-all text-xs">{`{{figure-row:${rowToken}}}`}</code>
            <CopyTokenButton value={`{{figure-row:${rowToken}}}`} />
          </div>
        </div>
      )}
      <div className="mt-4 space-y-3">
        {sortedFigures.length ? sortedFigures.map((figure) => (
          <form action={updateDocumentFigure} className="rounded-md border border-archive-line bg-archive-paper p-3" encType="multipart/form-data" key={figure.id}>
            <input name="figure_id" type="hidden" value={figure.id} />
            <input name="document_id" type="hidden" value={sourceId} />
            <input name="slug" type="hidden" value={slug} />
            <div className="grid gap-3 sm:grid-cols-[5.5rem_1fr]">
              <div className="aspect-square overflow-hidden rounded border border-archive-line bg-white">
                {figure.image_path ? (
                  <img alt={figure.alt_text || figure.caption || "Archive figure"} className="h-full w-full object-cover" src={getStoragePublicUrl(figure.image_path)} />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="flex items-start gap-2">
                  <code className="block min-w-0 flex-1 break-all text-xs">{`{{figure:${figure.token || figure.id}}}`}</code>
                  <CopyTokenButton value={`{{figure:${figure.token || figure.id}}}`} />
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-archive-muted">{figure.caption || figure.alt_text || "No caption yet."}</p>
              </div>
            </div>
            <details className="mt-3">
              <summary className="focus-ring cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-archive-violet hover:bg-white">Edit figure</summary>
              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Replace upload</span>
                  <input className="focus-ring mt-1 w-full rounded-md border border-archive-line bg-white px-3 py-2 text-sm" name="figure_file" type="file" accept="image/*" />
                </label>
                <TextField label="Storage path" name="image_path" value={figure.image_path} />
                <TextField label="Token" name="token" value={figure.token || figure.id} />
                <TextField label="Alt text" name="alt_text" value={figure.alt_text} />
                <TextAreaField label="Caption" name="caption" rows={3} value={figure.caption} />
                <TextField label="Credit" name="credit" value={figure.credit} />
                <SelectField label="Placement" name="placement" options={FIGURE_PLACEMENTS} value={figure.placement || "inline"} />
                <TextField label="Change note" name="change_note" value="" />
                <div className="flex flex-wrap justify-end gap-2">
                  <button className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50" formAction={deleteDocumentFigure} type="submit">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete record
                  </button>
                  <button className="focus-ring inline-flex h-9 items-center gap-2 rounded-md bg-archive-violet px-3 text-xs font-semibold text-white hover:bg-archive-violetDark" type="submit">
                    <Save className="h-3.5 w-3.5" />
                    Save figure
                  </button>
                </div>
              </div>
            </details>
          </form>
        )) : (
          <p className="text-sm text-archive-muted">No structured figures yet.</p>
        )}
      </div>
    </section>
  );
}

function CreateFigureForm({ sourceId, slug }: { sourceId: string; slug: string }) {
  return (
    <form action={createDocumentFigure} className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm" encType="multipart/form-data">
      <input name="document_id" type="hidden" value={sourceId} />
      <input name="slug" type="hidden" value={slug} />
      <h3 className="font-semibold">Add Figure</h3>
      <p className="mt-1 text-sm text-archive-muted">Upload a new archival image, or reference an existing Supabase Storage path.</p>
      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">Image upload</span>
          <input className="focus-ring mt-1 w-full rounded-md border border-archive-line bg-white px-3 py-2 text-sm" name="figure_file" type="file" accept="image/*" />
        </label>
        <TextField label="Existing storage path" name="image_path" value="" />
        <TextField label="Token" name="token" value="" />
        <TextField label="Alt text" name="alt_text" value="" />
        <TextAreaField label="Caption" name="caption" rows={3} value="" />
        <TextField label="Credit" name="credit" value="" />
        <SelectField label="Placement" name="placement" options={FIGURE_PLACEMENTS} value="inline" />
      </div>
      <div className="mt-4">
        <SaveButton label="Create figure" />
      </div>
    </form>
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

function firstRelated<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value ?? undefined;
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

const SOURCE_TYPES = ["Book", "Academic Article", "Ancient Text", "Archaeological Site", "Architectural Site", "Essay", "Letter", "Iconography", "Material Artifact", "Patient Report", "Medical Report", "Audio/Video", "Film", "Field Notes", "Manuscript", "Newspaper Article", "Source", "Testimony"];
const MEDIUMS = ["Text", "Image", "Audio/Video", "Personal History", "Biography"];
const ACCESS_TYPES = ["hosted", "external", "metadata_only"];
const HOSTING_STATUSES = ["metadata_only", "external_link", "transcript_only", "page_images", "pdf", "page_images_and_pdf"];
const SOURCE_KINDS = ["single", "collection", "collection_item"];
const READER_MODES = ["transcript", "translation", "overview", "pdf", "audio", "video", "images"];
const STATUSES = ["draft", "published", "archived"];
const SECTION_TYPES = ["overview", "transcript", "translation", "note"];
const BODY_FORMATS = ["plain", "markdown"];
const FIGURE_PLACEMENTS = ["inline", "before_overview"];
