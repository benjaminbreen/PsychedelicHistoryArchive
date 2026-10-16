"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Files, Library, BookOpen } from "lucide-react";
export function CmsNav() {
  const pathname = usePathname();
  return <nav className="cms-nav" aria-label="Editorial workspace">{[{ href: "/admin/sources", label: "Sources", icon: Files }, { href: "/admin/collections", label: "Collections", icon: Library }, { href: "/admin/site-pages", label: "Site pages", icon: BookOpen }].map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined}><Icon size={17} />{label}</Link>)}</nav>;
}
