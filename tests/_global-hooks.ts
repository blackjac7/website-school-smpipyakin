import { test as base } from "@playwright/test";

// Global hooks to stub external network requests (images/avatars) to make tests stable
base.beforeEach(async ({ page }) => {
  // small transparent SVG used as a lightweight image fallback
  const tinySvg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#eee"/></svg>`;

  // Fulfill requests to common external image providers with a tiny SVG
  await page.route("**/res.cloudinary.com/**", (route) =>
    route.fulfill({
      status: 200,
      headers: { "Content-Type": "image/svg+xml" },
      body: tinySvg,
    })
  );
  await page.route("**/ui-avatars.com/**", (route) =>
    route.fulfill({
      status: 200,
      headers: { "Content-Type": "image/svg+xml" },
      body: tinySvg,
    })
  );
  await page.route("**/images.unsplash.com/**", (route) =>
    route.fulfill({
      status: 200,
      headers: { "Content-Type": "image/svg+xml" },
      body: tinySvg,
    })
  );

  // Abort analytics/tracking endpoints to avoid network noise and slowdowns
  await page.route("**/google-analytics.com/**", (route) => route.abort());
  await page.route("**/googletagmanager.com/**", (route) => route.abort());
});
