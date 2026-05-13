import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Copy, Download, ExternalLink, Share2 } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SourceImage } from "@/components/source-image";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { getArchiveSourceFromSupabase } from "@/lib/supabase-archive";
import type { ArchiveSource } from "@/lib/types";

export const dynamic = "force-dynamic";

type SourcePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SourcePage({ params }: SourcePageProps) {
  const { slug } = await params;
  const source = await getArchiveSourceFromSupabase(slug);

  if (!source) notFound();

  const isExternal = source.accessType === "external";

  if (!isExternal) {
    return <HostedSourcePage source={source} />;
  }

  return (
    <>
      <SiteHeader variant="source" />
      <main className="container-page py-8">
        <Link className="focus-ring mb-8 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-archive-muted hover:text-archive-violet" href="/archive">
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_23rem] xl:grid-cols-[1fr_26rem]">
          <div>
            <div className="display-label text-sm text-archive-muted">
              {source.type}, {source.era}
            </div>
            <h1 className="mt-8 max-w-4xl text-archive-ink">
              <span className="display-title text-[2.4rem] sm:text-[2.7rem]">
                {source.displayDate}: {source.title}
              </span>
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-archive-muted">
              {source.summary}
            </p>

            <div className="mt-6 grid gap-4 border-y border-archive-line py-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <Metadata label="Date" value={source.displayDate} />
              <Metadata label="Type" value={source.type} />
              <Metadata label="Region" value={source.region} />
              <Metadata label="Language" value={source.language} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {source.tags.map((tag, index) => (
                <Chip href={`/archive?tag=${encodeURIComponent(tag)}`} key={tag} tone={index === 2 ? "lavender" : "neutral"}>
                  {tag}
                </Chip>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={source.sourceUrl} variant={isExternal ? "primary" : "outline"}>
                <ExternalLink className="h-4 w-4" />
                {isExternal ? "View external source" : "View original source"}
              </ButtonLink>
              {!isExternal && (
                <ButtonLink href="#" variant="primary">
                  <Download className="h-4 w-4" />
                  Download PDF
                </ButtonLink>
              )}
            </div>

            <div className="mt-9 border-b border-archive-line">
              <div className="flex gap-8">
                <span className="border-b-2 border-archive-violet px-1 py-3 text-sm font-semibold text-archive-violet">
                  {isExternal ? "Overview" : "Transcript"}
                </span>
                <span className="px-1 py-3 text-sm font-medium text-archive-muted">
                  {isExternal ? "Details" : "Original source"}
                </span>
                {!isExternal && <span className="px-1 py-3 text-sm font-medium text-archive-muted">Details</span>}
              </div>
            </div>

            <section className="mt-6 rounded-md border border-archive-line bg-white p-5 text-sm leading-6 shadow-[0_8px_24px_rgba(23,20,23,0.035)]">
              <strong>{isExternal ? "Externally hosted source." : "You are in transcript reading mode."}</strong>{" "}
              {isExternal
                ? "The archive records this source and links to the holding repository for access."
                : "This is a text-only version of the source for easier reading and search."}{" "}
              <Link className="font-semibold text-archive-violet" href={source.sourceUrl}>
                {isExternal ? "View at source site" : "View original source"}
              </Link>
            </section>

            <section className="mt-8 max-w-[49rem]">
              <h2 className="font-serif text-3xl font-semibold">
                {isExternal ? "Selected excerpt" : "Transcript"}
              </h2>
              <blockquote className="mt-5 border-l-2 border-archive-violet pl-5 font-serif text-2xl leading-[1.65] text-archive-ink">
                “{source.excerpt}”
              </blockquote>
              <p className="mt-6 font-serif text-xl leading-[1.8] text-archive-ink">
                This first implementation uses structured seed data from the nitrous
                oxide and ether source folder. Full page-level OCR, page anchors, and
                image/PDF viewers are planned for the Supabase-backed version.
              </p>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-[#E6DFD4] bg-[#FBF8F1] p-5 shadow-[0_10px_28px_rgba(57,45,31,0.035)]">
              <div className="grid grid-cols-[6rem_1fr] gap-4">
                <SourceImage className="aspect-[4/5] w-full" source={source} />
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#756D5F]">
                    {source.type}
                  </div>
                  <p className="mt-2 font-semibold">Published in</p>
                  <p className="mt-2 italic text-archive-muted">{source.author}</p>
                  <p className="mt-2 text-sm text-archive-muted">{source.displayDate}</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-archive-line bg-white shadow-[0_10px_28px_rgba(23,20,23,0.025)]">
              <div className="p-5">
                <h2 className="source-serif-heading">Source details</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <Detail label="Citation" value={source.citation} />
                  <Detail label="Archive ID" value={source.id} />
                  <Detail label="Rights" value={source.rights} />
                  <Detail label="Access" value={isExternal ? "Hosted externally" : "Hosted by archive"} />
                </dl>
              </div>
              <ActionRow icon={<Copy className="h-5 w-5" />} label="Copy citation" />
              {!isExternal && <ActionRow icon={<Download className="h-5 w-5" />} label="Download PDF" meta="PDF" />}
              <ActionRow icon={<Share2 className="h-5 w-5" />} label="Share" />
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function HostedSourcePage({ source }: { source: ArchiveSource }) {
  const transcript = getTranscriptPreview(source);

  return (
    <>
      <SiteHeader variant="source" />
      <main className="container-page py-6">
        <div className="mb-5 flex items-center gap-3 text-sm text-archive-muted">
          <Link className="font-semibold text-archive-violet" href="/archive?medium=Text">
            Text
          </Link>
          <span>/</span>
          <Link href="/archive?era=1800-1950">1800-1950</Link>
          <span>/</span>
          <Link href={`/archive?type=${encodeURIComponent(source.type)}`}>{source.type}s</Link>
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_13.5rem] xl:items-start">
              <div>
                <h1 className="text-archive-ink">
                  <span className="source-display-title">
                    {source.displayDate}: {source.title}
                  </span>
                </h1>
                <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#6B6470]">
                  A transcript of {source.author}&rsquo;s published reflections on {source.substances[0] ?? "altered states"} and consciousness.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 xl:flex-col xl:items-stretch xl:pt-7">
                <ButtonLink className="xl:w-full" href={source.sourceUrl} variant="outline">
                  <ExternalLink className="h-4 w-4" />
                  View original source
                </ButtonLink>
                <ButtonLink className="xl:w-full" href="#" variant="primary">
                  <Download className="h-4 w-4" />
                  Download PDF
                </ButtonLink>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-start text-sm">
              <MetaCell label="Date" value={source.displayDate} />
              <MetaCell label="Type" value={source.type} />
              <MetaCell label="Person" value={source.people[0] ?? source.author} />
              <div className="border-l border-archive-line pl-5">
                <div className="text-[0.62rem] font-bold uppercase tracking-[0.09em] text-archive-muted">Tags</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {source.tags.map((tag) => (
                    <Chip href={`/archive?tag=${encodeURIComponent(tag)}`} key={tag} tone={tagTone(tag)}>
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 border-b border-archive-line">
              <div className="flex gap-8">
                <span className="border-b-2 border-archive-violet px-1 py-2.5 text-sm font-semibold text-archive-violet">
                  Transcript
                </span>
                <span className="px-1 py-2.5 text-sm font-medium text-archive-muted">
                  Original source
                </span>
              </div>
            </div>

            <section className="mt-5 flex gap-4 rounded-md border border-archive-line bg-white px-5 py-3.5 text-sm leading-6 shadow-[0_8px_24px_rgba(23,20,23,0.035)]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-200 bg-white text-archive-violet">
                <BookOpen className="h-4 w-4" />
              </span>
              <div>
                <p>
                  <strong>You are in transcript reading mode.</strong> This is a text-only version of the source for easier reading and search.
                </p>
                <p className="mt-1">
                  Looking for the scanned original?{" "}
                  <Link className="font-semibold text-archive-violet" href={source.sourceUrl}>
                    View original source <ExternalLink className="inline h-3.5 w-3.5" />
                  </Link>
                </p>
              </div>
            </section>

            <section className="mt-6 max-w-[49rem]">
              <h2 className="source-transcript-heading">Transcript</h2>
              <div className="source-transcript mt-5 space-y-6 text-archive-ink">
                {transcript.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-[#E6DFD4] bg-[#FBF8F1] p-4 shadow-[0_10px_28px_rgba(57,45,31,0.035)]">
              <div className="grid grid-cols-[5rem_1fr] gap-4">
                <SourceImage className="aspect-[4/5] w-full" source={source} />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#756D5F]">
                    {source.type}
                  </div>
                  <p className="mt-2 font-semibold">Published in</p>
                  <p className="mt-2 font-serif italic text-archive-ink">{publicationLabel(source)}</p>
                  <p className="mt-2 text-sm text-archive-muted">{source.displayDate}</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-archive-line bg-white shadow-[0_10px_28px_rgba(23,20,23,0.025)]">
              <div className="p-4">
                <h2 className="source-serif-heading">Source details</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <Detail label="Citation" value={source.citation} />
                  <Detail label="Archive ID" value={`T-1800-1950-${source.id.slice(0, 3).toUpperCase()}`} />
                  <Detail label="Language" value={source.language} />
                  <Detail label="Rights" value={source.rights} />
                  <Detail label="Abstract" value={source.summary} />
                </dl>
              </div>
              <ActionRow icon={<Download className="h-5 w-5" />} label="Download PDF" meta="PDF" />
              <ActionRow icon={<Share2 className="h-5 w-5" />} label="Share" />
              <ActionRow icon={<BookOpen className="h-5 w-5" />} label="Related sources" />
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="pr-5 border-l border-archive-line pl-5 first:border-l-0 first:pl-0">
      <div className="text-[0.62rem] font-bold uppercase tracking-[0.09em] text-archive-muted">{label}</div>
      <div className="mt-1 text-[13px] font-medium">{value}</div>
    </div>
  );
}

const TAG_TONES: Record<string, "lavender" | "olive" | "sand" | "rose" | "neutral"> = {
  "Nitrous Oxide": "lavender",
  "Consciousness": "olive",
  "Altered States": "sand",
  "Psychology": "rose",
  "Mysticism": "lavender",
  "William James": "olive"
};

function tagTone(tag: string) {
  return TAG_TONES[tag] ?? "neutral";
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5.4rem_1fr] gap-3 border-b border-archive-line/80 pb-3 last:border-b-0">
      <dt className="text-[13px] font-semibold text-archive-ink">{label}</dt>
      <dd className="text-[13px] leading-5 text-[#6B6470]">{value}</dd>
    </div>
  );
}

function ActionRow({ icon, label, meta }: { icon: React.ReactNode; label: string; meta?: string }) {
  return (
    <button className="focus-ring flex w-full items-center justify-between border-t border-archive-line px-5 py-4 text-left transition hover:bg-archive-paper" type="button">
      <span className="flex items-center gap-3 text-archive-ink">
        {icon}
        <span className="font-medium">{label}</span>
      </span>
      {meta && <span className="text-xs text-archive-muted">{meta}</span>}
    </button>
  );
}

function publicationLabel(source: ArchiveSource) {
  if (source.id === "james_1882_subjective_effects_nitrous_oxide") {
    return "The Popular Science Monthly";
  }

  if (source.id === "james_1898_consciousness_under_nitrous_oxide") {
    return "Psychological Review";
  }

  return source.author;
}

function getTranscriptPreview(source: ArchiveSource) {
  if (source.transcript) {
    return source.transcript
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .slice(0, 24);
  }

  const sourceId = source.id;

  if (sourceId.includes("-")) {
    return [
      "No transcript text is available yet for this source. Check the source details and original source link for current access."
    ];
  }

  if (sourceId === "james_1882_subjective_effects_nitrous_oxide") {
    return [
      "Some observations of the effects of nitrous-oxide-gas-intoxication which I was prompted to make by reading the pamphlet called The anaesthetic revelation and the gist of philosophy, have made me understand better than ever before both the strength and the weakness of Hegel's philosophy.",
      "With me, as with every other person of whom I have heard, the keynote of the experience is the tremendously exciting sense of an intense metaphysical illumination. Truth lies open to the view in depth beneath depth of almost blinding evidence.",
      "The mind sees all the logical relations of being with an apparent subtlety and instantaneity to which its normal consciousness offers no parallel; only as sobriety returns, the feeling of insight fades.",
      "The immense emotional sense of reconciliation which characterizes the maudlin stage of alcoholic drunkenness is well-known. The centre and periphery of things seem to come together. The ego and its objects, the meum and the tuum, are one."
    ];
  }

  if (sourceId === "james_1898_consciousness_under_nitrous_oxide") {
    return [
      "An English correspondent sends me the following account of his subjective experiences during nitrous-oxide intoxication. I place it, with his permission, on record in the Psychological Review.",
      "One morning in June, 1895, or certainly not later than the end of May, I went round to a dentist's opposite Balliol College, to have a tooth out. I had never taken gas before, and never have since.",
      "The next experience I became aware of, who shall relate! my God! I knew everything! A vast inrush of obvious and absolutely satisfying solutions to all possible problems overwhelmed my entire being.",
      "The truth had evaporated, like a forgotten dream, and left me with half-formed phrases on my lips and an ashen-gray delight in my heart."
    ];
  }

  return [
    sourceId,
    "This hosted source has a local transcript in the project corpus. The production reader will load the complete text with page anchors, OCR snippets, and links to scanned source images where available."
  ];
}
