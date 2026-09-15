import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const scheme of ['light', 'dark'] as const) {
  test(`has no WCAG 2.2 AA violations in ${scheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');

    // Expand collapsed content so it is audited too.
    await page.locator('details').evaluateAll((els) => {
      els.forEach((el) => ((el as HTMLDetailsElement).open = true));
    });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test('exposes the expected landmarks and heading outline', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

  const h2s = await page.getByRole('heading', { level: 2 }).allTextContents();
  expect(h2s).toEqual(expect.arrayContaining(['Experience', 'Skills']));
});

test('skip link is the first focusable element and moves focus to main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('every external link opens safely and announces itself', async ({ page }) => {
  await page.goto('/');
  const external = page.locator('a[href^="http"]');
  const count = await external.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    const link = external.nth(i);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('rel', /noreferrer/);
    const href = (await link.getAttribute('href')) ?? '';
    expect(await link.locator('.visually-hidden').count(), href).toBe(1);
  }
});

test('images have alt text and the portrait is prioritised', async ({ page }) => {
  await page.goto('/');
  const images = page.locator('img');
  for (const img of await images.all()) {
    expect(await img.getAttribute('alt')).toBeTruthy();
  }
  const portrait = page.locator('#top img');
  await expect(portrait).toHaveAttribute('fetchpriority', 'high');
  await expect(portrait).toHaveAttribute('loading', 'eager');
  await expect(page.locator('#top picture source[type="image/avif"]')).toHaveCount(1);
});
