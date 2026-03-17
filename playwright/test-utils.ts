/* eslint-disable no-unused-vars -- Page used as type in params */
import { Page, expect } from '@playwright/test';

/**
 * Test utilities for Service Accounts E2E tests.
 * Pattern adapted from learning-resources:
 * https://github.com/RedHatInsights/learning-resources/blob/master/playwright/test-utils.ts
 */

export const SERVICE_ACCOUNTS_URL = '/iam/service-accounts';

/**
 * Prevents inconsistent cookie prompting that is problematic for UI testing.
 */
export async function disableCookiePrompt(page: Page): Promise<void> {
  await page.route('**/*', async (route, request) => {
    if (
      request.url().includes('consent.trustarc.com') &&
      request.resourceType() !== 'document'
    ) {
      await route.abort();
    } else {
      await route.continue();
    }
  });
}

/**
 * Performs SSO login using Red Hat Keycloak form.
 * Uses label-based selectors (matching learning-resources) for stability.
 */
export async function login(
  page: Page,
  user: string,
  password: string
): Promise<void> {
  await expect(
    page.locator('text=Lockdown'),
    'proxy config incorrect'
  ).toHaveCount(0);

  await disableCookiePrompt(page);

  await page.getByLabel('Red Hat login').first().fill(user);
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByLabel('Password').first().fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByText('Invalid login')).not.toBeVisible();
}

/**
 * Ensures the user is logged in. Navigates to root, checks for existing session,
 * and performs SSO login only when needed.
 */
export async function ensureLoggedIn(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'load', timeout: 60000 });

  const loggedIn = await page.getByText('Hi,').isVisible();

  if (!loggedIn) {
    const user = process.env.E2E_USER;
    const password = process.env.E2E_PASSWORD;

    if (!user || !password) {
      throw new Error(
        'E2E_USER and E2E_PASSWORD required for authenticated tests'
      );
    }

    await page.waitForLoadState('load');
    await expect(page.locator('#username-verification')).toBeVisible();
    await login(page, user, password);
    await page.waitForLoadState('load');
    await expect(page.getByText('Invalid login')).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Add widgets' }),
      'dashboard not displayed'
    ).toBeVisible({ timeout: 30000 });

    const acceptAllButton = page.getByRole('button', { name: 'Accept all' });
    if (await acceptAllButton.isVisible()) {
      await acceptAllButton.click();
    }
  }
}
