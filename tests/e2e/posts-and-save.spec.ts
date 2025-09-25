import { test, expect } from '@playwright/test';

test('create, react, comment, save, unsave', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
  await page.goto(base + '/register');
  await page.fill('input[name="firstName"]', 'Bob');
  await page.fill('input[name="lastName"]', 'B');
  await page.fill('input[name="email"]', 'bob@example.com');
  await page.fill('input[name="password"]', 'secret123');
  await page.click('button:has-text("Create account")');
  await page.waitForURL(base + '/');

  await page.fill('textarea', 'Post for actions');
  await page.getByRole('button', { name: 'Post' }).click();
  await expect(page.getByText('Post for actions')).toBeVisible();

  // React buttons are visible (uses text labels)
  await page.getByRole('button', { name: 'like' }).click();
  await page.getByRole('button', { name: 'Comment' }).click();

  // Save
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('link', { name: 'Saved' }).click();
  await expect(page.getByText('Post for actions')).toBeVisible();
  await page.getByRole('button', { name: 'Unsave' }).click();
});

