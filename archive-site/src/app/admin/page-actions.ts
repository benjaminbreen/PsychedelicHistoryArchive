"use server";
import { revalidatePath } from "next/cache";
import { createPage, savePage } from "@/lib/cms/pages";
import { pageKinds, isPageKind, type PageKind, type PageModel } from "@/lib/cms/pages-model";
export async function addEditorialPage(kind: PageKind, title: string) {
  try { if (!isPageKind(kind)) throw new Error("Unknown page type."); const id = await createPage(kind, title); revalidatePath(`/admin/${pageKinds[kind].route}`); return { id }; }
  catch (e) { return { error: e instanceof Error ? e.message : "The page could not be created." }; }
}
export async function saveEditorialPage(kind: PageKind, id: string, model: PageModel, version: number, operation: "save" | "publish" | "unpublish") {
  try { if (!isPageKind(kind) || !["save", "publish", "unpublish"].includes(operation)) throw new Error("Unknown page action."); const result = await savePage(kind, id, model, version, operation); revalidatePath(`/admin/${pageKinds[kind].route}`); if (operation !== "save") revalidatePath("/", "layout"); return result; }
  catch (e) { return { error: e instanceof Error ? e.message : "This page could not be saved." }; }
}
