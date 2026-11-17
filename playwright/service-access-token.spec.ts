import { expect, test } from '@playwright/test';
import { SERVICE_ACCOUNTS_URL, ensureLoggedIn } from './test-utils';

// Credential dialogs and SSO responses must never enter CI artifacts.
test.use({ trace: 'off', screenshot: 'off', video: 'off' });

test.describe('Service access token - authenticated journey', () => {
  test.beforeEach(async ({ page }) => {
    if (!process.env.E2E_USER || !process.env.E2E_PASSWORD) {
      test.skip(true, 'E2E_USER and E2E_PASSWORD required');
    }
    await ensureLoggedIn(page);
  });

  test('creates, filters, resets, and deletes only its own token', async ({
    page,
  }) => {
    const name = `sat-e2e-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const description = 'Playwright SAT lifecycle fixture';
    const table = page.getByRole('table', {
      name: 'List of created service accounts',
    });
    const row = table.getByRole('row').filter({ hasText: name });
    let apiUrl: string | undefined;
    let authorization: string | undefined;
    let deleted = false;

    page.on('request', (request) => {
      if (
        request.method() === 'POST' &&
        request.url().includes('/apis/service_accounts/v1') &&
        !request.url().includes('/resetSecret')
      ) {
        apiUrl = request.url().split('?')[0];
        authorization = request.headers().authorization;
      }
    });

    const cleanup = async () => {
      if (deleted || !apiUrl || !authorization) return;
      const lookup = async () => {
        const response = await page.request.get(
          `${apiUrl}?name=${encodeURIComponent(name)}&first=0&max=2`,
          { headers: { Authorization: authorization } }
        );
        if (!response.ok())
          throw new Error(`SAT cleanup lookup failed (${response.status()})`);
        const matches: { id: string; name: string; type: string }[] =
          await response.json();
        if (
          !Array.isArray(matches) ||
          matches.length > 1 ||
          matches.some(
            (item) => item.name !== name || item.type !== 'service_access_token'
          )
        ) {
          throw new Error(
            'SAT cleanup lookup did not uniquely identify the fixture'
          );
        }
        return matches;
      };
      await expect
        .poll(async () => (await lookup()).length, { timeout: 10000 })
        .toBe(1);
      const [fixture] = await lookup();
      const result = await page.request.delete(`${apiUrl}/${fixture.id}`, {
        headers: { Authorization: authorization },
      });
      if (!result.ok())
        throw new Error(`SAT cleanup delete failed (${result.status()})`);
      await expect
        .poll(async () => (await lookup()).length, { timeout: 10000 })
        .toBe(0);
    };

    try {
      await page.goto(SERVICE_ACCOUNTS_URL);
      await expect(
        page.getByRole('button', { name: 'Create new' }),
        'SAT flag or create permission unavailable in stage'
      ).toBeVisible();
      await page.getByRole('button', { name: 'Create new' }).click();
      await page.getByText('Service access token', { exact: true }).click();

      const create = page.getByRole('dialog', {
        name: 'Create a service access token',
      });
      await create.getByLabel('Name').fill(name);
      await create.getByLabel('Short description').fill(description);
      await create.getByRole('button', { name: 'Create' }).click();

      const credentials = page.getByRole('dialog', {
        name: 'Service access token credentials',
      });
      await expect(credentials).toBeVisible();
      const username = await credentials
        .getByRole('textbox', { name: 'Username' })
        .inputValue();
      const token = await credentials
        .getByRole('textbox', { name: 'Token' })
        .inputValue();
      expect(username).toMatch(/^\|service-account-/);
      expect(token.length).toBeGreaterThan(0);
      await expect(
        credentials.getByRole('button', { name: 'Close' })
      ).toBeDisabled();
      await credentials
        .getByRole('checkbox', {
          name: 'I have copied the username and token',
        })
        .check();
      await credentials.getByRole('button', { name: 'Close' }).click();
      await expect(credentials).toBeHidden();

      const filters = `?name=${encodeURIComponent(
        name
      )}&type=service_access_token`;
      await page.goto(`${SERVICE_ACCOUNTS_URL}${filters}`);
      await expect(row).toBeVisible();
      await expect(row).toContainText('Token');
      await expect(row).toContainText(description);
      await expect(row).toContainText(
        username.replace(/^\|service-account-/, '')
      );
      await expect(row).not.toContainText(username);
      await expect(row.getByRole('cell').nth(3)).not.toBeEmpty();
      await expect(row.getByRole('cell').nth(4)).not.toBeEmpty();

      const openAction = async (action: string) => {
        await row.getByRole('button', { name: /actions/i }).click();
        await page.getByRole('menuitem', { name: action }).click();
      };

      await openAction('Reset credentials');
      const reset = page.getByRole('dialog', {
        name: 'Reset service access token credentials?',
      });
      await expect(reset).toContainText('username will stay the same');
      await reset.getByRole('button', { name: 'Cancel' }).click();
      await expect(reset).toBeHidden();
      await expect(page).toHaveURL(/type=service_access_token/);
      await openAction('Reset credentials');
      await reset.getByRole('button', { name: 'Reset' }).click();
      const replacement = page.getByRole('dialog', {
        name: 'Service access token credentials',
      });
      await expect(replacement).toBeVisible();
      await expect(
        replacement.getByRole('textbox', { name: 'Username' })
      ).toHaveValue(username);
      expect(
        (await replacement.getByRole('textbox', { name: 'Token' }).inputValue())
          .length
      ).toBeGreaterThan(0);
      await replacement
        .getByRole('checkbox', {
          name: 'I have copied the username and token',
        })
        .check();
      await replacement.getByRole('button', { name: 'Close' }).click();
      await page.goto(`${SERVICE_ACCOUNTS_URL}${filters}`);
      await expect(row).toBeVisible();

      await openAction('Delete service access token');
      const remove = page.getByRole('dialog', {
        name: 'Delete service access token?',
      });
      await expect(remove).toContainText(name);
      await remove.getByRole('button', { name: 'Cancel' }).click();
      await expect(row).toBeVisible();
      await expect(page).toHaveURL(/type=service_access_token/);
      await openAction('Delete service access token');
      await remove.getByRole('button', { name: 'Delete' }).click();
      await expect(
        page.getByText(`Service access token "${name}" has been deleted.`)
      ).toBeVisible();
      await expect(row).toHaveCount(0);
      await expect(page).toHaveURL(/type=service_access_token/);
      deleted = true;
    } finally {
      try {
        await cleanup();
      } finally {
        await page.close();
      }
    }
  });

  test('keeps ordinary service accounts visible in the type-filtered list', async ({
    page,
  }) => {
    await page.goto(`${SERVICE_ACCOUNTS_URL}?type=service_account`);
    const table = page.getByRole('table', {
      name: 'List of created service accounts',
    });
    const rows = table.getByRole('rowgroup').last().getByRole('row');
    await expect(
      rows.first(),
      'stage needs an ordinary service account fixture'
    ).toBeVisible();
    await expect(rows.first()).not.toContainText('Token');
    await expect(rows.first().getByRole('cell').nth(2)).not.toBeEmpty();
    await expect(page).toHaveURL(/type=service_account/);
  });
});
