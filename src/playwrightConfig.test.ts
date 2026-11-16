jest.mock('@playwright/test', () => ({
  defineConfig: (config: unknown) => config,
  devices: { 'Desktop Chrome': {} },
}));

describe('Playwright base URL', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.PLAYWRIGHT_BASE_URL;
    delete process.env.HCC_ENV_URL;
    delete process.env.E2E_HCC_ENV_URL;
    delete process.env.E2E_BASE_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('prefers the explicit proxy URL over the upstream HCC URL', async () => {
    process.env.PLAYWRIGHT_BASE_URL = 'https://stage.foo.redhat.com:1337/';
    process.env.HCC_ENV_URL = 'https://console.stage.redhat.com';
    expect((await import('../playwright.config')).default.use?.baseURL).toBe(
      'https://stage.foo.redhat.com:1337/'
    );
  });

  it.each([
    ['HCC_ENV_URL', 'https://console.stage.redhat.com'],
    ['E2E_HCC_ENV_URL', 'https://example.test'],
    ['E2E_BASE_URL', 'https://example.test:1337'],
  ])('retains %s as a fallback', async (name, url) => {
    process.env[name] = url;
    expect((await import('../playwright.config')).default.use?.baseURL).toBe(
      url
    );
  });

  it('defaults to localhost', async () => {
    expect((await import('../playwright.config')).default.use?.baseURL).toBe(
      'http://localhost:1337'
    );
  });
});
