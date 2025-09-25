import { test, expect } from '@playwright/test';

test('real-time notifications increment and list', async ({ page, browser }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:3000';

  // User A
  await page.goto(base + '/register');
  await page.fill('input[name="firstName"]', 'Notif');
  await page.fill('input[name="lastName"]', 'One');
  await page.fill('input[name="email"]', 'notif1@example.com');
  await page.fill('input[name="password"]', 'secret123');
  await page.click('button:has-text("Create account")');
  await page.waitForURL(base + '/');

  // User B
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  await page2.goto(base + '/register');
  await page2.fill('input[name="firstName"]', 'Notif');
  await page2.fill('input[name="lastName"]', 'Two');
  await page2.fill('input[name="email"]', 'notif2@example.com');
  await page2.fill('input[name="password"]', 'secret123');
  await page2.click('button:has-text("Create account")');
  await page2.waitForURL(base + '/');

  // A creates a post
  await page.fill('textarea', 'Ping for notification');
  await page.getByRole('button', { name: 'Post' }).click();
  await expect(page.getByText('Ping for notification')).toBeVisible();

  // Make them friends via API to ensure notifications fanout
  const meA = await page.request.get('/api/auth/me');
  const meB = await page2.request.get('/api/auth/me');
  const uA = await meA.json();
  const uB = await meB.json();
  await page.request.post('/api/friends/request', { data: { recipientId: uB._id || uB.id } });
  await page2.request.post('/api/friends/accept', { data: { requesterId: uA._id || uA.id } });

  // B should get notifications when liking A's post
  await page2.getByRole('button', { name: 'like' }).click();

  // Open notifications for A
  await page.click('button[aria-label="Notifications"]');
  // Either unread shows or list has items
  await expect(page.locator('text=post react')).toBeVisible();
});

