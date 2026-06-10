import type { Metadata } from "next";
import { createElement } from "react";
import type { BiographyProfile } from "@/lib/biographies";
import type { ArchiveSource } from "@/lib/types";

export const SITE_NAME = "The Psychedelic History Archive";
export const DEFAULT_SITE_DESCRIPTION =
  "A scholarly record of primary sources, biographies, images, audio, and personal histories documenting psychedelic history and altered states.";

const FALLBACK_SITE_URL = "https://www.psychedelicarchive.com";

type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];
type JsonLdObject = {
  [key: string]: JsonLdValue | undefined;
};

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    FALLBACK_SITE_URL;
  const withProtocol = configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;

  return withProtocol.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function canonicalPath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function seoDescription(value?: string, fallback = DEFAULT_SITE_DESCRIPTION) {
  const cleaned = (value || fallback)
    .replace(/<[^>]*>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();

  if (cleaned.length <= 160) return cleaned;

  return `${cleaned.slice(0, 157).trimEnd()}...`;
}

export function sourceImageMetadata(source: ArchiveSource) {
  if (!source.imagePath) return undefined;

  return [
    {
      url: source.imagePath,
      alt: source.imageAlt || source.title
    }
  ];
}

export function publicMetadata({
  title,
  description,
  path,
  image
}: {
  title: string;
  description: string;
  path: string;
  image?: NonNullable<Metadata["openGraph"]>["images"];
}): Metadata {
  const canonical = canonicalPath(path);

  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: image,
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image
    }
  };
}

export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, "\\u003c")
    }
  });
}

export function buildWebSiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: DEFAULT_SITE_DESCRIPTION,
    publisher: organizationJsonLd(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function buildSourceJsonLd(source: ArchiveSource): JsonLdObject {
  const url = absoluteUrl(`/archive/${source.slug}`);
  const schemaType = sourceSchemaType(source);
  const creators = source.creators?.length
    ? source.creators.map((creator) => creatorJsonLd(creator.name))
    : source.author
      ? [creatorJsonLd(source.author)]
      : undefined;
  const image = source.imagePath ? [source.imagePath] : undefined;
  const base: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": `${url}#source`,
    name: source.title,
    headline: ["Article", "NewsArticle"].includes(schemaType) ? source.title : undefined,
    description: seoDescription(source.summary || source.excerpt),
    url,
    image,
    thumbnailUrl: source.imagePath,
    datePublished: source.displayDate,
    inLanguage: source.language,
    genre: source.type,
    keywords: source.tags.length ? source.tags.join(", ") : undefined,
    creator: creators,
    author: creators,
    publisher: organizationJsonLd(),
    isPartOf: webSiteReference(),
    isAccessibleForFree: true,
    citation: source.citation || undefined,
    conditionsOfAccess: source.rights || undefined,
    usageInfo: source.rights || undefined,
    sameAs: isHttpUrl(source.sourceUrl) ? source.sourceUrl : undefined,
    about: [
      ...source.tags.map((tag) => thingJsonLd(tag)),
      ...source.people.map((name) => creatorJsonLd(name))
    ]
  };

  if (schemaType === "VideoObject") {
    return {
      ...base,
      uploadDate: source.addedDate || source.displayDate,
      embedUrl: source.mediaEmbedUrl || undefined,
      contentUrl: isHttpUrl(source.sourceUrl) ? source.sourceUrl : undefined,
      thumbnailUrl: source.imagePath
    };
  }

  if (schemaType === "AudioObject") {
    return {
      ...base,
      contentUrl: isHttpUrl(source.sourceUrl) ? source.sourceUrl : undefined,
      encodingFormat: source.files?.find((file) => file.mimeType)?.mimeType
    };
  }

  return base;
}

export function buildCollectionJsonLd(source: ArchiveSource): JsonLdObject {
  const url = absoluteUrl(`/collections/${source.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    name: source.title,
    description: seoDescription(source.summary, "A curated collection in The Psychedelic History Archive."),
    url,
    image: source.imagePath ? [source.imagePath] : undefined,
    isPartOf: webSiteReference(),
    publisher: organizationJsonLd(),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: source.collectionItemCount ?? source.collectionItems?.length ?? 0,
      itemListElement: source.collectionItems?.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(item.href || `/archive/${item.slug}`),
        name: item.title
      }))
    }
  };
}

export function buildPersonJsonLd(profile: BiographyProfile, relatedSources: ArchiveSource[]): JsonLdObject {
  const url = absoluteUrl(`/biographies/${profile.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name: profile.name,
    description: seoDescription(profile.dek || profile.paragraphs[0], `${profile.name} appears in The Psychedelic History Archive.`),
    url,
    image: profile.imagePath ? absoluteUrl(profile.imagePath) : undefined,
    knowsAbout: profile.tags,
    subjectOf: relatedSources.slice(0, 10).map((source) => ({
      "@type": sourceSchemaType(source),
      name: source.title,
      url: absoluteUrl(`/archive/${source.slug}`),
      datePublished: source.displayDate
    }))
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

function sourceSchemaType(source: ArchiveSource) {
  if (source.type === "Film" || source.readerMode === "video" || source.mediaEmbedUrl) return "VideoObject";
  if (source.medium === "Audio/Video" || source.readerMode === "audio") return "AudioObject";
  if (source.type === "Book") return "Book";
  if (["Academic Article", "Essay", "Newspaper Article"].includes(source.type)) return "Article";

  return "CreativeWork";
}

function organizationJsonLd(): JsonLdObject {
  return {
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: absoluteUrl("/")
  };
}

function webSiteReference(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME
  };
}

function personJsonLd(name: string): JsonLdObject {
  return {
    "@type": "Person",
    name
  };
}

function creatorJsonLd(name: string): JsonLdObject {
  if (name === SITE_NAME || /archive|press|university|institute|center|centre|library|museum|company|co\./i.test(name)) {
    return {
      "@type": "Organization",
      name
    };
  }

  return personJsonLd(name);
}

function thingJsonLd(name: string): JsonLdObject {
  return {
    "@type": "Thing",
    name
  };
}

function isHttpUrl(value?: string) {
  return Boolean(value && /^https?:\/\//i.test(value));
}
