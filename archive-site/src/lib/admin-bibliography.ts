import { getAdminSupabaseClient, isAdminEnabled, isSchemaShapeError } from "@/lib/admin-cms";

export type AdminBibliographyItem = {
  id: string;
  slug: string;
  item_type: string;
  title: string;
  subtitle: string | null;
  publication_title: string | null;
  publisher: string | null;
  publication_place: string | null;
  year: number | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  isbn: string | null;
  oclc: string | null;
  jstor_url: string | null;
  publisher_url: string | null;
  google_books_url: string | null;
  worldcat_url: string | null;
  open_access_url: string | null;
  pdf_url: string | null;
  abstract: string | null;
  editorial_note: string | null;
  reliability_note: string | null;
  recommendation_status: string | null;
  status: string | null;
  bibliography_item_contributors?: AdminBibliographyItemContributor[];
  bibliography_item_eras?: AdminBibliographyItemEra[];
};

export type AdminBibliographyContributor = {
  id: string;
  display_name: string;
  family_name: string | null;
  given_name: string | null;
  slug: string | null;
};

export type AdminBibliographyItemContributor = {
  role: string | null;
  position: number | null;
  contributor_id: string | null;
  contributor: AdminBibliographyContributor | AdminBibliographyContributor[] | null;
};

export type AdminBibliographyItemEra = {
  era_slug: string | null;
  position: number | null;
};

const ITEM_SELECT = `
  id,
  slug,
  item_type,
  title,
  subtitle,
  publication_title,
  publisher,
  publication_place,
  year,
  volume,
  issue,
  pages,
  doi,
  isbn,
  oclc,
  jstor_url,
  publisher_url,
  google_books_url,
  worldcat_url,
  open_access_url,
  pdf_url,
  abstract,
  editorial_note,
  reliability_note,
  recommendation_status,
  status,
  bibliography_item_contributors(role, position, contributor_id, contributor:bibliography_contributors(id, display_name, family_name, given_name, slug)),
  bibliography_item_eras(era_slug, position)
`;

export async function listAdminBibliographyItems(): Promise<AdminBibliographyItem[]> {
  if (!isAdminEnabled) return [];
  const supabase = getAdminSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("bibliography_items")
    .select("id, slug, item_type, title, publication_title, year, recommendation_status, status")
    .order("year", { ascending: false });

  if (error) {
    if (isSchemaShapeError(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []) as AdminBibliographyItem[];
}

export async function getAdminBibliographyItem(id: string): Promise<AdminBibliographyItem | null> {
  if (!isAdminEnabled) return null;
  const supabase = getAdminSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("bibliography_items")
    .select(ITEM_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isSchemaShapeError(error.message)) return null;
    throw new Error(error.message);
  }
  return data as AdminBibliographyItem | null;
}

export async function listAdminBibliographyContributors(): Promise<AdminBibliographyContributor[]> {
  if (!isAdminEnabled) return [];
  const supabase = getAdminSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("bibliography_contributors")
    .select("id, display_name, family_name, given_name, slug")
    .order("family_name", { ascending: true });

  if (error) {
    if (isSchemaShapeError(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []) as AdminBibliographyContributor[];
}
