import { expect, test } from "@playwright/test";

test("loads a predefined configuration into the animated form canvas", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Load a form system" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Treasury onboarding/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Working capital line/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Benefits enrollment/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No form loaded" })).toBeVisible();

  await page.getByRole("button", { name: /Treasury onboarding/ }).click();

  await expect(page.getByRole("heading", { name: "Treasury Operating Account" })).toBeVisible();
  await expect(page.locator(".form-cell")).toHaveCount(5);
  await expect(page.getByRole("button", { name: /Business identity/ })).toBeVisible();
  await expect(page.getByLabel("Form contract")).toContainText("Account frame");
  await expect(page.getByLabel("Form contract")).not.toContainText('"title": "Treasury Operating Account"');

  await expect(page.getByLabel("Field properties")).toHaveCount(0);
  await page.getByRole("button", { name: /Properties Legal business name/ }).click();
  const fieldProperties = page.getByLabel("Field properties");
  await expect(fieldProperties.getByRole("heading", { name: "Legal business name" })).toBeVisible();
  await fieldProperties.getByLabel("Label").fill("Registered legal name");
  await fieldProperties.getByLabel("Name").fill("registeredLegalName");
  await fieldProperties.getByLabel("Placeholder").fill("Registered entity");
  await expect(fieldProperties.getByRole("status")).toContainText("Changes saved");
  await expect(page.getByLabel("Form contract")).toContainText("Registered legal name");

  await page.getByRole("button", { name: "Code" }).click();
  await expect(page.getByLabel("Form contract")).toContainText('"title": "Treasury Operating Account"');
  await expect(page.getByLabel("Form contract")).toContainText('"name": "registeredLegalName"');
  await page.getByRole("button", { name: "Code" }).click();

  await page.getByRole("button", { name: /Payment profile/ }).click();
  await expect(page.getByLabel("Form contract")).toContainText("Monthly payment volume");
  await expect(page.getByLabel("Form contract")).toContainText("primaryFundingRail");

  await page.getByLabel("Canvas view").getByRole("button", { name: "Form", exact: true }).click();
  await expect(page.getByLabel("Treasury onboarding rendered form").getByLabel("Registered legal name")).toBeVisible();
  await expect(page.getByLabel("Treasury onboarding rendered form").getByLabel("Primary funding rail")).toBeVisible();
  await expect(page.locator(".cell-canvas")).toHaveCount(0);

  await page.getByLabel("Treasury onboarding rendered form").getByLabel("Monthly payment volume").click();
  await expect(page.getByLabel("Form contract")).toContainText("Payment profile");

  await page.getByLabel("Canvas view").getByRole("button", { name: "Cards", exact: true }).click();
  await expect(page.locator(".form-cell")).toHaveCount(5);
});
