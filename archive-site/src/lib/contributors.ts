import { getSupabaseClient } from "@/lib/supabase";

export type Contribution = { kind: "Biography" | "Historical context essay"; title: string; href: string };

// Published writing credited to project people, keyed by their project_people slug: biographies
// with an author_slug, and historical-context essays whose front matter names an author_slug.
export async function listContributionsByAuthor(): Promise<Map<string, Contribution[]>> {
  const byAuthor = new Map<string, Contribution[]>();
  const supabase = getSupabaseClient();
  if (!supabase) return byAuthor;

  const add = (slug: string, contribution: Contribution) => {
    byAuthor.set(slug, [...(byAuthor.get(slug) ?? []), contribution]);
  };

  const [biographies, essays] = await Promise.all([
    supabase.from("biography_profiles").select("slug, name, author_slug").eq("status", "published").not("author_slug", "is", null).order("name"),
    supabase
      .from("document_sections")
      .select("body, documents!inner(slug, title, status)")
      .eq("section_type", "historical_context")
      .eq("documents.status", "published")
      .like("body", "%author_slug:%")
  ]);

  for (const row of (biographies.data ?? []) as Array<{ slug: string; name: string; author_slug: string }>) {
    add(row.author_slug, { kind: "Biography", title: row.name, href: `/biographies/${row.slug}` });
  }

  for (const row of (essays.data ?? []) as unknown as Array<{ body: string; documents: { slug: string; title: string } | { slug: string; title: string }[] }>) {
    const authorSlug = row.body.match(/^---[\s\S]*?^author_slug:\s*(\S+)\s*$/m)?.[1];
    const document = Array.isArray(row.documents) ? row.documents[0] : row.documents;
    if (authorSlug && document) add(authorSlug, { kind: "Historical context essay", title: document.title, href: `/archive/${document.slug}` });
  }

  return byAuthor;
}

export function contributorHref(slug: string) {
  return `/contributors/${slug}`;
}
