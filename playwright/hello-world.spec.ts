import { expect, test } from '@playwright/test';
import { SERVICE_ACCOUNTS_URL, ensureLoggedIn } from './test-utils';

/**
 * E2E tests for Service Accounts.
 * Requires E2E_USER and E2E_PASSWORD (CI/Konflux pipeline provides these).
 * Pattern follows learning-resources: https://github.com/RedHatInsights/learning-resources/tree/master/playwright
 */
test.use({ ignoreHTTPSErrors: true });

test.describe('Service Accounts - Authenticated E2E', () => {
  test.beforeEach(async ({ page }): Promise<void> => {
    if (!process.env.E2E_USER || !process.env.E2E_PASSWORD) {
      test.skip(
        true,
        'E2E_USER and E2E_PASSWORD required for authenticated tests'
      );
    }
    await ensureLoggedIn(page);
  });

  test('should load the service accounts page successfully', async ({
    page,
  }) => {
    await page.goto(SERVICE_ACCOUNTS_URL);
    await page.waitForLoadState('load');

    // Use OUIA selector - more reliable than h1 (console shell may have other h1s)
    const pageTitle = page.locator(
      '[data-ouia-component-id="service-accounts-page-title"]'
    );
    await expect(pageTitle).toBeVisible({ timeout: 15000 });
    await expect(pageTitle).toHaveText('Service Accounts');
    await expect(page).toHaveURL(/.*\/iam\/service-accounts/);
  });
});
