import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// Real authentication code with controlled request cookies and Supabase replies.
const state = {
  jar: new Map<string, string>(),
  user: null as { id: string; email?: string } | null,
  profile: null as { display_name: string; role: string } | null,
  targetProfile: { role: "editor" },
  passwordUpdates: 0,
  resets: 0,
  signedOut: 0,
  cookieOptions: {} as Record<string, unknown>,
  client: {} as unknown,
  admin: {} as unknown
};
state.client = { auth: {
  getUser: async () => ({ data: { user: state.user }, error: null }),
  signInWithPassword: async ({ password }: { password: string }) => ({ data: { user: password === "correct-current-password" ? state.user : null }, error: password === "correct-current-password" ? null : new Error("Invalid credentials") }),
  signOut: async () => { state.signedOut++; return { error: null }; },
  updateUser: async () => { state.passwordUpdates++; return { error: null }; }
} };
state.admin = {
  from: () => ({ select: () => ({ eq: (_: string, id: string) => ({ single: async () => ({ data: id === state.user?.id ? state.profile : state.targetProfile, error: null }) }) }) }),
  auth: { admin: { updateUserById: async () => { state.resets++; return { error: null }; } } }
};
const fixtureKey = Symbol.for("pha.cms-auth-test");
(globalThis as unknown as Record<symbol, unknown>)[fixtureKey] = state;
const fixture = 'globalThis[Symbol.for("pha.cms-auth-test")]';
const modules: Record<string, string> = {
  "server-only": "export {};",
  "next/headers": `export async function cookies() { return { get: name => { const value = ${fixture}.jar.get(name); return value ? { value } : undefined; }, delete: name => ${fixture}.jar.delete(name), getAll: () => [] }; } export async function headers() { return new Map([["host", "www.psychedelicarchive.com"]]); }`,
  "next/navigation": "export function redirect(url) { throw new Error('Redirect: ' + url); }",
  "@supabase/ssr": `export function createServerClient(url, key, options) { ${fixture}.cookieOptions = options.cookieOptions; return ${fixture}.client; }`,
  "@/lib/admin-cms": `export const isAdminEnabled = true; export function getAdminSupabaseClient() { return ${fixture}.admin; }`,
  "@/lib/cms/repository": `export function cmsClient() { return ${fixture}.admin; }`
};
registerHooks({ resolve(specifier, context, nextResolve) {
  if (modules[specifier]) return { url: `data:text/javascript,${encodeURIComponent(modules[specifier])}`, shortCircuit: true };
  return nextResolve(specifier, context);
} });

process.env.CMS_SHARED_PASSWORD = "test-only-backup-password";
process.env.CMS_SESSION_SECRET = "test-only-session-secret";
process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-only-public-key";

const { getEditor, newPasswordSession, authClient } = await import("../src/lib/cms/auth");

test("production password sessions use secure, HTTP-only cookies", async () => {
  const environment: Record<string, string | undefined> = process.env;
  const previous = environment.NODE_ENV;
  environment.NODE_ENV = "production";
  try {
    await authClient();
    assert.equal(state.cookieOptions.secure, true);
    assert.equal(state.cookieOptions.httpOnly, true);
    assert.equal(state.cookieOptions.sameSite, "lax");
  } finally {
    if (previous === undefined) delete environment.NODE_ENV;
    else environment.NODE_ENV = previous;
  }
});

test("anonymous requests cannot enter the workspace", async () => {
  state.jar.clear(); state.user = null; state.profile = null;
  assert.equal(await getEditor(), null);
});

test("the owner backup remains available without a named session", async () => {
  const session = newPasswordSession(); state.jar.set(session.name, session.value);
  assert.equal((await getEditor())?.via, "password");
});

test("an editor keeps their individual role despite an old shared-owner cookie", async () => {
  state.user = { id: "editor-id" }; state.profile = { display_name: "Named editor", role: "editor" };
  assert.deepEqual(await getEditor(), { id: "editor-id", name: "Named editor", role: "editor" });
});

test("an individual owner is attributed by name", async () => {
  state.user = { id: "owner-id" }; state.profile = { display_name: "Named owner", role: "owner" };
  assert.deepEqual(await getEditor(), { id: "owner-id", name: "Named owner", role: "owner" });
});

test("a signed-in account without an editor profile cannot inherit backup access", async () => {
  state.user = { id: "uninvited-id" }; state.profile = null;
  assert.equal(await getEditor(), null);
});

const { signInEditor } = await import("../src/app/editor-login/actions");
const { changePassword } = await import("../src/app/admin/account/actions");
const { resetEditorPassword } = await import("../src/app/admin/team/actions");
const form = (values: Record<string, string>) => { const data = new FormData(); for (const [key, value] of Object.entries(values)) data.set(key, value); return data; };
const named = (role: "owner" | "editor") => {
  state.user = { id: "signed-in-id", email: "editor@example.org" };
  state.profile = { display_name: "Named person", role };
};

test("individual password sign-in removes leftover backup access", async () => {
  named("editor");
  assert.ok(state.jar.has("phs_workspace"));
  await assert.rejects(signInEditor(form({ email: "editor@example.org", password: "correct-current-password" })), /Redirect: \/admin\/sources/);
  assert.equal(state.jar.has("phs_workspace"), false);
});

test("a correct password without an editor profile still cannot enter", async () => {
  named("editor"); state.profile = null;
  const before = state.signedOut;
  await assert.rejects(signInEditor(form({ email: "editor@example.org", password: "correct-current-password" })), /error=access/);
  assert.equal(state.signedOut, before + 1);
});

test("changing your password requires the current password and matching new values", async () => {
  named("editor"); const before = state.passwordUpdates;
  await assert.rejects(changePassword(form({ current_password: "wrong", new_password: "long-new-password", confirm_password: "long-new-password" })), /error=current/);
  await assert.rejects(changePassword(form({ current_password: "correct-current-password", new_password: "long-new-password", confirm_password: "different-password" })), /error=match/);
  assert.equal(state.passwordUpdates, before);
  await assert.rejects(changePassword(form({ current_password: "correct-current-password", new_password: "long-new-password", confirm_password: "long-new-password" })), /saved=1/);
  assert.equal(state.passwordUpdates, before + 1);
});

test("editors cannot reset another account's password", async () => {
  named("editor"); const before = state.resets;
  await assert.rejects(resetEditorPassword(form({ user_id: "another-id", new_password: "long-new-password", confirm_password: "long-new-password" })), /Only the project owner/);
  assert.equal(state.resets, before);
});

test("owners may reset collaborator passwords but must use My account for their own", async () => {
  named("owner"); const before = state.resets;
  await assert.rejects(resetEditorPassword(form({ user_id: "another-id", new_password: "long-new-password", confirm_password: "long-new-password" })), /reset=1/);
  assert.equal(state.resets, before + 1);
  await assert.rejects(resetEditorPassword(form({ user_id: "signed-in-id", new_password: "long-new-password", confirm_password: "long-new-password" })), /error=owner/);
  assert.equal(state.resets, before + 1);
});
