import { test, expect } from '@playwright/test';

test('send and accept friend request', async ({ page, browser }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:3000';

  // Register user A
  await page.goto(base + '/register');
  await page.fill('input[placeholder="Jane"]', 'User');
  await page.fill('input[placeholder="Doe"]', 'A');
  await page.fill('input[type="email"]', 'usera@example.com');
  await page.fill('input[type="password"]', 'secret123');
  await page.click('button:has-text("Create account")');
  await page.waitForURL(base + '/');

  // Grab auth token from localStorage
  const tokenA = await page.evaluate(() => JSON.parse(localStorage.getItem('persist:root')!).auth);

  // New context for user B
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await pageB.goto(base + '/register');
  await pageB.fill('input[placeholder="Jane"]', 'User');
  await pageB.fill('input[placeholder="Doe"]', 'B');
  await pageB.fill('input[type="email"]', 'userb@example.com');
  await pageB.fill('input[type="password"]', 'secret123');
  await pageB.click('button:has-text("Create account")');
  await pageB.waitForURL(base + '/');

  // User A sends friend request to B using API
  const authA = JSON.parse(tokenA);
  const meB = await pageB.request.get('/api/auth/me', { headers: { Authorization: `Bearer ${authA.token}` } });
  const userARes = await page.request.get('/api/auth/me');
  const userAData = await userARes.json();
  const userBRes = await pageB.request.get('/api/auth/me');
  const userBData = await userBRes.json();

  await page.request.post('/api/friends/request', {
    data: { recipientId: userBData._id || userBData.id },
  });

  await pageB.goto(base + '/friends');
  await expect(pageB.getByText('Friend Requests')).toBeVisible();
  await pageB.getByRole('button', { name: 'Accept' }).click();
  await expect(pageB.getByText('Your Friends')).toBeVisible();
});

