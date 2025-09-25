import { test, expect } from '@playwright/test';

test('pages and groups basic flows', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
  await page.goto(base + '/register');
  await page.fill('input[name="firstName"]', 'PG');
  await page.fill('input[name="lastName"]', 'User');
  await page.fill('input[name="email"]', 'pguser@example.com');
  await page.fill('input[name="password"]', 'secret123');
  await page.click('button:has-text("Create account")');
  await page.waitForURL(base + '/');

  await page.getByRole('link', { name: 'Pages' }).click();
  await page.fill('input[placeholder="Create page name"]', 'My Test Page');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('My Test Page')).toBeVisible();
  await page.getByRole('button', { name: 'Follow' }).click();
  await page.getByRole('button', { name: 'Unfollow' }).click();

  await page.getByRole('link', { name: 'Groups' }).click();
  await page.fill('input[placeholder="Create group name"]', 'My Test Group');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('My Test Group')).toBeVisible();
  await page.getByRole('button', { name: 'Join' }).click();
  await page.getByRole('button', { name: 'Leave' }).click();
});

