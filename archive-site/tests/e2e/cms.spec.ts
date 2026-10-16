import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { withWorkspace, workspaceRoot } from "../../src/lib/cms/local-store";

test.skip(process.env.CMS_E2E_LOCAL !== "1", "CMS tests need a server started with CMS_LOCAL_DATA=true; they never run against live data.");
test("add, edit, upload, preview, publish, and revise a source without losing private work", async ({ page, context }, testInfo) => {
  test.setTimeout(90_000);
  const title = `CMS verification ${testInfo.project.name} ${Date.now()}`;
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  let id = "";
  try {
    await page.goto("/admin/sources");
    await expect(page.getByText("Local workspace.", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Add source", exact: true }).first().click();
    await page.getByLabel("Title", { exact: true }).fill(title);
    await page.getByLabel("Original source link").fill("https://example.org/original");
    await page.getByRole("button", { name: "Create draft", exact: true }).click();
    await expect(page.getByLabel("Source title", { exact: true })).toHaveValue(title);
    id = page.url().split("/").pop()!;
    await page.getByRole("button", { name: "Add reading text", exact: true }).click();
    const text = page.getByRole("textbox", { name: "Reading text", exact: true });
    await text.fill("Source-faithful reading text, prepared by a human editor.");
    await text.press("End");
    await page.getByRole("button", { name: "Add footnote", exact: true }).click();
    await page.getByLabel("Footnote text", { exact: true }).fill("A useful editorial note with an attribution.");
    await page.getByRole("button", { name: "Insert footnote", exact: true }).click();
    await page.locator('.cms-text-part input[type="file"]').setInputFiles({ name: "scan.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64") });
    await page.getByLabel("Caption", { exact: true }).fill("A scan from the original item.");
    await page.getByLabel("Credit", { exact: true }).fill("Holding archive");
    await page.getByLabel("Image description", { exact: true }).fill("A page from the original source.");
    await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
    await page.getByRole("button", { name: "Preview", exact: true }).click();
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(page.getByText("Source-faithful reading text, prepared by a human editor.", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("figure", { name: /A scan from the original item/ }).first()).toBeVisible();
    await expect(page.getByRole("region", { name: "Notes", exact: true }).getByText("A useful editorial note with an attribution.", { exact: false })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.getByRole("button", { name: "Publish locally", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Publish locally", exact: true }).click();
    await expect(page.getByLabel("Source title", { exact: true })).toHaveValue(title);
    await expect(page.getByText("Published. All edits here stay private until you publish changes.")).toBeVisible();

    const second = await context.newPage(); await second.goto(`/admin/sources/${id}`);
    await expect(second.getByLabel("Source title", { exact: true })).toHaveValue(title);
    await page.getByLabel("Source title", { exact: true }).fill(`${title} — private revision`);
    await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
    await second.getByLabel("Source title", { exact: true }).fill("An edit from another tab");
    await expect(second.locator(".cms-error")).toContainText("Another editor or tab saved");
    const workspace = JSON.parse(await fs.readFile(path.resolve("../.cms-local/sources.json"), "utf8"));
    const row = workspace.rows.find((r: { id: string }) => r.id === id);
    expect(row.published.document.title).toBe(title);
    expect(row.model.document.title).toBe(`${title} — private revision`);
    await second.close();

    await page.getByRole("button", { name: "Move to drafts", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Move to drafts", exact: true }).click();
    await expect(page.getByText("Private draft. Only editors can see it.")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Source title", { exact: true })).toHaveValue(`${title} — private revision`);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    const privateResponse = await page.request.get(`/admin/sources/${id}/preview`, { headers: { Host: "untrusted.example" }, maxRedirects: 0 });
    expect(privateResponse.status()).toBe(307);
    expect(privateResponse.headers().location).toContain("/editor-login");
  } finally {
    if (id) {
      await withWorkspace(w => { w.rows = w.rows.filter(r => r.id !== id); });
      await fs.rm(path.join(workspaceRoot, "uploads", id), { recursive: true, force: true });
    }
  }
});
