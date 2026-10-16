import type { Asset, SourceEditModel } from "@/lib/cms/model";
export async function uploadFile(id: string, file: File): Promise<Asset> {
  const form = new FormData(); form.append("sourceId", id); form.append("file", file);
  const response = await fetch("/admin/media", { method: "POST", body: form });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.error || "The file could not be uploaded.");
  return result.asset;
}
export function attachOriginal(model: SourceEditModel, asset: Asset): SourceEditModel {
  const pdf = asset.mime_type === "application/pdf";
  return { ...model, files: [...model.files, asset], document: { ...model.document, access_type: "hosted", hosting_status: pdf ? "pdf" : model.document.hosting_status, ...(pdf && !model.sections.length && !model.document.translation_text ? { reader_mode: "pdf" } : {}) } };
}
