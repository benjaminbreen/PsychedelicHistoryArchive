import type { MetadataRoute } from "next";
import { biographyProfiles, canonicalizePersonName, isDisplayableBiographyName, slugifyPersonName } from "@/lib/biographies";
import { ERAS } from "@/lib/eras";
import { absoluteUrl } from "@/lib/seo";
import { getArchiveSourcesFromSupabase, getCollectionSourcesFromSupabase } from "@/lib/supabase-archive";

export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

const staticRoutes: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/archive", priority: 0.95 },
  { path: "/collections", priority: 0.75 },
  { path: "/people", priority: 0.75 },
  { path: "/topics", priority: 0.75 },
  { path: "/eras", priority: 0.75 },
  { path: "/about", priority: 0.6 },
  { path: "/further-reading", priority: 0.55 },
  { path: "/faq", priority: 0.45 },
  { path: "/submit-a-source", priority: 0.35 }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sources, collections] = await Promise.all([
    getArchiveSourcesFromSupabase(),
    getCollectionSourcesFromSupabase()
  ]);

  const sourceEntries = sources.map((source) =>
    sitemapEntry(`/archive/${source.slug}`, {
      lastModified: dateOrUndefined(source.addedDate),
      priority: source.sourceKind === "collection_item" ? 0.72 : 0.82
    })
  );

  const collectionEntries = collections.map((collection) =>
    sitemapEntry(`/collections/${collection.slug}`, {
      priority: 0.78
    })
  );

  const biographySlugs = new Set<string>(biographyProfiles.map((profile) => profile.slug));
  for (const source of sources) {
    for (const person of source.people) {
      const canonicalName = canonicalizePersonName(person);
      if (isDisplayableBiographyName(canonicalName)) {
        biographySlugs.add(slugifyPersonName(canonicalName));
      }
    }
  }

  const biographyEntries = [...biographySlugs].sort().map((slug) =>
    sitemapEntry(`/biographies/${slug}`, {
      priority: 0.68
    })
  );

  const eraEntries = ERAS.map((era) =>
    sitemapEntry(`/eras/${era.slug}`, {
      priority: 0.68
    })
  );

  return [
    ...staticRoutes.map((route) => sitemapEntry(route.path, { priority: route.priority })),
    ...sourceEntries,
    ...collectionEntries,
    ...biographyEntries,
    ...eraEntries
  ];
}

function sitemapEntry(
  path: string,
  {
    lastModified,
    priority
  }: {
    lastModified?: Date;
    priority: number;
  }
): SitemapEntry {
  return {
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "weekly",
    priority
  };
}

function dateOrUndefined(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
