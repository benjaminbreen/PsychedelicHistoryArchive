"use server";

import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/cms/auth";
import { cmsClient } from "@/lib/cms/repository";
import { passwordProblem } from "@/lib/cms/password-policy";

export async function resetEditorPassword(form: FormData) {
  const editor = await requireEditor();
  if (editor.role !== "owner") throw new Error("Only the project owner can reset passwords.");
  const client = cmsClient();
  const id = String(form.get("user_id") || "");
  const { data: profile, error: profileError } = await client.from("editor_profiles").select("role").eq("user_id", id).single();
  if (profileError || !profile || !["owner", "editor"].includes(profile.role)) redirect("/admin/team?error=account");
  // Backup access lets the owner recover their own named account.
  if (profile.role === "owner" && editor.via !== "password") redirect("/admin/team?error=owner");
  const password = String(form.get("new_password") || "");
  const problem = passwordProblem(password, String(form.get("confirm_password") || ""));
  if (problem) redirect(`/admin/team?error=${problem}`);
  const { error } = await client.auth.admin.updateUserById(id, { password, email_confirm: true });
  if (error) redirect("/admin/team?error=save");
  redirect("/admin/team?reset=1");
}
