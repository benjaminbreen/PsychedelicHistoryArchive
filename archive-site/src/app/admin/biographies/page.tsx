import Link from "next/link";
import { Database, Edit3, ExternalLink, Plus, RefreshCw, UserRound } from "lucide-react";
import { seedStaticBiographyProfiles } from "@/app/admin/actions";
import { isAdminWritable } from "@/lib/admin-cms";
import { listAdminBiographyProfiles } from "@/lib/admin-biographies";

export const dynamic = "force-dynamic";

export default async function AdminBiographiesPage() {
  const profiles = await listAdminBiographyProfiles();
  const databaseCount = profiles.filter((profile) => profile.storage === "database").length;
  const staticCount = profiles.filter((profile) => profile.storage === "static").length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Biographies</h2>
          <p className="mt-1 text-sm text-archive-muted">
            Create and edit person pages without touching code. Static profiles can be migrated into Supabase from here.
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          <span className="text-archive-muted">{isAdminWritable ? "Local write mode" : "Read-only until service role env is configured"}</span>
          <Link className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 font-semibold hover:bg-archive-lavender2" href="/admin/biographies/new">
            <Plus className="h-4 w-4" />
            New bio
          </Link>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <Metric label="Database profiles" value={databaseCount} />
        <Metric label="Static profiles" value={staticCount} />
        <form action={seedStaticBiographyProfiles} className="rounded-md border border-archive-line bg-archive-surface p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-archive-violet">
            <Database className="h-5 w-5" />
            Migration
          </div>
          <button className="focus-ring mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-archive-line px-3 text-xs font-semibold hover:bg-archive-lavender2" type="submit">
            <RefreshCw className="h-4 w-4" />
            Seed static profiles
          </button>
        </form>
      </section>

      <div className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-archive-lavender2 text-xs uppercase tracking-[0.08em] text-archive-muted">
            <tr>
              <th className="px-4 py-3">Person</th>
              <th className="px-4 py-3">Years</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Storage</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr className="border-t border-archive-line align-top hover:bg-archive-warm-hover/55" key={`${profile.storage}-${profile.id}`}>
                <td className="max-w-[34rem] px-4 py-3">
                  <Link className="font-semibold text-archive-ink hover:text-archive-violet" href={`/admin/biographies/${profile.id}`}>
                    {profile.name}
                  </Link>
                  <div className="mt-1 font-mono text-xs text-archive-muted">/biographies/{profile.slug}</div>
                  {profile.dek && <p className="mt-2 line-clamp-2 text-xs leading-5 text-archive-muted">{profile.dek}</p>}
                </td>
                <td className="px-4 py-3">{profile.years || "Unknown"}</td>
                <td className="px-4 py-3"><StatusBadge status={profile.status} /></td>
                <td className="px-4 py-3 text-archive-muted">{profile.storage}</td>
                <td className="px-4 py-3 text-archive-muted">{profile.updatedAt || "Not recorded"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href={`/admin/biographies/${profile.id}`} title="Edit biography">
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <Link className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line hover:bg-archive-lavender2" href={`/biographies/${profile.slug}`} title="Open public biography">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!profiles.length && (
          <div className="border-t border-archive-line p-6 text-sm text-archive-muted">
            No biography profiles loaded yet.
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-archive-line bg-archive-surface p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-archive-violet">
        <UserRound className="h-5 w-5" />
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold">{value.toLocaleString()}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full border border-archive-line bg-archive-paper px-2.5 py-1 text-xs font-semibold capitalize">
      {status.replaceAll("_", " ")}
    </span>
  );
}
