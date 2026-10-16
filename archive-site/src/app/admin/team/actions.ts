"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/cms/auth";
import { cmsClient } from "@/lib/cms/repository";
export async function inviteEditor(form: FormData) {
  const editor = await requireEditor(); if (editor.role !== "owner") throw new Error("Only the project owner can invite editors.");
  const email = String(form.get("email") || "").trim(); const name = String(form.get("name") || "").trim(); const origin = process.env.CMS_SITE_URL;
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !origin) redirect("/admin/team?error=setup");
  const client = cmsClient();
  const { data, error } = await client.auth.admin.inviteUserByEmail(email, { redirectTo: `${origin.replace(/\/$/, "")}/auth/editor` });
  if (error || !data.user) redirect("/admin/team?error=invite");
  const profile = await client.from("editor_profiles").upsert({ user_id: data.user.id, display_name: name, role: "editor" });
  if (profile.error) redirect("/admin/team?error=profile");
  revalidatePath("/admin/team"); redirect("/admin/team?invited=1");
}
