"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, ArrowRight, Grid2X2, List, Search } from "lucide-react";
import Link from "next/link";
import type { VisibleTopic } from "./page";

type ViewMode = "grid" | "list";
type SortMode = "az" | "count";

export function TopicsBrowser({ topics }: { topics: VisibleTopic[] }) {
  const [view, setView] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("az");

  const visibleTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return topics
      .filter((topic) => {
        if (!normalizedQuery) return true;
        return [topic.title, topic.description, ...topic.tags].some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        if (sort === "count") return b.count - a.count || a.title.localeCompare(b.title);
        return a.title.localeCompare(b.title);
      });
  }, [query, sort, topics]);

  return (
    <>
      <section className="mt-7 grid gap-5 xl:grid-cols-[minmax(20rem,1fr)_22rem_12.25rem]">
        <label className="flex min-h-14 items-center gap-3 rounded-md border border-archive-line bg-archive-surface px-4 text-[0.94rem] text-archive-muted shadow-[0_8px_22px_rgb(var(--archive-shadow)/0.035)]">
          <Search className="h-5 w-5" />
          <input
            className="min-w-0 flex-1 bg-transparent text-archive-ink outline-none placeholder:text-archive-muted"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topics by keyword..."
          />
        </label>
        <div className="flex min-h-14 items-center justify-between gap-4 rounded-md border border-archive-line bg-archive-surface px-5 shadow-[0_8px_22px_rgb(var(--archive-shadow)/0.035)]">
          <span className="inline-flex items-center gap-3 text-[0.93rem] font-semibold text-archive-ink">
            <ArrowDownUp className="h-5 w-5 text-archive-violet" />
            Sort by
          </span>
          <select
            className="focus-ring h-10 min-w-[7.4rem] rounded-md border border-archive-line bg-archive-paper px-4 text-sm font-medium text-archive-ink"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            aria-label="Sort topics"
          >
            <option value="az">A-Z</option>
            <option value="count">Most sources</option>
          </select>
        </div>
        <div className="grid min-h-14 grid-cols-2 overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-[0_8px_22px_rgb(var(--archive-shadow)/0.035)]">
          <button
            className={viewButtonClass(view === "grid", "border-r border-archive-line")}
            type="button"
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
          >
            <Grid2X2 className="h-4 w-4" />
            Grid
          </button>
          <button
            className={viewButtonClass(view === "list")}
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
          >
            <List className="h-4 w-4" />
            List
          </button>
        </div>
      </section>

      {view === "grid" ? (
        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {visibleTopics.map((topic) => (
            <TopicGridCard key={topic.title} topic={topic} />
          ))}
        </section>
      ) : (
        <section className="mt-6 grid gap-2">
          {visibleTopics.map((topic) => (
            <TopicListRow key={topic.title} topic={topic} />
          ))}
        </section>
      )}

      <p className="mt-8 text-sm text-archive-muted">
        Showing {visibleTopics.length} of {topics.length} current {topics.length === 1 ? "topic" : "topics"}
      </p>
    </>
  );
}

function TopicGridCard({ topic }: { topic: VisibleTopic }) {
  const icon = `/ui/topic-icons/${topic.icon}.png`;

  return (
    <article className="group overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-[0_10px_24px_rgb(var(--archive-shadow)/0.035)] transition hover:border-archive-violet/45 hover:bg-archive-lavender2/45">
      <div className="grid min-h-[8.9rem] grid-cols-[6.7rem_1fr] gap-4 p-3.5">
        <TopicIconLink topic={topic} icon={icon} size="grid" />
        <div className="min-w-0 pt-1">
          <TopicTitle topic={topic} />
          <p className="mt-1.5 line-clamp-3 text-[0.84rem] leading-5 text-archive-ink">
            {topic.description}
          </p>
          <TopicTags tags={topic.tags} />
        </div>
      </div>
      <TopicFooter topic={topic} />
    </article>
  );
}

function TopicListRow({ topic }: { topic: VisibleTopic }) {
  const icon = `/ui/topic-icons/${topic.icon}.png`;

  return (
    <article className="group grid gap-3 rounded-md border border-archive-line bg-archive-surface p-2.5 shadow-[0_8px_18px_rgb(var(--archive-shadow)/0.025)] transition hover:border-archive-violet/45 hover:bg-archive-lavender2/45 sm:grid-cols-[4.25rem_1fr_auto] sm:items-center">
      <TopicIconLink topic={topic} icon={icon} size="list" />
      <div className="min-w-0">
        <TopicTitle topic={topic} />
        <p className="mt-0.5 line-clamp-1 text-[0.84rem] leading-5 text-archive-ink">
          {topic.description}
        </p>
        <TopicTags tags={topic.tags} />
      </div>
      <div className="flex items-center justify-between gap-5 border-t border-archive-line pt-2 text-sm sm:block sm:border-t-0 sm:pt-0 sm:text-right">
        <span className="block whitespace-nowrap font-medium text-archive-ink">
          {topic.count} {topic.count === 1 ? "source" : "sources"}
        </span>
        <Link className="focus-ring mt-0 inline-flex items-center gap-1 rounded-sm text-[0.78rem] font-semibold text-archive-violet transition hover:text-archive-violetDark sm:mt-1.5" href={`/archive?tag=${encodeURIComponent(topic.title)}`}>
          Explore topic
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

function TopicIconLink({ topic, icon, size }: { topic: VisibleTopic; icon: string; size: ViewMode }) {
  const boxClass = size === "grid" ? "w-full" : "h-[4.25rem] w-[4.25rem]";
  const imageClass = size === "grid" ? "h-[5.85rem] w-[5.85rem]" : "h-[3.65rem] w-[3.65rem]";

  return (
    <Link className="focus-ring block rounded-sm" href={`/archive?tag=${encodeURIComponent(topic.title)}`}>
      <span className={`grid aspect-square place-items-center rounded-sm border border-archive-line bg-archive-paper ${boxClass}`}>
        <img className={`topic-icon ${imageClass} object-contain opacity-[0.84] mix-blend-multiply`} src={icon} alt="" aria-hidden="true" />
      </span>
    </Link>
  );
}

function TopicTitle({ topic }: { topic: VisibleTopic }) {
  return (
    <Link className="focus-ring rounded-sm" href={`/archive?tag=${encodeURIComponent(topic.title)}`}>
      <h2 className="text-[1.05rem] font-semibold leading-5 text-archive-ink transition group-hover:text-archive-violetDark">
        {topic.title}
      </h2>
    </Link>
  );
}

function TopicTags({ tags }: { tags: string[] }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {tags.slice(0, 2).map((tag) => (
        <span className="rounded border border-archive-line bg-archive-lavender2/55 px-1.5 py-0.5 text-[0.65rem] font-medium leading-3 text-archive-muted" key={tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function TopicFooter({ topic }: { topic: VisibleTopic }) {
  return (
    <div className="flex items-center justify-between border-t border-archive-line px-4 py-3 text-sm">
      <span className="font-medium text-archive-ink">
        {topic.count} {topic.count === 1 ? "source" : "sources"}
      </span>
      <Link className="focus-ring inline-flex items-center gap-1.5 rounded-sm text-[0.82rem] font-semibold text-archive-violet transition hover:text-archive-violetDark" href={`/archive?tag=${encodeURIComponent(topic.title)}`}>
        Explore topic
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function viewButtonClass(active: boolean, extra = "") {
  return [
    "focus-ring inline-flex items-center justify-center gap-2 text-sm transition",
    active ? "font-semibold text-archive-violet" : "font-medium text-archive-ink hover:bg-archive-lavender2/55",
    extra
  ].join(" ");
}
