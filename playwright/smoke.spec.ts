import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("loads and shows net worth", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Net Worth")).toBeVisible();
  });

  test("shows recent transactions section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Recent Transactions")).toBeVisible();
  });

  test("shows budget progress section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Budgets" })).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("navigates to accounts page", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Accounts");
    await expect(page).toHaveURL("/accounts");
    await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
  });

  test("navigates to transactions page", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Transactions");
    await expect(page).toHaveURL("/transactions");
    await expect(page.getByRole("heading", { name: "Transactions" })).toBeVisible();
  });

  test("navigates to budgets page", async ({ page }) => {
    await page.goto("/budgets");
    await expect(page.getByRole("heading", { name: "Budgets" })).toBeVisible();
  });

  test("navigates to analytics page", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  });

  test("navigates to subscriptions page", async ({ page }) => {
    await page.goto("/subscriptions");
    await expect(page.getByRole("heading", { name: "Subscriptions" })).toBeVisible();
  });
});

test.describe("Transactions", () => {
  test("shows transaction list", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByText("Tesco")).toBeVisible();
  });

  test("search filters transactions", async ({ page }) => {
    await page.goto("/transactions");
    const search = page.getByPlaceholder("Search merchants...");
    await search.fill("Netflix");
    await expect(page.getByText("Netflix").first()).toBeVisible();
    await expect(page.getByText("Tesco")).not.toBeVisible();
  });

  test("filters panel opens", async ({ page }) => {
    await page.goto("/transactions");
    await page.getByText("Filters").click();
    await expect(page.locator("select").first()).toBeVisible();
  });
});

test.describe("Budgets", () => {
  test("shows budget categories with progress", async ({ page }) => {
    await page.goto("/budgets");
    await expect(page.getByText("Groceries")).toBeVisible();
    await expect(page.getByText("Transport")).toBeVisible();
  });

  test("shows overall budget summary", async ({ page }) => {
    await page.goto("/budgets");
    await expect(page.getByText("Total Budget")).toBeVisible();
  });
});

test.describe("Subscriptions", () => {
  test("shows detected subscriptions", async ({ page }) => {
    await page.goto("/subscriptions");
    await expect(page.getByText("Netflix")).toBeVisible();
    await expect(page.getByText("Spotify")).toBeVisible();
  });

  test("shows monthly total", async ({ page }) => {
    await page.goto("/subscriptions");
    await expect(page.getByText("Monthly recurring")).toBeVisible();
  });
});
