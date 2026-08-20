import { getAdminSupabaseClient, isSchemaShapeError } from "@/lib/admin-cms";

export const SOURCE_ISSUE_TYPE_OPTIONS = [
  { value: "typo_ocr", label: "Typo or OCR error" },
  { value: "metadata_error", label: "Metadata error" },
  { value: "factual_concern", label: "Factual concern" },
  { value: "broken_link", label: "Broken link or access problem" },
  { value: "citation_problem", label: "Citation problem" },
  { value: "rights_access", label: "Rights or access concern" },
  { value: "other", label: "Other concern" },
] as const;

export const SOURCE_ISSUE_STATUSES = ["new", "triaged", "needs_review", "fixed", "dismissed"] as const;

export type SourceIssueType = typeof SOURCE_ISSUE_TYPE_OPTIONS[number]["value"];
export type SourceIssueStatus = typeof SOURCE_ISSUE_STATUSES[number];

export type SourceIssueReport = {
  id: string;
  document_id: string | null;
  source_slug: string;
  source_title: string;
  issue_type: SourceIssueType;
  location: string | null;
  description: string;
  suggested_fix: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  page_url: string | null;
  status: SourceIssueStatus;
  admin_note: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SourceIssueReportResult = {
  reports: SourceIssueReport[];
  status: "available" | "not_installed" | "unavailable";
};

export async function listSourceIssueReports(limit = 40): Promise<SourceIssueReportResult> {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return { reports: [], status: "unavailable" };

  const { data, error } = await supabase
    .from("source_issue_reports")
    .select(`
      id,
      document_id,
      source_slug,
      source_title,
      issue_type,
      location,
      description,
      suggested_fix,
      reporter_name,
      reporter_email,
      page_url,
      status,
      admin_note,
      resolved_at,
      created_at,
      updated_at
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isSchemaShapeError(error.message) || error.message.includes("source_issue_reports")) {
      return { reports: [], status: "not_installed" };
    }
    throw new Error(error.message);
  }

  return { reports: (data ?? []) as SourceIssueReport[], status: "available" };
}

export function sourceIssueTypeLabel(value: string) {
  return SOURCE_ISSUE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value.replaceAll("_", " ");
}

export function isSourceIssueType(value: string): value is SourceIssueType {
  return SOURCE_ISSUE_TYPE_OPTIONS.some((option) => option.value === value);
}

export function isSourceIssueStatus(value: string): value is SourceIssueStatus {
  return SOURCE_ISSUE_STATUSES.includes(value as SourceIssueStatus);
}
