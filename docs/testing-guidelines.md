# Testing Guidelines

## Test Stack Overview

| Layer | Tool | Config | Purpose |
|-------|------|--------|---------|
| Unit | Jest 27 + @testing-library/react | `jest.config.js` | Component and utility unit tests |
| Interaction | Storybook 10 test-runner | `.storybook/main.ts` | User journey tests via story `play` functions |
| E2E | Playwright | `playwright.config.ts` | Authenticated smoke tests against stage |

## Jest Unit Tests

### Configuration

- **Environment**: `jest-environment-jsdom`
- **Setup**: `config/jest.setup.js` — imports `@testing-library/jest-dom/extend-expect`
- **CSS mocking**: `identity-obj-proxy` for `.css` and `.scss` files
- **Transform ignore**: `@redhat-cloud-services` and `@patternfly` packages are NOT ignored (they need transpilation)
- **Coverage**: collected from `src/**/*.js` (excludes stories)
- **Module resolution**: `node_modules` and `./src` (allows bare imports from src root)

### Patterns

Tests are colocated with source files:

```text
src/shared/fetchServiceAccounts.ts
src/shared/fetchServiceAccounts.test.ts
```

API function tests mock `global.fetch`:

```typescript
global.fetch = jest.fn().mockResolvedValueOnce({
  ok: true,
  json: () => Promise.resolve([]),
});
```

Always `jest.resetAllMocks()` in `beforeEach`.

### Running

```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report
```

## Storybook Interaction Tests

### Architecture

Stories use MSW (Mock Service Worker) for API mocking. The Storybook config at `.storybook/preview.tsx` provides:

- **MSW initialization** via `msw-storybook-addon` (with `onUnhandledRequest: 'bypass'`)
- **React Query client** with `retry: false` and `refetchOnWindowFocus: false`
- **Chrome mock** injected into `window.insights.chrome` (auth, permissions, environment)
- **Modal portal** — creates `#chrome-app-render-root` div for PF6 modal portals
- **Feature flag provider** — `FeatureFlagsProvider` from `.storybook/mocks/unleash.tsx` with toolbar toggles

### Mocking Strategy

Storybook mocks are configured via webpack aliases in `.storybook/main.ts`:

| Module | Mock Location |
|--------|---------------|
| `useChrome` | `.storybook/mocks/useChrome.ts` |
| `DateFormat` | `.storybook/mocks/DateFormat.tsx` |
| `Main` | `.storybook/mocks/Main.tsx` |
| `PageHeader` | `.storybook/mocks/PageHeader.tsx` |
| `useNotifications` | `.storybook/mocks/useNotifications.ts` |
| `@unleash/proxy-client-react` | `.storybook/mocks/unleash.tsx` |

MSW handlers in stories use stateful handler factories (`createStatefulHandlers`) that maintain in-memory state across requests — enabling full CRUD journey tests within a single story.

### User Journey Stories

`ListServiceAccountsPage.stories.tsx` contains full user journey tests:

- **Default** — verifies data loads
- **CreateServiceAccountJourney** — creates SA, validates form, checks credentials modal
- **DeleteServiceAccountJourney** — deletes SA via kebab menu, confirms removal
- **ResetServiceAccountJourney** — resets credentials, verifies new secret displayed

Each journey uses `play` functions with `@storybook/test` utilities (`expect`, `userEvent`, `waitFor`, `within`).

### Running

```bash
npm run storybook              # Start dev server (port 6006)
npm run test-storybook         # Run interaction tests
npm run test-storybook:ci      # CI mode (excludes test-skip tags)
```

## Playwright E2E Tests

### Configuration

- **Test directory**: `playwright/`
- **Browser**: Chromium only
- **Timeout**: 120s per test (stage environment is slow)
- **Retries**: 2 in CI, 0 locally
- **Workers**: 1 in CI (serial), unlimited locally
- **Base URL**: `HCC_ENV_URL` or `E2E_HCC_ENV_URL` or `E2E_BASE_URL` (falls back to `localhost:1337`)
- **HTTPS errors**: ignored (stage uses self-signed certs)

### Authentication

Tests require `E2E_USER` and `E2E_PASSWORD` environment variables. The `ensureLoggedIn()` helper in `playwright/test-utils.ts` handles the Red Hat SSO login flow. Tests skip if credentials are not set.

### Running

```bash
npm run test:playwright                        # Run locally (starts dev server)
E2E_USER=x E2E_PASSWORD=y npm run test:playwright  # With credentials
```

## Writing New Tests

### Unit tests for API functions

1. Create `*.test.ts` next to the source file
2. Mock `global.fetch` with `jest.fn()`
3. Test success, error, and edge cases
4. Always call `jest.resetAllMocks()` in `beforeEach`

### Storybook stories

1. Create `*.stories.tsx` next to the component
2. Use `Meta` and `StoryObj` types from `@storybook/react-webpack5`
3. Add MSW handlers via `parameters.msw.handlers`
4. For journey tests, add `play` functions with assertions
5. Use `waitFor` with generous timeouts (15s) for async operations
6. Tag with `autodocs` for auto-generated documentation

### E2E tests

1. Add test files to `playwright/`
2. Use `ensureLoggedIn(page)` before navigation
3. Prefer OUIA selectors (`[data-ouia-component-id="..."]`) over text selectors
4. Set appropriate timeouts for stage environment
