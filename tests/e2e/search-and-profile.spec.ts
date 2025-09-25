import { test, expect } from '@playwright/test';

test('search users and open profile page', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
  await page.goto(base + '/register');
  await page.fill('input[name="firstName"]', 'Search');
  await page.fill('input[name="lastName"]', 'User');
  await page.fill('input[name="email"]', 'searcher@example.com');
  await page.fill('input[name="password"]', 'secret123');
  await page.click('button:has-text("Create account")');
  await page.waitForURL(base + '/');

  // Create a second user to find
  const ctx2 = await page.context().browser()?.newContext();
  const p2 = await ctx2!.newPage();
  await p2.goto(base + '/register');
  await p2.fill('input[name="firstName"]', 'Find');
  await p2.fill('input[name="lastName"]', 'Me');
  await p2.fill('input[name="email"]', 'findme@example.com');
  await p2.fill('input[name="password"]', 'secret123');
  await p2.click('button:has-text("Create account")');
  await p2.waitForURL(base + '/');

  // Back to first user, search
  await page.getByPlaceholder('Search Palebook').pressSequentially('Find', { delay: 10 });
  await page.keyboard.press('Enter');
  await expect(page.getByText('Find Me')).toBeVisible();
});

