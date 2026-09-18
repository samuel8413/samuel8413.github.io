import { expect, test } from '@playwright/test';

test('ships complete document metadata', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/\|/);
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description?.length).toBeGreaterThan(50);
  expect(description?.length).toBeLessThanOrEqual(160);

  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('embeds valid schema.org Person JSON-LD', async ({ page }) => {
  await page.goto('/');
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw ?? '{}') as Record<string, unknown>;
  expect(data['@context']).toBe('https://schema.org');
  expect(data['@type']).toBe('Person');
  expect(typeof data.name).toBe('string');
  expect(Array.isArray(data.knowsAbout)).toBe(true);
});

test('serves robots.txt and a 404 page', async ({ page, request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  const body = await robots.text();
  expect(body).toContain('User-agent: *');
  // Builds without SITE_URL carry no Sitemap line; when present it must be absolute.
  for (const [, url] of body.matchAll(/^Sitemap:\s*(.*)$/gm)) {
    expect(url).toMatch(/^https?:\/\/\S+$/);
  }

  const missing = await page.goto('/definitely-not-here');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
});

test('runs under its own Content Security Policy without violations', async ({ page }) => {
  const violations: string[] = [];
  page.on('console', (message) => {
    if (/Content Security Policy/i.test(message.text())) violations.push(message.text());
  });
  page.on('pageerror', (error) => violations.push(error.message));

  await page.goto('/');
  const csp = await page
    .locator('meta[http-equiv="content-security-policy"]')
    .getAttribute('content');
  expect(csp).toContain("default-src 'none'");
  expect(csp).toContain('script-src');
  expect(csp).not.toContain("'unsafe-inline'");

  // Exercise the interactive code paths so any blocked script would surface.
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await page.locator('details').first().click();

  expect(violations).toEqual([]);
});
