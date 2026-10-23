"use server";

import { redirect } from "next/navigation";
import { authClient, requireEditor } from "@/lib/cms/auth";
import { passwordProblem } from "@/lib/cms/password-policy";

export async function changePassword(form: FormData) {
  const editor = await requireEditor();
  if (!editor.id) redirect("/admin/account?error=named");
  const client = await authClient();
  if (!client) redirect("/admin/account?error=save");
  const password = String(form.get("new_password") || "");
  const problem = passwordProblem(password, String(form.get("confirm_password") || ""));
  if (problem) redirect(`/admin/account?error=${problem}`);
  const { data: { user } } = await client.auth.getUser();
  if (!user?.email || user.id !== editor.id) redirect("/editor-login?error=access");
  const { data, error: signInError } = await client.auth.signInWithPassword({ email: user.email, password: String(form.get("current_password") || "") });
  if (signInError || data.user?.id !== editor.id) redirect("/admin/account?error=current");
  const { error } = await client.auth.updateUser({ password });
  if (error) redirect("/admin/account?error=save");
  redirect("/admin/account?saved=1");
}
