import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/** Letter page at 96 dpi is 1056 px tall; with 0.5in margins about 960 px is printable. */
const PRINTABLE_PAGE_PX = 960;
const MAX_PAGES = 2;

test.describe('printable résumé', () => {
  test('is reachable from the site header and links back', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('banner').getByRole('link', { name: 'Save as PDF' });
    await expect(link).toHaveAttribute('href', /\/cv\/\?print$/);

    await page.goto('/cv/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to the full profile' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  test('is not indexed and not in the sitemap', async ({ page, request }) => {
    await page.goto('/cv/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    const sitemap = await request.get('/sitemap-0.xml');
    if (sitemap.ok()) expect(await sitemap.text()).not.toContain('/cv');
  });

  test('has no WCAG 2.2 AA violations', async ({ page }) => {
    await page.goto('/cv/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('prints as a document: no site chrome, no URL clutter, fits the page budget', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Page budget is measured at Letter width');
    await page.setViewportSize({ width: 816, height: 1056 });
    await page.goto('/cv/');
    await page.emulateMedia({ media: 'print' });

    await expect(page.getByRole('navigation', { name: 'Résumé actions' })).toBeHidden();

    // The home page's print stylesheet must not leak in (it appends hrefs after links).
    const appended = await page
      .locator('a[href^="http"]')
      .first()
      .evaluate((a) => getComputedStyle(a, '::after').content);
    expect(appended).toBe('none');

    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(
      height,
      `résumé is ${(height / PRINTABLE_PAGE_PX).toFixed(2)} pages tall`,
    ).toBeLessThanOrEqual(PRINTABLE_PAGE_PX * MAX_PAGES);
  });

  test('?print opens the dialog once and cleans the URL', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { printed: number }).printed = 0;
      window.print = () => {
        (window as unknown as { printed: number }).printed += 1;
      };
    });
    await page.goto('/cv/?print');
    await page.waitForLoadState('load');
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { printed: number }).printed))
      .toBe(1);
    expect(new URL(page.url()).search).toBe('');
  });
});
