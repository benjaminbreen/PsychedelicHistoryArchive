import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, FileText, Tag } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageShell } from "@/components/page/page-shell";
import { getCollectionSourcesFromSupabase } from "@/lib/supabase-archive";
import type { ArchiveSource } from "@/lib/types";

export const metadata: Metadata = {
  title: "Collections | The Psychedelic History Archive",
  description: "Curated groupings of sources from The Psychedelic History Archive."
};

type CollectionCard = {
  title: string;
  description: string;
  href: string;
  imagePath?: string;
  imageAlt?: string;
  imageTone?: "lab" | "botanical" | "clinical" | "cosmic" | "paper";
  sourceCount: number;
  dateRange: string;
  theme: string;
};

const collections: CollectionCard[] = [
  {
    title: "William James and Altered States",
    description: "James on mystical experience, nitrous oxide, and the varieties of religious experience.",
    href: "/archive?people=William%20James",
    imagePath: "/images/bios/william-james.webp",
    imageAlt: "Portrait of William James",
    sourceCount: 18,
    dateRange: "1880-1910",
    theme: "Psychology"
  },
  {
    title: "Cannabis Before Prohibition",
    description: "Nineteenth-century medical and policy writing on cannabis, before it was outlawed.",
    href: "/archive?tag=Cannabis",
    imageTone: "botanical",
    sourceCount: 22,
    dateRange: "1800-1930",
    theme: "Law, Medicine"
  },
  {
    title: "Peyote and Ethnography",
    description: "Early ethnographic accounts of peyote use, mostly written by outside observers.",
    href: "/archive?tag=Peyote",
    imageTone: "paper",
    sourceCount: 28,
    dateRange: "1880-1930",
    theme: "Anthropology"
  },
  {
    title: "Women in Psychedelic History",
    description: "Women researchers, therapists, and writers in twentieth-century psychedelic science.",
    href: "/archive?tag=Biography",
    imagePath: "/images/bios/eisner.webp",
    imageAlt: "Portrait of Betty Eisner",
    sourceCount: 16,
    dateRange: "1900-1970",
    theme: "Biography"
  },
  {
    title: "Nitrous Oxide and Consciousness",
    description: "Nitrous oxide in fairground demonstrations, surgical anesthesia, and mystical writing.",
    href: "/archive?tag=Nitrous%20Oxide",
    imagePath: "/images/sources/anaesthetic-revelation.jpg",
    imageAlt: "Cover detail for The Anaesthetic Revelation",
    sourceCount: 14,
    dateRange: "1790-1930",
    theme: "Medicine"
  },
  {
    title: "Psychiatry and Psychedelic Therapy",
    description: "Mid-century psychiatric research on LSD and mescaline as treatment tools.",
    href: "/archive?tag=Psychiatry",
    imageTone: "clinical",
    sourceCount: 27,
    dateRange: "1950-1975",
    theme: "Psychiatry"
  },
  {
    title: "Mysticism, Vision, and Experiment",
    description: "Where mystics, mediums, and laboratory experimenters met.",
    href: "/archive?tag=Mysticism",
    imageTone: "cosmic",
    sourceCount: 21,
    dateRange: "1600-1930",
    theme: "Religion"
  },
  {
    title: "The 1950s Psychedelic Revival",
    description: "Mescaline, LSD, and the first wave of postwar psychedelic research.",
    href: "/eras/1943-1962",
    imageTone: "cosmic",
    sourceCount: 23,
    dateRange: "1947-1960",
    theme: "History"
  }
];

const collectionsPerPage = 16;

type CollectionsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const params = await searchParams;
  const supabaseCollections = await getCollectionSourcesFromSupabase();
  const liveCollections = supabaseCollections.length ? supabaseCollections.map(collectionSourceToCard) : collections;
  const totalPages = Math.max(1, Math.ceil(liveCollections.length / collectionsPerPage));
  const currentPage = Math.min(parseCollectionPage(params.page), totalPages);
  const showFeaturedCollection = liveCollections.length >= 3 && currentPage === 1;
  const featured = showFeaturedCollection ? liveCollections[0] : undefined;
  const pageStart = (currentPage - 1) * collectionsPerPage;
  const pageEnd = currentPage * collectionsPerPage;
  const visibleCollections = showFeaturedCollection
    ? liveCollections.slice(1, pageEnd)
    : liveCollections.slice(pageStart, pageEnd);
  const shownStart = liveCollections.length ? pageStart + 1 : 0;
  const shownEnd = Math.min(pageEnd, liveCollections.length);

  return (
    <>
      <SiteHeader activeLabel="Collections" />
      <PageShell width="wide" className="py-8">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
          <div className="grid gap-5 lg:grid-cols-[minmax(14rem,16rem)_minmax(20rem,36rem)] lg:items-center xl:grid-cols-[minmax(16rem,19rem)_minmax(24rem,40rem)]">
            <h1 className="font-display text-[2.2rem] font-normal leading-none tracking-[-0.00em] text-archive-ink sm:text-[3.5rem]">
              Collections
            </h1>
            <p className="max-w-[32rem] text-[1rem] leading-7 text-archive-muted">
              Interpretive essays and curated groupings of sources that trace major themes, people, and episodes in psychedelic history.
            </p>
          </div>
          <div className="rounded-md border border-archive-line bg-archive-surface p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-archive-lavender text-archive-violet">
                <CalendarDays className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-[1.02rem] font-semibold text-archive-ink">{collectionCountLabel(liveCollections.length)}</span>
                <span className="mt-1 block text-sm text-archive-muted">Browse curated source groupings</span>
              </span>
            </div>
          </div>
        </header>

        <section className="mt-7">
          {featured && <FeaturedCollection collection={featured} />}
          <div className={featured ? "mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4" : "grid gap-3 md:grid-cols-2 xl:grid-cols-4"}>
            {visibleCollections.map((collection) => (
              <CollectionTile collection={collection} key={collection.title} />
            ))}
          </div>
        </section>

        <footer className="mt-6 grid gap-4 text-sm text-archive-muted md:grid-cols-[1fr_auto_1fr] md:items-center">
          <Link className="focus-ring inline-flex w-fit items-center gap-2 rounded-sm font-semibold text-archive-violet transition hover:text-archive-violetDark" href="/archive">
            Browse all sources <ArrowRight className="h-4 w-4" />
          </Link>
          {totalPages > 1 ? <Pagination currentPage={currentPage} pageCount={totalPages} /> : <span />}
          <span className="md:justify-self-end">{showingCollectionsLabel(shownStart, shownEnd, liveCollections.length)}</span>
        </footer>
      </PageShell>
      <SiteFooter />
    </>
  );
}

function collectionSourceToCard(source: ArchiveSource): CollectionCard {
  return {
    title: source.title,
    description: source.summary || source.excerpt || "Curated collection from the archive.",
    href: `/collections/${source.slug}`,
    imagePath: source.imagePath,
    imageAlt: source.imageAlt || source.title,
    imageTone: "paper",
    sourceCount: source.collectionItemCount ?? source.collectionItems?.length ?? 0,
    dateRange: source.displayDate,
    theme: source.subtitle || "Collection"
  };
}

function Pagination({ currentPage, pageCount }: { currentPage: number; pageCount: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <PaginationLink ariaLabel="Previous page" disabled={currentPage <= 1} href={collectionPageHref(currentPage - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </PaginationLink>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
        page === currentPage ? (
          <span className="grid h-10 w-10 place-items-center rounded border border-archive-violet bg-archive-lavender2 text-archive-violet" key={page}>
            {page}
          </span>
        ) : (
          <Link className="focus-ring grid h-10 w-10 place-items-center rounded border border-archive-line bg-archive-surface text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2" href={collectionPageHref(page)} key={page}>
            {page}
          </Link>
        )
      ))}
      <PaginationLink ariaLabel="Next page" disabled={currentPage >= pageCount} href={collectionPageHref(currentPage + 1)}>
        <ChevronRight className="h-4 w-4" />
      </PaginationLink>
    </div>
  );
}

function FeaturedCollection({ collection }: { collection: CollectionCard }) {
  return (
    <Link
      className="focus-ring group grid gap-6 rounded-md border border-archive-line bg-archive-surface p-3 shadow-sm transition duration-200 hover:border-archive-violet/35 hover:bg-[#FBF7EF] lg:grid-cols-[minmax(20rem,2rem)_1fr]"
      href={collection.href}
    >
      <CollectionImage collection={collection} className="aspect-[16/6] lg:aspect-[12/8]" featured />
      <span className="flex flex-col justify-center px-2 py-2">
        <span className="text-[0.8rem] font-bold uppercase tracking-[0.08em] text-archive-violet">
          Featured Collection
        </span>
        <span className="mt-3 block font-display text-[2rem] leading-none text-archive-ink transition group-hover:text-archive-violetDark sm:text-[2.25rem]">
          {collection.title}
        </span>
        <span className="mt-4 max-w-3xl text-[0.95rem] leading-6 text-archive-muted">
          {collection.description}
        </span>
        <CollectionMeta collection={collection} className="mt-4" />
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-archive-violet transition group-hover:text-archive-violetDark">
          Explore collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  );
}

function CollectionTile({ collection }: { collection: CollectionCard }) {
  return (
    <Link
      className="focus-ring group grid grid-cols-[7rem_1fr] gap-4 rounded-md border border-archive-line bg-archive-surface p-3 shadow-sm transition duration-200 hover:border-archive-violet/30 hover:bg-[#FBF7EF]"
      href={collection.href}
    >
      <CollectionImage collection={collection} className="" />
      <span className="min-w-0">
        <span className="line-clamp-2 block text-[1.02rem] font-semibold leading-snug text-archive-ink transition group-hover:text-archive-violetDark">
          {collection.title}
        </span>
        <span className="mt-1.5 line-clamp-3 block text-[0.82rem] leading-5 text-archive-muted">
          {collection.description}
        </span>
        <CollectionMeta collection={collection} className="mt-4" compact />
      </span>
    </Link>
  );
}

function CollectionMeta({ collection, className, compact = false }: { collection: CollectionCard; className?: string; compact?: boolean }) {
  const itemClass = compact ? "gap-1.5 text-[0.72rem]" : "gap-2 text-[0.82rem]";

  return (
    <span className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-archive-muted ${className ?? ""}`}>
      <span className={`inline-flex items-center ${itemClass}`}>
        <FileText className="h-3.5 w-3.5" />
        {collection.sourceCount} sources
      </span>
      <span className={`inline-flex items-center ${itemClass}`}>
        <CalendarDays className="h-3.5 w-3.5" />
        {collection.dateRange}
      </span>
      <span className={`inline-flex items-center ${itemClass}`}>
        <Tag className="h-3.5 w-3.5" />
        {collection.theme}
      </span>
    </span>
  );
}

function CollectionImage({ collection, className, featured = false }: { collection: CollectionCard; className: string; featured?: boolean }) {
  if (collection.imagePath) {
    return (
      <span className={`block overflow-hidden rounded-sm border border-archive-line bg-[#F4F1EC] ${className}`}>
        <img className="h-full w-full object-cover grayscale sepia-[0.12] transition duration-200 group-hover:scale-[1.02]" src={collection.imagePath} alt={collection.imageAlt ?? collection.title} />
      </span>
    );
  }

  const imageClass = imageToneClasses[collection.imageTone ?? "paper"];

  return (
    <span className={`relative block overflow-hidden rounded-sm border border-archive-line ${imageClass} ${className}`}>
      <span className="absolute inset-0 opacity-45 mix-blend-multiply [background-image:linear-gradient(90deg,rgba(23,20,23,.08)_1px,transparent_1px),linear-gradient(0deg,rgba(23,20,23,.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      {featured ? (
        <>
          <span className="absolute left-[8%] top-[22%] h-[54%] w-[18%] rounded-sm border border-archive-ink/20 bg-white/20" />
          <span className="absolute left-[33%] top-[14%] h-[64%] w-[13%] rounded-b-full border border-archive-ink/20 bg-white/20" />
          <span className="absolute right-[18%] top-[24%] h-[50%] w-[18%] rounded-sm border border-archive-ink/20 bg-white/15" />
          <span className="absolute inset-x-[7%] bottom-[16%] h-px bg-archive-ink/20" />
        </>
      ) : (
        <span className="absolute inset-[12%] rounded-sm border border-archive-ink/20 bg-white/20" />
      )}
    </span>
  );
}

function PaginationLink({ ariaLabel, children, disabled, href }: { ariaLabel: string; children: React.ReactNode; disabled?: boolean; href: string }) {
  if (disabled) {
    return (
      <span aria-label={ariaLabel} className="grid h-10 w-10 place-items-center rounded border border-archive-line bg-archive-surface text-archive-muted/60">
        {children}
      </span>
    );
  }

  return (
    <Link aria-label={ariaLabel} className="focus-ring grid h-10 w-10 place-items-center rounded border border-archive-line bg-archive-surface text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2" href={href}>
      {children}
    </Link>
  );
}

const imageToneClasses = {
  lab: "bg-[radial-gradient(circle_at_34%_30%,rgba(255,255,255,.35),transparent_15rem),linear-gradient(135deg,#4B4030,#B39D72_48%,#E2D2AA)]",
  botanical: "bg-[linear-gradient(135deg,#F5EFD9,#B7BD74_48%,#6F7F45)]",
  clinical: "bg-[linear-gradient(135deg,#F1EEE8,#B9B0A2_48%,#70665B)]",
  cosmic: "bg-[radial-gradient(circle_at_50%_45%,#E2B85B_0_10%,#2B4864_11%_28%,#743D52_29%_42%,#1D1B2E_43%)]",
  paper: "bg-[linear-gradient(135deg,#F8F1DF,#D1BE91_48%,#7F7055)]"
};

function collectionCountLabel(count: number) {
  return `${count} ${count === 1 ? "collection" : "collections"}`;
}

function collectionPageHref(page: number) {
  return page <= 1 ? "/collections" : `/collections?page=${page}`;
}

function parseCollectionPage(value?: string) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function showingCollectionsLabel(start: number, end: number, total: number) {
  if (!total) return "Showing 0 collections";
  if (start === 1 && end >= total) return `Showing ${collectionCountLabel(total)}`;
  return `Showing ${start}-${end} of ${collectionCountLabel(total)}`;
}
