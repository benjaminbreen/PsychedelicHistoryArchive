import { notFound } from "next/navigation";
import { getSource } from "@/lib/cms/repository";
import { localWorkspace } from "@/lib/cms/auth";
import { uuidPattern } from "@/lib/cms/model";
import { SourcePreview } from "@/components/admin/source-preview";
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; if (!uuidPattern.test(id)) notFound();
  const source = await getSource(id); if (!source) notFound();
  return <SourcePreview source={source} local={localWorkspace} />;
}
