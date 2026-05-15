"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, Search } from "lucide-react";
import { SourceTextSettings } from "@/components/source-text-settings";
import { SearchBar } from "@/components/ui/search-bar";

const navItems = [
  {
    label: "Texts",
    href: "/archive?medium=Text",
    dropdown: [
      { label: "All texts", href: "/archive?medium=Text" },
      { label: "Before 1800", href: "/archive?medium=Text&yearEnd=1799" },
      { label: "1800-1899", href: "/archive?medium=Text&yearStart=1800&yearEnd=1899" },
      { label: "1900-1942", href: "/archive?medium=Text&yearStart=1900&yearEnd=1942" },
      { label: "1943-1962", href: "/archive?medium=Text&yearStart=1943&yearEnd=1962" },
      { label: "1963-1979", href: "/archive?medium=Text&yearStart=1963&yearEnd=1979" },
      { label: "1980-present", href: "/archive?medium=Text&yearStart=1980" },
      { label: "Academic articles", href: "/archive?medium=Text&type=Academic%20Article" },
      { label: "Books", href: "/archive?medium=Text&type=Book" },
      { label: "Manuscripts & letters", href: "/archive?medium=Text&type=Manuscript" },
      { label: "Newspapers", href: "/archive?medium=Text&type=Newspaper%20Article" }
    ]
  },
  {
    label: "Sound & Video",
    href: "/archive?medium=Audio%2FVideo",
    dropdown: [
      { label: "All sound & video", href: "/archive?medium=Audio%2FVideo" },
      { label: "Audio recordings", href: "/archive?medium=Audio%2FVideo&type=Audio%2FVideo" },
      { label: "Film & video", href: "/archive?medium=Audio%2FVideo&type=Film" },
      { label: "Interviews", href: "/archive?medium=Audio%2FVideo&tag=Interview" },
      { label: "Lectures & talks", href: "/archive?medium=Audio%2FVideo&tag=Lecture" },
      { label: "Oral histories", href: "/archive?medium=Audio%2FVideo&tag=Oral%20History" }
    ]
  },
  {
    label: "People",
    href: "/people",
    dropdown: [
      { label: "All people", href: "/people" },
      { label: "Science & medicine", href: "/people?domain=science-medicine" },
      { label: "Arts & literature", href: "/people?domain=arts-literature" },
      { label: "Spiritual practice", href: "/people?domain=spiritual-practice" },
      { label: "Politics & counterculture", href: "/people?domain=politics-counterculture" },
      { label: "Indigenous traditions", href: "/people?domain=indigenous-traditions" }
    ]
  },
  { label: "Topics", href: "/topics" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" }
];

type SiteHeaderProps = {
  variant?: "home" | "source" | "bio" | "about";
  showSourceSettings?: boolean;
  activeLabel?: string;
};

export function SiteHeader({ variant = "home", showSourceSettings = true, activeLabel }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const resolvedActiveLabel = activeLabel ?? (variant === "about" ? "About" : undefined);

  return (
    <header className={`site-header sticky top-0 z-40 border-b border-archive-line ${variant === "about" ? "site-header-about" : ""}`}>
      <div className="flex min-h-[4.9rem] w-full items-center gap-2 px-4 sm:gap-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="focus-ring group min-w-0 shrink rounded-sm sm:shrink-0"
        >
          <span className="site-logotype display-narrow text-[1.08rem] sm:text-[1.62rem]">
            The Psychedelic History Archive
          </span>
        </Link>
        <nav aria-label="Primary" className="ml-auto hidden items-center gap-5 text-[1rem] font-semibold leading-none xl:gap-6 lg:flex">
          {navItems.map((item) => {
            const isActive = resolvedActiveLabel ? item.label === resolvedActiveLabel : variant === "source" && item.label === "Texts";
            const triggerClasses = `focus-ring relative inline-flex h-14 items-center gap-1.5 whitespace-nowrap rounded-sm transition hover:text-archive-violetDark ${
              isActive
                ? "text-archive-ink after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-archive-violet data-[about-active=true]:after:bg-[#d99a32]"
                : ""
            }`;

            if (item.dropdown) {
              return (
                <div className="group relative" key={item.href}>
                  <Link className={triggerClasses} data-about-active={variant === "about" && isActive} href={item.href}>
                    <span>{item.label}</span>
                    <ChevronDown className="h-4 w-4 stroke-[2] transition duration-150 group-hover:rotate-180 group-focus-within:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 min-w-[15.5rem] translate-y-2 pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-md border border-archive-line bg-archive-surface py-3 shadow-[0_18px_42px_rgb(var(--archive-shadow)/0.18)]">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          className="focus-ring block px-4 py-2 text-[0.92rem] font-semibold leading-snug text-archive-ink transition hover:bg-archive-lavender2 hover:text-archive-violetDark"
                          href={dropdownItem.href}
                          key={dropdownItem.href}
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                className={triggerClasses}
                data-about-active={variant === "about" && isActive}
                href={item.href}
                key={item.href}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {variant === "source" ? (
          <div className="ml-3 hidden items-center gap-2 xl:flex">
            <SearchBar className="w-[17rem]" />
            <SourceTextSettings showSourceControls={showSourceSettings} />
          </div>
        ) : (
          <div className="ml-2 hidden items-center gap-2 lg:flex">
            <SourceTextSettings showSourceControls={false} />
            <Link
              className="focus-ring inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md border border-archive-line bg-archive-surface/70 px-4 text-[0.83rem] font-medium transition hover:border-archive-violet/50 hover:bg-archive-lavender2"
              href="/archive"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
          </div>
        )}
        <div className="ml-auto lg:hidden">
          <SourceTextSettings showSourceControls={variant === "source" && showSourceSettings} />
        </div>
        <button
          aria-label="Open navigation"
          aria-expanded={mobileOpen}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-archive-line bg-archive-surface/70 lg:hidden"
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {mobileOpen && (
        <nav aria-label="Mobile primary" className="border-t border-archive-line bg-archive-surface px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {navItems.map((item) => (
              <Link
                className="focus-ring rounded-md px-3 py-2 text-sm font-semibold text-archive-ink transition hover:bg-archive-lavender2 hover:text-archive-violetDark"
                href={item.href}
                key={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
