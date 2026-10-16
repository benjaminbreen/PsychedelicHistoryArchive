"use server";
import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/cms/auth";
import { cmsClient } from "@/lib/cms/repository";
import { isSourceIssueStatus } from "@/lib/source-issue-reports";

// Editorial content writes live in cms-actions/page-actions and the transactional RPCs.
export async function updateSourceIssueReportStatus(form: FormData) {
  const editor = await requireEditor(); const client = cmsClient();
  const id = String(form.get("id") || ""); const status = String(form.get("status") || "");
  if (!id || !isSourceIssueStatus(status)) throw new Error("Choose a source report and status.");
  const before = await client.from("source_issue_reports").select("*").eq("id",id).single();
  const payload = { status, admin_note: String(form.get("admin_note") || "").trim() || null, resolved_at: ["fixed","dismissed"].includes(status) ? new Date().toISOString() : null, updated_at: new Date().toISOString() };
  const { data, error } = await client.from("source_issue_reports").update(payload).eq("id",id).select("document_id").single();
  if (error) throw new Error(error.message);
  await client.from("content_revisions").insert({ table_name: "source_issue_reports", row_id: id, document_id: data.document_id, changed_by: editor.id, before_data: before.data, after_data: payload, change_note: `Set report status to ${status}` });
  revalidatePath("/admin/qa");
}
