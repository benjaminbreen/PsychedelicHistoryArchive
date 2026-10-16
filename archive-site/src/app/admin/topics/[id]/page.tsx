import { notFound } from "next/navigation";
import { getPage } from "@/lib/cms/pages";
import { listSources } from "@/lib/cms/repository";
import { localWorkspace } from "@/lib/cms/auth";
import { PageEditor } from "@/components/admin/page-workspace";
export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [page, sources] = await Promise.all([getPage("topic", id), listSources()]);
  if (!page) notFound();
  return <PageEditor page={page} sources={sources} local={localWorkspace} />;
}
