import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownUp, ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, FileText, Search, Tag } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageShell } from "@/components/page/page-shell";

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

const featuredCollection: CollectionCard = {
  title: "The Birth of Psychedelic Inquiry",
  description:
    "From nineteenth-century investigations of altered states to early twentieth-century experiments in psychology, pharmacology, and spiritual experience.",
  href: "/archive?medium=Text&era=1800-1950",
  imageTone: "lab",
  sourceCount: 36,
  dateRange: "1800-1930",
  theme: "Science, Psychology"
};

const collections: CollectionCard[] = [
  {
    title: "William James and Altered States",
    description: "Writings on mystical experience, consciousness, and the varieties of religious experience.",
    href: "/archive?people=William%20James",
    imagePath: "/images/bios/william-james.webp",
    imageAlt: "Portrait of William James",
    sourceCount: 18,
    dateRange: "1880-1910",
    theme: "Psychology"
  },
  {
    title: "Cannabis Before Prohibition",
    description: "Medical texts, cultural accounts, and policy debates on cannabis in the nineteenth century.",
    href: "/archive?tag=Cannabis",
    imageTone: "botanical",
    sourceCount: 22,
    dateRange: "1800-1930",
    theme: "Law, Medicine"
  },
  {
    title: "Peyote and Ethnography",
    description: "Early ethnographic reports, ceremonial accounts, and cross-cultural interpretations.",
    href: "/archive?tag=Peyote",
    imageTone: "paper",
    sourceCount: 28,
    dateRange: "1880-1930",
    theme: "Anthropology"
  },
  {
    title: "Women in Psychedelic History",
    description: "Pioneering women researchers, therapists, and writers whose work shaped the field.",
    href: "/archive?tag=Biography",
    imagePath: "/images/bios/eisner.webp",
    imageAlt: "Portrait of Betty Eisner",
    sourceCount: 16,
    dateRange: "1900-1970",
    theme: "Biography"
  },
  {
    title: "Nitrous Oxide and Consciousness",
    description: "From recreational use to clinical experiments in anesthesia and mystical experience.",
    href: "/archive?tag=Nitrous%20Oxide",
    imagePath: "/images/sources/anaesthetic-revelation.jpg",
    imageAlt: "Cover detail for The Anaesthetic Revelation",
    sourceCount: 14,
    dateRange: "1790-1930",
    theme: "Medicine"
  },
  {
    title: "Psychiatry and Psychedelic Therapy",
    description: "Clinical research, case studies, and debates in mid-century psychiatry.",
    href: "/archive?tag=Psychiatry",
    imageTone: "clinical",
    sourceCount: 27,
    dateRange: "1950-1975",
    theme: "Psychiatry"
  },
  {
    title: "Mysticism, Vision, and Experiment",
    description: "The intersection of spiritual traditions and experimental explorations of the mind.",
    href: "/archive?tag=Mysticism",
    imageTone: "cosmic",
    sourceCount: 21,
    dateRange: "1600-1930",
    theme: "Religion"
  },
  {
    title: "The 1950s Psychedelic Revival",
    description: "Key experiments, researchers, and publications of the first psychedelic renaissance.",
    href: "/archive?era=1950-1970",
    imageTone: "cosmic",
    sourceCount: 23,
    dateRange: "1947-1960",
    theme: "History"
  }
];

const collectionsPerPage = 16;
const visibleCollections = collections.slice(0, collectionsPerPage);
const totalPages = Math.ceil(collections.length / collectionsPerPage);

export default function CollectionsPage() {
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
                <span className="block text-[1.02rem] font-semibold text-archive-ink">{collections.length} collections</span>
                <span className="mt-1 block text-sm text-archive-muted">Explore our curated groupings</span>
              </span>
            </div>
          </div>
        </header>

        <section className="mt-7 rounded-md border border-archive-line bg-archive-surface/70 p-3 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[minmax(20rem,1fr)_13rem_10rem_12rem_10rem]">
            <div className="flex min-h-11 items-center gap-3 rounded-md border border-archive-line bg-archive-surface px-3.5 text-[0.86rem] text-archive-muted">
              <Search className="h-4 w-4" />
              <span>Search collections by title, theme, person, or keyword...</span>
            </div>
            <FilterButton icon={<ArrowDownUp className="h-4 w-4" />} label="Sort by: Newest" />
            <FilterButton icon={<CalendarDays className="h-4 w-4" />} label="Era: All" />
            <FilterButton icon={<Tag className="h-4 w-4" />} label="Theme: All" />
            <FilterButton icon={<FileText className="h-4 w-4" />} label="Type: All" />
          </div>
        </section>

        <section className="mt-4">
          <FeaturedCollection collection={featuredCollection} />
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {visibleCollections.map((collection) => (
              <CollectionTile collection={collection} key={collection.title} />
            ))}
          </div>
        </section>

        <footer className="mt-6 grid gap-4 text-sm text-archive-muted md:grid-cols-[1fr_auto_1fr] md:items-center">
          <Link className="focus-ring inline-flex w-fit items-center gap-2 rounded-sm font-semibold text-archive-violet transition hover:text-archive-violetDark" href="/archive">
            View all collections <ArrowRight className="h-4 w-4" />
          </Link>
          {totalPages > 1 ? <Pagination pageCount={totalPages} /> : <span />}
          <span className="md:justify-self-end">Showing 1-{visibleCollections.length} of {collections.length} collections</span>
        </footer>
      </PageShell>
      <SiteFooter />
    </>
  );
}

function Pagination({ pageCount }: { pageCount: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <PaginationButton ariaLabel="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </PaginationButton>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
        <span
          className={page === 1 ? "grid h-10 w-10 place-items-center rounded border border-archive-violet bg-archive-lavender2 text-archive-violet" : "grid h-10 w-10 place-items-center rounded border border-archive-line bg-archive-surface text-archive-ink"}
          key={page}
        >
          {page}
        </span>
      ))}
      <PaginationButton ariaLabel="Next page">
        <ChevronRight className="h-4 w-4" />
      </PaginationButton>
    </div>
  );
}

function FilterButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="focus-ring inline-flex min-h-11 items-center justify-between gap-3 rounded-md border border-archive-line bg-archive-surface px-4 text-[0.86rem] font-semibold text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2" type="button">
      <span className="inline-flex items-center gap-3">
        <span className="text-archive-violet">{icon}</span>
        {label}
      </span>
      <ChevronDown className="h-4 w-4 text-archive-muted" />
    </button>
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

function PaginationButton({ ariaLabel, children }: { ariaLabel: string; children: React.ReactNode }) {
  return (
    <button aria-label={ariaLabel} className="focus-ring grid h-10 w-10 place-items-center rounded border border-archive-line bg-archive-surface text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2" type="button">
      {children}
    </button>
  );
}

const imageToneClasses = {
  lab: "bg-[radial-gradient(circle_at_34%_30%,rgba(255,255,255,.35),transparent_15rem),linear-gradient(135deg,#4B4030,#B39D72_48%,#E2D2AA)]",
  botanical: "bg-[linear-gradient(135deg,#F5EFD9,#B7BD74_48%,#6F7F45)]",
  clinical: "bg-[linear-gradient(135deg,#F1EEE8,#B9B0A2_48%,#70665B)]",
  cosmic: "bg-[radial-gradient(circle_at_50%_45%,#E2B85B_0_10%,#2B4864_11%_28%,#743D52_29%_42%,#1D1B2E_43%)]",
  paper: "bg-[linear-gradient(135deg,#F8F1DF,#D1BE91_48%,#7F7055)]"
};
