"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { BookOpen, Check, ChevronLeft, ChevronRight, Columns2, Copy, Download, ExternalLink, FileText, Headphones, Image as ImageIcon, Layers, Link2, Play, Quote, ScrollText, Share2, WrapText, X } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { CollectionOverview, ExternalSourceViewer, HistoricalContextByline, MediaSourceViewer, TranscriptReader, TranslationReader } from "@/components/source-reader-tabs";
import { Lightbox } from "@/components/reader/lightbox";
import { buildReaderModel, creatorNames, sectionText, sourceCitation, sourceUrl, textStatus, type LineatedPage, type ReaderView } from "@/lib/reader-model";
import { isAudioFile, isPdfFile, isVideoFile } from "@/lib/source-reader";
import { getSourceTitleParts } from "@/lib/source-title";
import { sourceKicker } from "@/lib/display-date";
import type { ArchiveSource, TranscriptSection } from "@/lib/types";
import styles from "./reader.module.css";

export type RelatedItem = { id: string; slug: string; title: string; type: string; displayDate: string; relatedReason: string };
type Selection = { page: number; a: number; b: number } | null;

const topicHref = (tag: string) => `/archive?tag=${encodeURIComponent(tag)}`;

// stickyTop: height of any sticky header above the reader (the public site header by default).
export function SourceReader({ source, transcript, related = [], biographyHrefs = {}, children, stickyTop = "calc(4.9rem + 1px)" }: { source: ArchiveSource; transcript: string[]; related?: RelatedItem[]; biographyHrefs?: Record<string, string>; children?: ReactNode; stickyTop?: string }) {
  const model = useMemo(() => buildReaderModel(source, transcript), [source, transcript]);
  const status = useMemo(() => textStatus(source, model), [source, model]);
  const titleParts = getSourceTitleParts(source);
  const pdf = source.files?.find(isPdfFile);
  const pageCount = model.lineated?.length || model.pages.length;
  const thumbs = model.pages.map(p => p.thumbnailPath || p.imagePath || "");
  const stackImages = (thumbs.filter(Boolean).length ? thumbs.filter(Boolean) : source.imagePath ? [source.imagePath] : []).slice(0, 3);
  const firstText = model.textViews[0].id;

  const [view, setView] = useState<ReaderView>(firstText);
  const [page, setPage] = useState(1);
  const [reflow, setReflow] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [sel, setSel] = useState<Selection>(null);
  const [sheet, setSheet] = useState<"cite" | "pages" | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [progress, setProgress] = useState(0);
  const [origin, setOrigin] = useState<string | undefined>();
  const [stackFailed, setStackFailed] = useState(false);
  const pageRefs = useRef<(HTMLElement | null)[]>([]);
  const scanRefs = useRef<(HTMLElement | null)[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const pageRef = useRef(page);
  pageRef.current = page;

  const views = useMemo(() => {
    const list: { id: ReaderView; label: string; icon: typeof BookOpen }[] = model.textViews.map(v => ({ id: v.id, label: v.label, icon: v.id === "overview" ? FileText : BookOpen }));
    if (model.canCompare && !narrow) list.push({ id: "compare", label: "Side by side", icon: Columns2 });
    if (model.original.kind !== "none") list.push({ id: "original", label: model.original.label, icon: model.original.kind === "audio" ? Headphones : model.original.kind === "video" ? Play : model.original.kind === "external" ? ExternalLink : ImageIcon });
    return list;
  }, [model, narrow]);

  // Phones reflow numbered typescripts: typed line breaks wrap badly at 390px.
  useEffect(() => {
    setOrigin(location.origin);
    const mq = matchMedia("(max-width: 899px)");
    const apply = () => { setNarrow(mq.matches); if (mq.matches) setView(v => (v === "compare" ? firstText : v)); };
    apply(); setReflow(mq.matches);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [firstText]);

  // Deep links: #p2.4-9 selects lines; ?view= and the older ?page= links still work.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get("view");
    if (requested && views.some(v => v.id === requested)) setView(requested as ReaderView);
    if (params.get("page") && !model.lineated && model.original.kind !== "none") { setView("original"); setPage(Number(params.get("page")) || 1); }
    const m = location.hash.match(/^#p(\d+)(?:\.(\d+)(?:-(\d+))?)?$/);
    if (!m || !model.lineated) return;
    const p = Number(m[1]);
    if (m[2]) setSel({ page: p, a: Number(m[2]), b: Number(m[3] || m[2]) });
    setTimeout(() => document.getElementById(m[2] ? `p${p}-l${m[2]}` : `page-${p}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 350);
    // Run once on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The page in view drives the toolbar, rail and side-by-side scan.
  useEffect(() => {
    const refs = view === "original" ? scanRefs : pageRefs;
    const targets = refs.current.filter(Boolean) as HTMLElement[];
    if (!targets.length) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setPage(Number((visible.target as HTMLElement).dataset.page));
    }, { rootMargin: "-35% 0px -55% 0px" });
    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, [view, reflow, model]);

  useLayoutEffect(() => {
    const el = segRefs.current[view];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [view, views]);

  useEffect(() => {
    const onScroll = () => {
      const r = bodyRef.current?.getBoundingClientRect();
      if (r) setProgress(Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))));
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && lightbox === null) { setSheet(null); setSel(null); } };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [lightbox]);

  const flash = useCallback((message: string) => { setToast(message); setTimeout(() => setToast(""), 2200); }, []);
  const copy = useCallback(async (text: string, message: string) => {
    try { await navigator.clipboard.writeText(text); flash(message); } catch { flash("Couldn’t copy. Select the text instead."); }
  }, [flash]);

  // Switching views keeps the reader on the same page.
  const switchView = (next: ReaderView) => {
    const keep = pageRef.current;
    setView(next);
    const params = new URLSearchParams(location.search);
    if (next === firstText) params.delete("view"); else params.set("view", next);
    params.delete("page");
    history.replaceState(null, "", `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = (next === "original" ? scanRefs : pageRefs).current[keep - 1];
      if (target) target.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
      else if (bodyRef.current && bodyRef.current.getBoundingClientRect().top < 0) bodyRef.current.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    }));
  };

  const goTo = (p: number) => {
    setSheet(null);
    const target = (view === "original" ? scanRefs : pageRefs).current[p - 1];
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    else if (view !== "compare" && view !== "original" && model.original.kind !== "none" && !model.lineated) { setPage(p); switchView("original"); }
    else setPage(p);
  };

  const selectLine = (p: number, n: number, extend: boolean) => {
    const next = extend && sel?.page === p ? { page: p, a: Math.min(sel.a, n), b: Math.max(sel.b, n) } : sel?.page === p && sel.a === n && sel.b === n ? null : { page: p, a: n, b: n };
    setSel(next);
    history.replaceState(null, "", `${location.pathname}${location.search}${next ? `#p${p}.${next.a}${next.b !== next.a ? `-${next.b}` : ""}` : ""}`);
  };

  const renderText = (id: ReaderView) => {
    if (id === "overview") return source.sourceKind === "collection" ? <CollectionOverview source={source} /> : <CatalogueOverview source={source} />;
    if (id === "translation") return <div className={styles.prose}><TranslationReader source={source} /></div>;
    if (model.lineated) return <Lineated pages={model.lineated} reflow={reflow} sel={sel} onSelect={selectLine} pageRefs={pageRefs} onScan={model.original.kind === "images" ? p => setLightbox(p) : undefined} />;
    return <div className={styles.prose}><TranscriptReader source={source} transcript={transcript} hideSourceNote={!!model.introSection} /></div>;
  };

  const renderOriginal = () => {
    const kind = model.original.kind;
    if (kind === "images") return <Scans pages={model.pages} scanRefs={scanRefs} onOpen={setLightbox} />;
    if (kind === "pdf" && pdf) return <PdfFrame url={pdf.url} page={page} title={source.title} sourceUrl={source.sourceUrl} />;
    if (kind === "audio" || kind === "video") return <MediaSourceViewer file={source.files?.find(f => isAudioFile(f) || isVideoFile(f))} source={source} type={kind} />;
    if (kind === "external") return <ExternalSourceViewer source={source} />;
    return null;
  };

  const showToolbar = views.length > 1 || pageCount > 1 || !!model.lineated;
  const showRail = pageCount > 1 && thumbs.some(Boolean) && view !== "compare";
  const citeWhole = sourceCitation(source, undefined, origin);

  return (
    <div className={styles.root} style={{ ["--toolbar-top" as string]: stickyTop }}>
      <div className={styles.progress} style={{ transform: `scaleX(${progress})` }} aria-hidden />

      <header className={`${styles.hero} ${stackImages.length && !stackFailed ? "" : styles.heroSolo}`}>
        <div className={styles.heroText}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href="/archive">Archive</Link><ChevronRight size={13} aria-hidden />
            <Link href={`/archive?type=${encodeURIComponent(source.type)}`}>{source.type}</Link>
          </nav>
          <p className={styles.kicker}>{[source.sourceKind === "collection_item" ? source.sequenceLabel : source.type, source.year || ""].filter(Boolean).join(" · ")}</p>
          <h1 className={styles.title}>{titleParts.title}</h1>
          {titleParts.subtitle && <p className={styles.subtitle}>{titleParts.subtitle}</p>}
          <p className={styles.byline}>
            {creatorNames(source).length > 0 && <span className={styles.creator}><PersonNames hrefs={biographyHrefs} names={creatorNames(source)} /></span>}
            {source.displayDate && <><span className={styles.sep}>·</span><span>{source.displayDate}</span></>}
            {source.publicationTitle && <><span className={styles.sep}>·</span><span>{source.publicationTitle}</span></>}
          </p>
          <Intro>{model.introSection ? <MarkdownContent markdown={sectionText(model.introSection)} /> : source.summary ? <MarkdownContent markdown={source.summary} /> : null}</Intro>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => setSheet("cite")}><Quote size={15} />Cite</button>
            {model.commentary.length > 0 && (
              <button type="button" className={styles.ghost} onClick={() => { dispatchEvent(new Event("reader:open-context")); requestAnimationFrame(() => document.getElementById("historical-context")?.scrollIntoView({ behavior: "smooth", block: "start" })); }}><ScrollText size={15} />Historical context</button>
            )}
            {pdf && <a className={styles.ghost} href={pdf.url} download><Download size={15} />PDF</a>}
            <button type="button" className={styles.ghost} onClick={async () => {
              const url = sourceUrl(source, origin);
              if (navigator.share && narrow) { try { await navigator.share({ title: source.title, url }); return; } catch { return; } }
              copy(url, "Link copied");
            }}><Share2 size={15} />Share</button>
          </div>
        </div>
        {stackImages.length > 0 && !stackFailed && (
          <div className={styles.stackWrap}>
            <button type="button" className={styles.stack} data-count={stackImages.length} onClick={() => model.original.kind !== "none" ? switchView("original") : undefined} aria-label={model.original.kind !== "none" ? "View the original" : "Source image"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {stackImages.map((src, i) => <img key={src + i} src={src} alt="" className={styles[`card${i + 1}`]} onError={() => setStackFailed(true)} />).reverse()}
              <span className={styles.stackLabel}><Layers size={14} />{pageCount > 1 ? `${pageCount} pages · ` : ""}{model.original.kind !== "none" ? "view original" : source.type}</span>
            </button>
            {/* Shown only while the original is hovered, so the hero stays quiet. */}
            <p className={styles.status}><span className={styles.dot} /><span><strong>{status.label}.</strong> {status.detail}</span></p>
          </div>
        )}
      </header>

      {showToolbar && (
        <div className={styles.toolbar}>
          <div className={styles.toolbarInner}>
            {views.length > 1 && (
              <div className={styles.segmented} role="tablist" aria-label="Reading view">
                <span className={styles.indicator} style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }} />
                {views.map(({ id, label, icon: Icon }) => (
                  <button key={id} ref={el => { segRefs.current[id] = el; }} role="tab" aria-selected={view === id} onClick={() => switchView(id)}><Icon size={15} /><span>{label}</span></button>
                ))}
              </div>
            )}
            {pageCount > 1 && (
              <div className={styles.pager}>
                <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => goTo(page - 1)}><ChevronLeft size={16} /></button>
                <span aria-live="polite"><span key={page} className={styles.pageNum}>{page}</span> of {pageCount}</span>
                <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => goTo(page + 1)}><ChevronRight size={16} /></button>
              </div>
            )}
            {model.lineated && view !== "original" && (
              <button type="button" className={styles.iconButton} aria-pressed={reflow} title={reflow ? "Show original line breaks" : "Reflow lines into paragraphs"} onClick={() => setReflow(r => !r)}>
                <WrapText size={17} /><span>{reflow ? "Reflowed" : "As typed"}</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div ref={bodyRef} className={`${styles.body} ${styles[`view_${view}`] || ""} ${showRail ? "" : styles.noRail}`}>
        {showRail && (
          <aside className={styles.rail} aria-label="Pages">
            {thumbs.map((src, i) => (
              <button key={i} type="button" className={styles.thumb} aria-current={page === i + 1} aria-label={`Page ${i + 1}`} onClick={() => goTo(i + 1)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {src ? <img src={src} alt="" loading="lazy" /> : <span className={styles.thumbBlank} />}
                <span>{i + 1}</span>
              </button>
            ))}
          </aside>
        )}

        <div className={styles.main}>
          <div key={view} className={styles.viewPane}>
            {view === "original" ? renderOriginal() : view === "compare" ? (
              <div className={styles.compareGrid}>
                <div className={styles.compareText}>{renderText(firstText)}</div>
                <div className={styles.compareSide}>
                  <div className={styles.compareSticky}>
                    {model.original.kind === "images" ? model.pages.map((p, i) => (
                      <button key={p.id} type="button" className={styles.compareImage} data-on={page === i + 1} onClick={() => setLightbox(i + 1)} tabIndex={page === i + 1 ? 0 : -1} aria-hidden={page !== i + 1}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imagePath || p.thumbnailPath} alt={`Page ${i + 1}`} loading={i < 2 ? "eager" : "lazy"} />
                      </button>
                    )) : pdf ? <iframe key={page} className={styles.compareFrame} src={`${pdf.url}#page=${page}&view=FitH`} title={`${source.title}, page ${page}`} /> : null}
                    <p className={styles.compareCaption}>Page {page}{model.original.kind === "images" ? " · click to enlarge" : ""}</p>
                  </div>
                </div>
              </div>
            ) : renderText(view)}
          </div>

          {model.commentary.map((section, i) => <Commentary key={section.id || i} id={i === 0 ? "historical-context" : undefined} section={section} source={source} />)}

          <section className={styles.details} aria-labelledby="about-source">
            <h2 id="about-source">About this source</h2>
            <dl>
              <Row label="Creator">{source.creators?.length ? source.creators.map((c, i) => <span key={`${c.name}-${i}`}>{i > 0 && "; "}<PersonNames hrefs={biographyHrefs} names={[c.name]} />{c.role && !/^author$/i.test(c.role) ? ` (${c.role})` : ""}</span>) : source.author && <PersonNames hrefs={biographyHrefs} names={[source.author]} />}</Row>
              <Row label="Date">{source.displayDate}</Row>
              <Row label="Type">{source.type}</Row>
              <Row label="Held by">{source.citation}</Row>
              <Row label="Language">{source.contentLanguage || source.language}</Row>
              <Row label="Region">{source.region}</Row>
              <Row label="Text">{`${status.label}. ${status.detail}`}</Row>
              {source.translationNote && <Row label="Translation">{source.translationNote}</Row>}
              <Row label="Rights">{source.rights}</Row>
            </dl>
            <div className={styles.detailLinks}>
              {pdf && <a className={styles.ghost} href={pdf.url} download><Download size={15} />Download PDF</a>}
              {source.sourceUrl && source.sourceUrl !== "#" && <a className={styles.ghost} href={source.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} />Holding institution</a>}
            </div>
            {source.tags.length > 0 && <div className={styles.tags}>{source.tags.map(t => <Link key={t} href={topicHref(t)}>{t}</Link>)}</div>}
          </section>

          {related.length > 0 && (
            <section className={styles.related} aria-labelledby="related-sources">
              <h2 id="related-sources">Related sources</h2>
              <div className={styles.relatedGrid}>
                {related.slice(0, 4).map(r => (
                  <Link key={r.id} href={`/archive/${r.slug}`} className={styles.relatedCard}>
                    <span className={styles.relatedMeta}>{sourceKicker(r.type, r.displayDate)}</span>
                    <span className={styles.relatedTitle}>{r.title}</span>
                    <span className={styles.relatedReason}>{r.relatedReason}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {children}
        </div>
      </div>

      <nav className={styles.dock} aria-label="Reader">
        <button type="button" aria-pressed={view !== "original"} onClick={() => switchView(firstText)}><BookOpen size={19} /><span>{model.textViews[0].label === "Transcript" ? "Text" : model.textViews[0].label}</span></button>
        {model.original.kind !== "none" && <button type="button" aria-pressed={view === "original"} onClick={() => switchView("original")}><ImageIcon size={19} /><span>{model.original.kind === "images" ? "Scan" : model.original.label.replace("Original ", "")}</span></button>}
        {pageCount > 1 && <button type="button" onClick={() => setSheet("pages")}><Layers size={19} /><span>Page {page}/{pageCount}</span></button>}
        <button type="button" onClick={() => setSheet("cite")}><Quote size={19} /><span>Cite</span></button>
      </nav>

      {sel && (
        <div className={styles.selBar} role="status">
          <span><strong>Page {sel.page}</strong>, {sel.a === sel.b ? `line ${sel.a}` : `lines ${sel.a}–${sel.b}`}</span>
          <button type="button" onClick={() => copy(sourceCitation(source, sel, origin), "Citation copied")}><Copy size={14} />Copy citation</button>
          <button type="button" onClick={() => copy(`${sourceUrl(source, origin)}${location.hash}`, "Link copied")}><Link2 size={14} />Copy link</button>
          <button type="button" className={styles.selClose} aria-label="Clear selection" onClick={() => selectLine(sel.page, sel.a, false)}><X size={15} /></button>
        </div>
      )}

      {sheet && <div className={styles.scrim} onClick={() => setSheet(null)} />}
      {sheet === "cite" && (
        <div className={styles.sheet} role="dialog" aria-label="Cite this source">
          <div className={styles.sheetHead}><h2>Cite this source</h2><button type="button" aria-label="Close" onClick={() => setSheet(null)}><X size={18} /></button></div>
          <p className={styles.citeText}>{citeWhole}</p>
          <div className={styles.sheetActions}>
            <button type="button" className={styles.primary} onClick={() => copy(citeWhole, "Citation copied")}><Copy size={15} />Copy citation</button>
            {pageCount > 1 && <button type="button" className={styles.ghost} onClick={() => copy(sourceCitation(source, { page }, origin), "Citation copied")}>Cite page {page} only</button>}
          </div>
          {model.lineated && <p className={styles.hint}>To cite particular lines, tap their numbers in the transcript. Shift-click extends the selection.</p>}
        </div>
      )}
      {sheet === "pages" && (
        <div className={styles.sheet} role="dialog" aria-label="Pages">
          <div className={styles.sheetHead}><h2>Pages</h2><button type="button" aria-label="Close" onClick={() => setSheet(null)}><X size={18} /></button></div>
          <div className={styles.sheetPages}>
            {Array.from({ length: pageCount }, (_, i) => (
              <button key={i} type="button" aria-current={page === i + 1} onClick={() => goTo(i + 1)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {thumbs[i] ? <img src={thumbs[i]} alt="" /> : <span className={styles.thumbBlank} />}
                <span>Page {i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {lightbox !== null && model.pages.length > 0 && (
        <Lightbox images={model.pages.map(p => p.imagePath || p.thumbnailPath || "")} labels={model.pages.map(p => `Page ${p.pageNumber || p.label}`)} index={lightbox - 1} onIndex={i => setLightbox(i + 1)} onClose={() => setLightbox(null)} alt={source.title} />
      )}

      <div className={styles.toast} data-on={!!toast} role="status" aria-live="polite"><Check size={15} />{toast}</div>
    </div>
  );
}

// Long descriptions are clamped so the reading text stays near the top of the page.
function Intro({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 4);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  if (!children) return null;
  return (
    <div className={styles.introWrap}>
      <div ref={ref} className={styles.intro} data-open={open}>{children}</div>
      {(overflows || open) && <button type="button" className={styles.more} aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? "Show less" : "Read more"}</button>}
    </div>
  );
}

function PersonNames({ names, hrefs }: { names: string[]; hrefs: Record<string, string> }) {
  return <>{names.map((name, i) => <span key={`${name}-${i}`}>{i > 0 && ", "}{hrefs[name] ? <Link className={styles.personLink} href={hrefs[name]}>{name}</Link> : name}</span>)}</>;
}

function Row({ label, children }: { label: string; children?: ReactNode }) {
  if (!children) return null;
  return <div><dt>{label}</dt><dd>{children}</dd></div>;
}

function CatalogueOverview({ source }: { source: ArchiveSource }) {
  const excerpt = source.excerpt?.trim();
  return (
    <div className={styles.catalogue}>
      {excerpt && excerpt !== source.summary?.trim() && <blockquote>{excerpt}</blockquote>}
      <p>
        {source.accessType === "external" ? "The archive records this source and links to the institution that holds it." : "This record doesn’t have a transcript yet."}
        {source.sourceUrl && source.sourceUrl !== "#" && <> <a href={source.sourceUrl} target="_blank" rel="noreferrer">Read it at the holding institution ↗</a></>}
      </p>
    </div>
  );
}

function Lineated({ pages, reflow, sel, onSelect, pageRefs, onScan }: { pages: LineatedPage[]; reflow: boolean; sel: Selection; onSelect: (p: number, n: number, extend: boolean) => void; pageRefs: React.MutableRefObject<(HTMLElement | null)[]>; onScan?: (page: number) => void }) {
  return (
    <div className={`${styles.lineated} ${reflow ? styles.reflow : ""}`}>
      {pages.map(page => (
        <section key={page.number} id={`page-${page.number}`} data-page={page.number} ref={el => { pageRefs.current[page.number - 1] = el; }} className={styles.page} aria-label={`Page ${page.number}`}>
          <div className={styles.pageMark}><span>Page {page.number}</span><span className={styles.pageRule} />{onScan && <button type="button" onClick={() => onScan(page.number)}>View scan</button>}</div>
          {page.lines.map((line, j) => {
            if (line.kind === "head") return <p key={j} className={styles.head}>{line.text}</p>;
            if (line.kind === "insert") return <p key={j} className={styles.insert} title="Written above the line">{line.text}</p>;
            const n = line.n!;
            const selected = !!sel && sel.page === page.number && n >= sel.a && n <= sel.b;
            return (
              <p key={j} id={`p${page.number}-l${n}`} className={`${styles.line} ${selected ? styles.selected : ""}`} data-indent={line.indent}>
                <button type="button" className={styles.num} aria-label={`Select page ${page.number}, line ${n}`} onClick={e => onSelect(page.number, n, e.shiftKey)}>{n}</button>
                <span className={styles.lineText}><LineText text={line.text} /></span>
              </p>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function LineText({ text }: { text: string }) {
  return <>{text.split(/(\[crossed-out text\]|\[[^\]]{1,24}\])/).map((part, i) =>
    part === "[crossed-out text]" ? <span key={i} className={styles.struck} title="Crossed out in the original">crossed out</span>
      : /^\[[^\]]+\]$/.test(part) ? <span key={i} className={styles.supplied} title="Supplied or uncertain reading">{part}</span>
        : part)}</>;
}

function Scans({ pages, scanRefs, onOpen }: { pages: ArchiveSource["pages"] & object; scanRefs: React.MutableRefObject<(HTMLElement | null)[]>; onOpen: (page: number) => void }) {
  return (
    <div className={styles.scans}>
      {pages.map((p, i) => (
        <figure key={p.id} data-page={i + 1} ref={el => { scanRefs.current[i] = el; }} className={styles.scanFigure}>
          <button type="button" onClick={() => onOpen(i + 1)} aria-label={`Enlarge page ${i + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.imagePath || p.thumbnailPath} alt={`Page ${p.pageNumber || p.label}`} loading={i ? "lazy" : "eager"} width={p.imageWidth} height={p.imageHeight} />
          </button>
          <figcaption>Page {p.pageNumber || p.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function PdfFrame({ url, page, title, sourceUrl: holding }: { url: string; page: number; title: string; sourceUrl?: string }) {
  return (
    <div className={styles.pdf}>
      <div className={styles.pdfBar}>
        <span>Original PDF</span>
        <a href={url} download><Download size={14} />Download</a>
        {holding && holding !== "#" && <a href={holding} target="_blank" rel="noreferrer"><ExternalLink size={14} />Holding institution</a>}
      </div>
      <iframe key={page} src={`${url}#page=${page}`} title={`${title} PDF`} />
    </div>
  );
}

function Commentary({ id, section, source }: { id?: string; section: TranscriptSection; source: ArchiveSource }) {
  const text = sectionText(section);
  const long = text.length > 1400;
  const [open, setOpen] = useState(!long);
  // The hero's "Historical context" button expands the essay as it scrolls to it.
  useEffect(() => {
    const expand = () => setOpen(true);
    addEventListener("reader:open-context", expand);
    return () => removeEventListener("reader:open-context", expand);
  }, []);
  return (
    <section id={id} className={styles.context} aria-label={section.heading}>
      <h2>{section.heading}</h2>
      <HistoricalContextByline section={section} />
      <div className={styles.essay} data-open={open}>
        <div className={styles.essayInner}>
          {section.bodyFormat === "markdown" ? <MarkdownContent citationLinks={source.citationLinks} figures={source.figures} markdown={text} /> : text.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
      {long && <button type="button" className={styles.more} aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? "Show less" : "Continue reading"}</button>}
    </section>
  );
}
