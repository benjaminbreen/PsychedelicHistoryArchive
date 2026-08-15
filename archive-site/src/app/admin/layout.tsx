import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import type React from "react";
import { isAdminEnabled } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin | The Psychedelic History Archive",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true
    }
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminEnabled) notFound();

  return (
    <div className="min-h-screen bg-archive-paper text-archive-ink">
      <header className="border-b border-archive-line bg-archive-surface">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-archive-violet">Local Admin</p>
            <h1 className="text-xl font-semibold">Psychedelic History Archive CMS</h1>
          </div>
          <nav className="ml-auto flex items-center gap-2 text-sm font-semibold">
            <Link className="focus-ring rounded-md px-3 py-2 hover:bg-archive-lavender2" href="/admin/workbench">Workbench</Link>
            <Link className="focus-ring rounded-md px-3 py-2 hover:bg-archive-lavender2" href="/admin/sources">Sources</Link>
            <Link className="focus-ring rounded-md px-3 py-2 hover:bg-archive-lavender2" href="/admin/biographies">Biographies</Link>
            <Link className="focus-ring rounded-md px-3 py-2 hover:bg-archive-lavender2" href="/admin/collections">Collections</Link>
            <Link className="focus-ring rounded-md px-3 py-2 hover:bg-archive-lavender2" href="/admin/topics">Topics</Link>
            <Link className="focus-ring rounded-md px-3 py-2 hover:bg-archive-lavender2" href="/admin/bibliography">Bibliography</Link>
            <Link className="focus-ring rounded-md px-3 py-2 hover:bg-archive-lavender2" href="/admin/drafts">Drafts</Link>
            <Link className="focus-ring rounded-md px-3 py-2 hover:bg-archive-lavender2" href="/admin/qa">QA</Link>
            <Link className="focus-ring rounded-md px-3 py-2 hover:bg-archive-lavender2" href="/archive">Public archive</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-5 py-6">
        {children}
      </main>
    </div>
  );
}
