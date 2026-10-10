import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing explains the product and provides crawlable search metadata", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const response = await request.get("/");
  const html = await response.text();
  expect(response.status()).toBe(200);
  expect(html).toContain("How does the AI investment research assistant work?");
  expect(html).toContain("Congress, insiders, funds");
  await page.goto("/");
  await expect(page).toHaveTitle(
    "Tape — AI Stock Research & Portfolio Analysis",
  );
  await expect(page.locator("h1")).toHaveCount(1);
  expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(
    "https://tape-five-zeta.vercel.app",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index, follow",
  );
  expect(
    (await page.locator('meta[name="description"]').getAttribute("content"))
      ?.length,
  ).toBeGreaterThan(100);
  const schema = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText(),
  );
  expect(schema["@graph"].map((x: { "@type": string }) => x["@type"])).toEqual([
    "Organization",
    "WebSite",
    "WebPage",
    "SoftwareApplication",
  ]);
  const image = await page
    .locator('meta[property="og:image"]')
    .first()
    .getAttribute("content");
  expect(image).toMatch(/^https:\/\/tape-five-zeta.vercel.app\//);
  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain(
    "<loc>https://tape-five-zeta.vercel.app</loc>",
  );
  expect(await sitemap.text()).not.toContain("/auth");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain(
    "Sitemap: https://tape-five-zeta.vercel.app/sitemap.xml",
  );
  const auth = await request.get("/auth/sign-in");
  expect(await auth.text()).toContain("noindex, nofollow");
  const anchors = await page
    .locator('a[href^="#"]')
    .evaluateAll((elements) =>
      elements.map((el) => el.getAttribute("href")!.slice(1)),
    );
  for (const id of anchors)
    expect(await page.locator(`[id="${id}"]`).count(), id).toBe(1);
  await page
    .getByText("Does Tape use live market data?", { exact: true })
    .click();
  await expect(
    page.getByText(/The current release uses an illustrative dataset/),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Ticker deep-dive" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("What could go wrong");
  await page.getByRole("tab", { name: "Ticker deep-dive" }).press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Portfolio X-ray" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText(
    "Research the risk you own.",
  );
  await page.getByRole("tab", { name: "Portfolio X-ray" }).press("Home");
  await expect(page.getByRole("tab", { name: "Morning brief" })).toBeFocused();
  await page.screenshot({
    path: "artifacts/landing-redesign-desktop.png",
    fullPage: true,
  });
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    accessibility.violations.map((v) => ({
      id: v.id,
      description: v.description,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

test("mobile content, navigation, tabs and CTAs work without overflow", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 375, 390, 640, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `Page overflow at ${width}px`,
    ).toBe(true);
    await expect(
      page.getByRole("heading", {
        name: "The tools connect. The picture gets clearer.",
      }),
    ).toBeVisible();
    for (const name of [
      "Ticker deep-dive",
      "Portfolio X-ray",
      "Morning brief",
    ]) {
      await page.getByRole("tab", { name, exact: true }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${name} overflow at ${width}px`,
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "FAQs", exact: true })
    .click();
  await expect(page).toHaveURL(/#questions$/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Workspace", exact: true })
    .focus();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "artifacts/landing-redesign-mobile.png",
    fullPage: true,
  });
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    accessibility.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page
    .getByRole("link", { name: "Explore the workspace", exact: true })
    .click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(
    page.getByRole("heading", { name: /3 strong setups/ }),
  ).toBeVisible();
});
