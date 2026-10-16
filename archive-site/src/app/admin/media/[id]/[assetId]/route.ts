import fs from "node:fs/promises";
import path from "node:path";
import { requireEditor, localWorkspace } from "@/lib/cms/auth";
import { getSource, cmsClient } from "@/lib/cms/repository";
import { withWorkspace, workspaceRoot } from "@/lib/cms/local-store";
import { uuidPattern } from "@/lib/cms/model";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; assetId: string }> }) {
  await requireEditor();
  const { id, assetId } = await params;
  if (!uuidPattern.test(id) || !uuidPattern.test(assetId)) return new Response("Not found", { status: 404 });
  const record = await getSource(id);
  const file = record?.model.files.find(f => f.id === assetId);
  if (!file) return new Response("Not found", { status: 404 });
  try {
    let bytes: Uint8Array;
    if (localWorkspace) {
      const target = file.private ? path.join(workspaceRoot, "uploads", file.storage_path) : await withWorkspace(w => w.assets[file.storage_path]);
      if (!target) return new Response("This staged file is not available locally.", { status: 404 });
      bytes = await fs.readFile(target);
    } else {
      const bucket = file.private ? "archive-drafts" : process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "archive-assets";
      const { data, error } = await cmsClient().storage.from(bucket).download(file.storage_path);
      if (error || !data) return new Response("File unavailable", { status: 404 });
      bytes = new Uint8Array(await data.arrayBuffer());
    }
    return new Response(bytes as BodyInit, { headers: { "Content-Type": file.mime_type || "application/octet-stream", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": `inline; filename="${(file.name || "source").replace(/["\r\n]/g, "_")}"` } });
  } catch { return new Response("File unavailable", { status: 404 }); }
}
