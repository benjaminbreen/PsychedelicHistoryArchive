"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { ARCHIVE_CACHE_TAG } from "@/lib/cache-tags";
import { createDraft, saveDraft, publishDraft, unpublishSource, getSource, setSourceFeatured } from "@/lib/cms/repository";
import type { SourceEditModel } from "@/lib/cms/model";

export async function addSource(title: string, url: string) {
  try { const id = await createDraft(title, url); const source = await getSource(id); revalidatePath("/admin/sources"); return { id, version: source!.version, model: source!.model }; }
  catch (error) { return { error: error instanceof Error ? error.message : "The source could not be added." }; }
}
export async function saveSource(id: string, model: SourceEditModel, version: number) {
  try { const result = await saveDraft(id, model, version); revalidatePath("/admin/sources"); revalidateTag(ARCHIVE_CACHE_TAG); return result; }
  catch (error) { return { error: error instanceof Error ? error.message : "Your draft could not be saved. Try again." }; }
}
export async function publishSource(id: string, version: number) {
  try { const result = await publishDraft(id, version); revalidatePath("/admin/sources"); revalidatePath("/archive", "layout"); revalidateTag(ARCHIVE_CACHE_TAG); return result; }
  catch (error) { return { error: error instanceof Error ? error.message : "Publication failed. Your private draft is safe." }; }
}
export async function moveSourceToDrafts(id: string, version: number) {
  try { const result = await unpublishSource(id, version); revalidatePath("/admin/sources"); revalidatePath("/archive", "layout"); revalidateTag(ARCHIVE_CACHE_TAG); return result; }
  catch (error) { return { error: error instanceof Error ? error.message : "This source could not be moved to drafts." }; }
}
export async function featureSource(id: string, featured: boolean) {
  try { await setSourceFeatured(id, featured); revalidatePath("/"); revalidateTag(ARCHIVE_CACHE_TAG); return { featured }; }
  catch (error) { return { error: error instanceof Error ? error.message : "The home page picks could not be updated." }; }
}
