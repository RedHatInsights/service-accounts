import { expect, test } from '@playwright/test';

test.describe('Service Accounts - Basic Rendering', () => {
  test('should render the site correctly', async ({ page }) => {
    // Navigate to the application
    await page.goto('/iam/service-accounts');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Verify the page loaded successfully
    const bodyElement = await page.locator('body');
    await expect(bodyElement).toBeVisible();

    // Verify we have a valid page title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
