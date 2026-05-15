import type { Metadata } from "next";
import type { ArchiveSource } from "@/lib/types";

export const SITE_NAME = "The Psychedelic History Archive";
export const DEFAULT_SITE_DESCRIPTION =
  "A scholarly record of primary sources, biographies, images, audio, and personal histories documenting psychedelic history and altered states.";

const FALLBACK_SITE_URL = "https://www.psychedelicarchive.com";

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
