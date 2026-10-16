import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { requireEditor, localWorkspace } from "@/lib/cms/auth";
import { cmsClient, getSource } from "@/lib/cms/repository";
import { workspaceRoot } from "@/lib/cms/local-store";
import { uuidPattern } from "@/lib/cms/model";

export async function POST(request: Request) {
  await requireEditor();
  const origin = request.headers.get("origin");
  // Compare against the Host header: Next may report request.url as localhost while the browser used 127.0.0.1 or a proxy host.
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin && new URL(origin).host !== host && origin !== process.env.CMS_SITE_URL) return Response.json({ error: "Upload from the editorial workspace." }, { status: 403 });
  try {
    const form = await request.formData();
    const id = String(form.get("sourceId") || "");
    const file = form.get("file");
    if (!uuidPattern.test(id) || !await getSource(id)) return Response.json({ error: "Source not found." }, { status: 404 });
    if (!(file instanceof File) || !file.size || file.size > 50 * 1024 * 1024) return Response.json({ error: "Choose a file under 50 MB. For long audio or video, use an original source link." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const head = bytes.subarray(0, 16);
    const isPdf = head.subarray(0, 5).toString() === "%PDF-";
    const imageType = head[0] === 0xff && head[1] === 0xd8 ? "jpeg" : head.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png" : head.subarray(0, 6).toString().startsWith("GIF8") ? "gif" : head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP" ? "webp" : "";
    if (!isPdf && !imageType) return Response.json({ error: "Upload a PDF, JPG, PNG, GIF, or WebP image. Add audio and video as links." }, { status: 400 });
    const assetId = randomUUID();
    const name = file.name.replace(/[^a-zA-Z0-9._ -]/g, "_").replace(/^\.+/, "").slice(0, 150) || `source.${isPdf ? "pdf" : imageType}`;
    const storagePath = `${id}/${assetId}/${name}`;
    const mime = isPdf ? "application/pdf" : `image/${imageType}`;
    if (localWorkspace) { const target = path.join(workspaceRoot, "uploads", storagePath); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, bytes); }
    else {
      const { error } = await cmsClient().storage.from("archive-drafts").upload(storagePath, bytes, { contentType: mime, upsert: false });
      if (error) throw new Error(error.message);
    }
    return Response.json({ asset: { id: assetId, kind: isPdf ? "original_pdf" : "figure_image", storage_path: storagePath, mime_type: mime, byte_size: file.size, name, private: true } });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "The file could not be uploaded." }, { status: 400 }); }
}
