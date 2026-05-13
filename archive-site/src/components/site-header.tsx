import Link from "next/link";
import { ChevronDown, Menu, Search } from "lucide-react";
import { SourceTextSettings } from "@/components/source-text-settings";
import { SearchBar } from "@/components/ui/search-bar";

const navItems = [
  { label: "About", href: "/about" },
  { label: "Audio/video", href: "/archive?medium=Audio%2FVideo" },
  {
    label: "Text",
    href: "/archive?medium=Text",
    dropdown: [
      { label: "Early modern (1500-1800)", href: "/archive?medium=Text&era=Early%20modern%20(1500-1800)" },
      { label: "1800-1950", href: "/archive?medium=Text&era=1800-1950" },
      { label: "1950s", href: "/archive?medium=Text&era=1950s" },
      { label: "1960s", href: "/archive?medium=Text&era=1960s" }
    ]
  },
  {
    label: "Bios",
    href: "/people",
    dropdown: [
      { label: "William James", href: "/archive?people=William%20James" },
      { label: "Humphry Davy", href: "/archive?people=Humphry%20Davy" },
      { label: "Benjamin Paul Blood", href: "/archive?people=Benjamin%20Paul%20Blood" },
      { label: "Henry J. Bigelow", href: "/archive?people=Henry%20J.%20Bigelow" }
    ]
  },
  { label: "Personal histories", href: "/archive?medium=Personal%20History" },
  { label: "Collections", href: "/collections" },
  { label: "Further reading", href: "/further-reading" }
];

type SiteHeaderProps = {
  variant?: "home" | "source";
  showSourceSettings?: boolean;
};

export function SiteHeader({ variant = "home", showSourceSettings = true }: SiteHeaderProps) {
  const gradient =
    variant === "source"
      ? "from-[#F1E8F7] via-[#F8F5F4] to-[#FFFFFF]"
      : "from-[#F2EAF5] via-[#F7F0E2] to-[#F7EDCF]";

  return (
    <header className={`sticky top-0 z-40 border-b border-[#E9DDC6] bg-gradient-to-b ${gradient}`}>
      <div className="flex min-h-[4.9rem] w-full items-center gap-5 px-6 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="focus-ring shrink-0 rounded-sm"
        >
          <span className="display-narrow text-[1.28rem] sm:text-[1.62rem]">
            The Psychedelic History Archive
          </span>
        </Link>
        <nav aria-label="Primary" className="ml-auto hidden items-center gap-5 text-[1rem] font-semibold leading-none xl:gap-6 lg:flex">
          {navItems.map((item) => {
            const isActive = variant === "source" && item.label === "Text";
            const triggerClasses = `focus-ring relative inline-flex h-14 items-center gap-1.5 whitespace-nowrap rounded-sm transition hover:text-archive-violet ${
              isActive
                ? "text-archive-ink after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-archive-violet"
                : ""
            }`;

            if (item.dropdown) {
              return (
                <div className="group relative" key={item.href}>
                  <Link className={triggerClasses} href={item.href}>
                    <span>{item.label}</span>
                    <ChevronDown className="h-4 w-4 stroke-[2] transition duration-150 group-hover:rotate-180 group-focus-within:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 min-w-[17.5rem] translate-y-2 pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-md border border-[#E7DED2] bg-[#FBF8F1] py-3 shadow-[0_18px_42px_rgba(35,26,18,0.14)]">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          className="focus-ring block px-5 py-2.5 text-[1.03rem] font-semibold leading-snug text-archive-ink transition hover:bg-white hover:text-archive-violet"
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
            {showSourceSettings && <SourceTextSettings />}
          </div>
        ) : (
          <Link
            className="focus-ring ml-2 hidden h-9 items-center gap-2 whitespace-nowrap rounded-md border border-archive-ink/70 bg-white/25 px-4 text-[0.83rem] font-medium transition hover:bg-white/50 lg:inline-flex"
            href="/archive"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
        )}
        <button
          aria-label="Open navigation"
          className="focus-ring ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-archive-ink/70 bg-white/30 lg:hidden"
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
