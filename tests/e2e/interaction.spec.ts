import { expect, test } from '@playwright/test';

test.describe('theme toggle', () => {
  test('flips the theme, persists it, and survives reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const toggle = page.getByRole('button', { name: 'Dark mode' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('follows the system preference when nothing is stored', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
    await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

test('in-page navigation reaches every section', async ({ page }) => {
  await page.goto('/');
  const links = page.getByRole('navigation', { name: 'Sections' }).getByRole('link');
  for (const link of await links.all()) {
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^#[a-z-]+$/);
    await expect(page.locator(href ?? '')).toHaveCount(1);
  }
});

test('print view hides chrome and expands collapsed content', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));

  await expect(page.getByRole('banner')).toBeHidden();
  for (const details of await page.locator('details').all()) {
    await expect(details).toHaveJSProperty('open', true);
  }

  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await expect(page.locator('details').first()).toHaveJSProperty('open', false);
});
