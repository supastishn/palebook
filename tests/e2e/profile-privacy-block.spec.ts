import { test, expect } from '@playwright/test';

test('profile privacy and blocking flow', async ({ page, browser }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:3000';

  // User 1
  await page.goto(base + '/register');
  await page.fill('input[name="firstName"]', 'Priv');
  await page.fill('input[name="lastName"]', 'One');
  await page.fill('input[name="email"]', 'priv1@example.com');
  await page.fill('input[name="password"]', 'secret123');
  await page.click('button:has-text("Create account")');
  await page.waitForURL(base + '/');

  // Save persist root for API usage
  const state1 = await page.evaluate(() => localStorage.getItem('persist:root'));
  const auth1 = JSON.parse(JSON.parse(state1!).auth);

  // User 2
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  await page2.goto(base + '/register');
  await page2.fill('input[name="firstName"]', 'Priv');
  await page2.fill('input[name="lastName"]', 'Two');
  await page2.fill('input[name="email"]', 'priv2@example.com');
  await page2.fill('input[name="password"]', 'secret123');
  await page2.click('button:has-text("Create account")');
  await page2.waitForURL(base + '/');

  // User 1 sets profile/posts to friends
  await page.goto(base + '/settings');
  await page.selectOption('select', { label: 'Friends' });
  await page.getByRole('button', { name: 'Save' }).click();

  // Get IDs via API
  const me1 = await page.request.get('/api/auth/me');
  const u1 = await me1.json();
  const me2 = await page2.request.get('/api/auth/me');
  const u2 = await me2.json();

  // User 2 blocks user 1 (to test feed filtering)
  await page2.request.post('/api/users/block', { data: { userId: u1._id || u1.id } });

  // User 1 creates a post
  await page.goto(base + '/');
  await page.fill('textarea', 'Private-ish content');
  await page.getByRole('button', { name: 'Post' }).click();
  await expect(page.getByText('Private-ish content')).toBeVisible();

  // User 2 feed should not show it due to blocking
  await page2.goto(base + '/');
  await expect(page2.getByText('Private-ish content')).toHaveCount(0);
});

