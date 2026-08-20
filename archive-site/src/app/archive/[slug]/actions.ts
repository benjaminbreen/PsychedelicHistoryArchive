"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSupabaseClient, isSchemaShapeError } from "@/lib/admin-cms";
import { isSourceIssueType, type SourceIssueType } from "@/lib/source-issue-reports";

type SourceLookup = {
  id: string;
  slug: string;
  title: string | null;
  status: string | null;
};

export async function submitSourceIssueReport(formData: FormData) {
  const sourceSlug = safeSlug(readString(formData, "source_slug"));
  const sourceId = readString(formData, "source_id");
  const fallbackPath = sourceSlug ? `/archive/${sourceSlug}` : "/archive";

  if (readString(formData, "website")) {
    redirect(`${fallbackPath}?report=submitted#source-issue-report`);
  }

  const supabase = getAdminSupabaseClient();
  if (!supabase) {
    redirect(`${fallbackPath}?report=unavailable#source-issue-report`);
  }

  const source = await fetchSourceForReport(supabase, sourceId, sourceSlug);
  if (!source) {
    redirect(`${fallbackPath}?report=not-found#source-issue-report`);
  }

  const issueType = readIssueType(formData);
  const description = clamp(readString(formData, "description"), 4000);
  if (description.length < 8) {
    redirect(`/archive/${source.slug}?report=invalid#source-issue-report`);
  }

  const payload = {
    document_id: source.id,
    source_slug: source.slug,
    source_title: source.title || source.slug,
    issue_type: issueType,
    location: readNullableClamped(formData, "location", 300),
    description,
    suggested_fix: readNullableClamped(formData, "suggested_fix", 1500),
    reporter_name: readNullableClamped(formData, "reporter_name", 120),
    reporter_email: normalizeEmail(readNullableClamped(formData, "reporter_email", 180)),
    page_url: `/archive/${source.slug}`,
    status: "new",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("source_issue_reports")
    .insert(payload);

  if (error) {
    console.warn("Could not submit source issue report.", error.message);
    const reportStatus = isSchemaShapeError(error.message) || error.message.includes("source_issue_reports")
      ? "unavailable"
      : "error";
    redirect(`/archive/${source.slug}?report=${reportStatus}#source-issue-report`);
  }

  revalidatePath("/admin/qa");
  redirect(`/archive/${source.slug}?report=submitted#source-issue-report`);
}

async function fetchSourceForReport(
  supabase: NonNullable<ReturnType<typeof getAdminSupabaseClient>>,
  sourceId: string,
  sourceSlug: string
) {
  let query = supabase
    .from("documents")
    .select("id, slug, title, status")
    .limit(1);

  query = isUuid(sourceId) ? query.eq("id", sourceId) : query.eq("slug", sourceSlug);
  const { data, error } = await query.maybeSingle();

  if (error) {
    console.warn("Could not verify source for issue report.", error.message);
    return null;
  }

  return data as SourceLookup | null;
}

function readIssueType(formData: FormData): SourceIssueType {
  const issueType = readString(formData, "issue_type");
  return isSourceIssueType(issueType) ? issueType : "other";
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNullableClamped(formData: FormData, key: string, maxLength: number) {
  const value = clamp(readString(formData, key), maxLength);
  return value || null;
}

function clamp(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function normalizeEmail(value: string | null) {
  if (!value) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

function safeSlug(value: string) {
  return /^[a-z0-9][a-z0-9-]*$/i.test(value) ? value : "";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
