import { test, expect } from '@playwright/test';

test('register, login, create post, open notifications', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
  await page.goto(base + '/register');
  await page.fill('input[name="firstName"]', 'Alice');
  await page.fill('input[name="lastName"]', 'A');
  await page.fill('input[name="email"]', 'alice@example.com');
  await page.fill('input[name="password"]', 'secret123');
  await page.click('button:has-text("Create account")');

  // Should land on home once authenticated
  await page.waitForURL(base + '/');
  await expect(page.getByRole('button', { name: 'Post' })).toBeVisible();

  // Create a post
  await page.fill('textarea', 'Hello world from E2E');
  await page.getByRole('button', { name: 'Post' }).click();
  await expect(page.getByText('Hello world from E2E')).toBeVisible();

  // Open notifications panel (should be empty initially)
  await page.click('button[aria-label="Notifications"]');
  await expect(page.locator('text=No notifications')).toBeVisible();
});
