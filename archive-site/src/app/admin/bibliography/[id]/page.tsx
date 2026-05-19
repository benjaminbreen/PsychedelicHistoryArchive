import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import {
  addBibliographyContributor,
  removeBibliographyContributor,
  removeBibliographyEra,
  setBibliographyEra,
  updateBibliographyItem
} from "@/app/admin/actions";
import { ERAS } from "@/lib/eras";
import { getAdminBibliographyItem, type AdminBibliographyContributor, type AdminBibliographyItem } from "@/lib/admin-bibliography";

export const dynamic = "force-dynamic";

type AdminBibliographyEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBibliographyEditPage({ params }: AdminBibliographyEditPageProps) {
  const { id } = await params;
  const item = await getAdminBibliographyItem(id);
  if (!item) notFound();

  const contributors = [...(item.bibliography_item_contributors ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const eras = [...(item.bibliography_item_eras ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <div className="space-y-6">
      <Link className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-semibold text-archive-violet" href="/admin/bibliography">
        <ArrowLeft className="h-4 w-4" />
        Back to bibliography
      </Link>

      <form action={updateBibliographyItem} className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
        <input name="id" type="hidden" value={item.id} />
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_16rem_12rem_12rem]">
          <TextField label="Title" name="title" required value={item.title} />
          <TextField label="Slug" name="slug" value={item.slug} />
          <SelectField label="Type" name="item_type" options={ITEM_TYPES} value={item.item_type} />
          <TextField label="Year" name="year" type="number" value={item.year?.toString()} />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <TextField label="Subtitle" name="subtitle" value={item.subtitle} />
          <TextField label="Publication title" name="publication_title" value={item.publication_title} />
          <TextField label="Publisher" name="publisher" value={item.publisher} />
          <TextField label="Publication place" name="publication_place" value={item.publication_place} />
          <TextField label="Volume" name="volume" value={item.volume} />
          <TextField label="Issue" name="issue" value={item.issue} />
          <TextField label="Pages" name="pages" value={item.pages} />
          <TextField label="DOI" name="doi" value={item.doi} />
          <TextField label="ISBN" name="isbn" value={item.isbn} />
          <TextField label="OCLC" name="oclc" value={item.oclc} />
          <TextField label="Publisher URL" name="publisher_url" value={item.publisher_url} />
          <TextField label="Google Books URL" name="google_books_url" value={item.google_books_url} />
          <TextField label="WorldCat URL" name="worldcat_url" value={item.worldcat_url} />
          <TextField label="JSTOR URL" name="jstor_url" value={item.jstor_url} />
          <TextField label="Open access URL" name="open_access_url" value={item.open_access_url} />
          <TextField label="PDF URL" name="pdf_url" value={item.pdf_url} />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <TextAreaField label="Abstract" name="abstract" value={item.abstract} />
          <TextAreaField label="Editorial note" name="editorial_note" value={item.editorial_note} />
          <TextAreaField label="Reliability note" name="reliability_note" value={item.reliability_note} />
          <TextAreaField label="Change note" name="change_note" />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <SelectField label="Recommendation" name="recommendation_status" options={RECOMMENDATION_STATUSES} value={item.recommendation_status || "recommended"} />
          <SelectField label="Status" name="status" options={STATUSES} value={item.status || "draft"} />
        </div>
        <button className="focus-ring mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-archive-violet px-4 text-sm font-semibold text-white" type="submit">
          <Save className="h-4 w-4" />
          Save bibliography item
        </button>
      </form>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Contributors</h2>
          <div className="mt-3 space-y-2">
            {contributors.map((relationship) => {
              const contributor = firstRelated(relationship.contributor);
              if (!contributor) return null;
              return (
                <form action={removeBibliographyContributor} className="flex items-center gap-2 rounded-md border border-archive-line bg-archive-paper p-3 text-sm" key={`${contributor.id}-${relationship.role}`}>
                  <input name="bibliography_item_id" type="hidden" value={item.id} />
                  <input name="contributor_id" type="hidden" value={contributor.id} />
                  <input name="role" type="hidden" value={relationship.role || "author"} />
                  <input name="slug" type="hidden" value={item.slug} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{contributor.display_name}</span>
                    <span className="block text-xs text-archive-muted">{relationship.role || "author"} · {relationship.position || 1}</span>
                  </span>
                  <button className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-700" type="submit">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              );
            })}
          </div>
          <form action={addBibliographyContributor} className="mt-4 grid gap-3 md:grid-cols-2">
            <input name="bibliography_item_id" type="hidden" value={item.id} />
            <input name="slug" type="hidden" value={item.slug} />
            <TextField label="Display name" name="display_name" required />
            <TextField label="Family name" name="family_name" />
            <TextField label="Given name" name="given_name" />
            <TextField label="Position" name="position" type="number" value="1" />
            <SelectField label="Role" name="role" options={["author", "editor", "translator"]} value="author" />
            <button className="focus-ring mt-6 h-10 rounded-md border border-archive-line px-4 text-sm font-semibold" type="submit">Add contributor</button>
          </form>
        </section>

        <section className="rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Era Placement</h2>
          <div className="mt-3 space-y-2">
            {eras.map((era) => (
              <form action={removeBibliographyEra} className="flex items-center gap-2 rounded-md border border-archive-line bg-archive-paper p-3 text-sm" key={era.era_slug}>
                <input name="bibliography_item_id" type="hidden" value={item.id} />
                <input name="era_slug" type="hidden" value={era.era_slug || ""} />
                <input name="slug" type="hidden" value={item.slug} />
                <span className="flex-1 font-semibold">{era.era_slug}</span>
                <span className="text-xs text-archive-muted">{era.position ?? ""}</span>
                <button className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-700" type="submit">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            ))}
          </div>
          <form action={setBibliographyEra} className="mt-4 grid gap-3 md:grid-cols-[1fr_8rem_auto]">
            <input name="bibliography_item_id" type="hidden" value={item.id} />
            <input name="slug" type="hidden" value={item.slug} />
            <SelectField label="Era" name="era_slug" options={ERAS.map((era) => era.slug)} />
            <TextField label="Position" name="position" type="number" />
            <button className="focus-ring mt-6 h-10 rounded-md border border-archive-line px-4 text-sm font-semibold" type="submit">Add era</button>
          </form>
        </section>
      </div>
    </div>
  );
}

function TextField({ label, name, required, type = "text", value }: { label: string; name: string; required?: boolean; type?: string; value?: string | null }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <input className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-archive-paper px-3 text-sm" defaultValue={value ?? ""} name={name} required={required} type={type} />
    </label>
  );
}

function TextAreaField({ label, name, value }: { label: string; name: string; value?: string | null }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <textarea className="focus-ring mt-1 min-h-28 w-full rounded-md border border-archive-line bg-archive-paper px-3 py-2 text-sm" defaultValue={value ?? ""} name={name} />
    </label>
  );
}

function SelectField({ label, name, options, value }: { label: string; name: string; options: string[]; value?: string | null }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <select className="focus-ring mt-1 h-10 w-full rounded-md border border-archive-line bg-archive-paper px-3 text-sm" defaultValue={value ?? options[0]} name={name}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function firstRelated<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

const ITEM_TYPES = ["book", "article", "chapter", "dissertation", "edited_volume", "report"];
const RECOMMENDATION_STATUSES = ["recommended", "contextual", "archived", "exclude"];
const STATUSES = ["draft", "published", "archived"];
