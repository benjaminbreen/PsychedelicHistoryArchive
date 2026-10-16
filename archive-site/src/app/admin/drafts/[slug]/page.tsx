import { redirect } from "next/navigation";
import { listSources } from "@/lib/cms/repository";
export default async function LegacyDraft({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const source = (await listSources()).find(s => s.slug === slug);
  redirect(source ? `/admin/sources/${source.id}` : "/admin/sources");
}
