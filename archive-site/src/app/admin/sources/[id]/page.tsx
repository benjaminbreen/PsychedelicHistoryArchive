import { notFound } from "next/navigation";
import { getSource, getChoices } from "@/lib/cms/repository";
import { localWorkspace } from "@/lib/cms/auth";
import { uuidPattern } from "@/lib/cms/model";
import { SourceEditor } from "@/components/admin/source-editor";
export default async function SourceEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuidPattern.test(id)) notFound();
  const [source, choices] = await Promise.all([getSource(id), getChoices()]);
  if (!source) notFound();
  return <SourceEditor source={source} choices={choices} local={localWorkspace} />;
}
