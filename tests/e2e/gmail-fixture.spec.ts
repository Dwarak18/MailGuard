import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('MailGuard E2E - Gmail fixture (DOM injection)', () => {
  test.skip(true, 'Skipping browser-based E2E tests in this environment');
  
  test('injects banner for phishing-like sample in fixture', async ({ page }) => {
    const fixturePath = path.resolve(__dirname, 'fixtures', 'gmail_fixture.html');
    await page.goto('file://' + fixturePath);

    // Wait for the in-page analysis to insert the banner
    await page.waitForSelector('#mailguard-banner', { timeout: 3000 });

    const banner = page.locator('#mailguard-banner');
    await expect(banner).toBeVisible();

    const scoreAttr = await banner.getAttribute('data-mailguard-score');
    const score = scoreAttr ? parseInt(scoreAttr, 10) : 0;
    expect(score).toBeGreaterThanOrEqual(35);

    const reasons = await banner.locator('ul li').allTextContents();
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons.some(r => /Display name|URL|Contains urgency|Invalid URL|encoded|IP|verify|account/i.test(r))).toBeTruthy();
  });
});
