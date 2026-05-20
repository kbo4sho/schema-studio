import { expect, test } from "@playwright/test";

test("builds, hydrates, validates, and submits the seeded form", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Schema Studio" })).toBeVisible();
  const preview = page.locator(".preview-panel");
  await expect(preview.getByLabel("State")).toBeVisible();

  const inspector = page.locator(".inspector-panel");
  await expect(inspector.getByRole("button", { name: "Close inspector" })).toHaveCount(0);
  await expect(inspector.getByRole("button", { name: "Generate field name from label" })).toHaveCount(0);
  await inspector.getByRole("textbox", { name: "Label", exact: true }).fill("Employee full name");
  await expect(preview.getByLabel("Employee full name")).toBeVisible();
  await expect(page.getByLabel("Live JSON schema")).toHaveValue(/Employee full name/);

  await preview.getByLabel("Work email").click();
  await expect(inspector.getByRole("textbox", { name: "Label", exact: true })).toHaveValue("Work email");

  await preview.getByLabel("Country").selectOption("CA");
  await expect(preview.getByLabel("State")).toBeHidden();

  await page.getByRole("button", { name: "Hydrate preview" }).click();
  await expect(page.getByText("Schema imported and hydrated successfully.")).toBeVisible();

  await page.getByRole("button", { name: "Submit mock form" }).click();
  await expect(preview.getByRole("alert")).toHaveCount(4);

  await preview.getByLabel("Employee full name").fill("Jane Chen");
  await preview.getByLabel("Work email").fill("jane@company.com");
  await preview.getByLabel("State").selectOption("IL");
  await preview.getByLabel("Preferred start date").fill("2026-06-01");
  await preview.getByLabel("I confirm this request follows company policy.").check();
  await page.getByRole("button", { name: "Submit mock form" }).click();

  await expect(page.getByText("Submitting mock enrollment...")).toBeVisible();
  await expect(page.getByText(/Mock submission (accepted|failed)/)).toBeVisible();
});
