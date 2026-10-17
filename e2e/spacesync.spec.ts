import { test, expect } from "@playwright/test";

test.describe("SpaceSync E2E — Public Website, Empty States, Route Guards & Mobile Layout", () => {
  test("1. Renders Landing Page with tagline, Peace Score architecture diagram, and waitlist", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Somewhere out there is your perfect flatmate/i })
    ).toBeVisible();
    await expect(
      page.getByText(/System Illustration — Deterministic Formula/i)
    ).toBeVisible();
    await expect(page.getByTestId("waitlist-form")).toBeVisible();
  });

  test("2. Renders all 10 required public website pages accurately", async ({ page }) => {
    const routes = [
      { path: "/how-it-works", heading: /How SpaceSync Works/i },
      { path: "/peace-score", heading: /How the Peace Score Works/i },
      { path: "/pricing", heading: /Core flatmate matching is free/i },
      { path: "/about", heading: /Home feels better when your rhythms align/i },
      { path: "/faqs", heading: /Frequently Asked Questions/i },
      { path: "/contact", heading: /Contact & Support/i },
      { path: "/privacy", heading: /Privacy Policy/i },
      { path: "/terms", heading: /Terms of Use/i },
      { path: "/guidelines", heading: /Community Guidelines/i },
    ];

    for (const route of routes) {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
    }
  });

  test("3. Displays honest empty orbit state on /discover when database has zero profiles", async ({
    page,
  }) => {
    await page.goto("/discover");
    await expect(page.getByTestId("discovery-filters")).toBeVisible();
    await expect(page.getByTestId("empty-orbit-state")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "There isn't anyone in your orbit just yet." })
    ).toBeVisible();
  });

  test("4. Redirects unauthenticated visitors from protected routes to /login", async ({
    page,
  }) => {
    const protectedPaths = [
      "/onboarding",
      "/connections",
      "/messages",
      "/profile",
      "/settings",
      "/notifications",
      "/admin",
    ];

    for (const p of protectedPaths) {
      await page.goto(p);
      await expect(page).toHaveURL(new RegExp(`/login\\?redirectTo=${encodeURIComponent(p)}`));
    }
  });

  test("5. Validates 18+ age confirmation on Signup form before attempting registration", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.fill("#signup-first-name", "Aarav");
    await page.fill("#signup-email", "aarav@example.com");
    await page.fill("#signup-password", "Password123");
    await page.fill("#signup-confirm", "Password123");
    // Leave 18+ checkbox unchecked
    await page.click('button[type="submit"]');
    await expect(page.getByTestId("signup-error")).toContainText(/18 years or older/i);
  });

  test("6. Supports mobile viewport navigation drawer on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const menuToggle = page.getByTestId("mobile-menu-toggle");
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();
    const drawer = page.getByTestId("mobile-nav-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Peace Score" })).toBeVisible();
  });
});
