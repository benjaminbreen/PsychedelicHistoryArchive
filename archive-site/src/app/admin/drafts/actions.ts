"use server";

import { revalidatePath } from "next/cache";
import { isAdminEnabled } from "@/lib/admin-cms";
import { writeDraftReview, type DraftReviewStatus } from "@/lib/draft-sources";

const STATUSES: DraftReviewStatus[] = ["unreviewed", "accepted", "rejected", "hold"];

export async function setDraftReview(formData: FormData) {
  if (!isAdminEnabled) throw new Error("Local admin is disabled.");

  const slug = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("reviewStatus") ?? "").trim() as DraftReviewStatus;
  const note = String(formData.get("reviewNote") ?? "");

  if (!slug || slug.includes("/") || slug.includes("..")) throw new Error("Bad draft slug.");
  if (!STATUSES.includes(status)) throw new Error(`Unknown review status "${status}".`);

  writeDraftReview(slug, status, note);
  revalidatePath("/admin/drafts");
  revalidatePath(`/admin/drafts/${slug}`);
}
