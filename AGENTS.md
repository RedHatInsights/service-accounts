# Service Accounts — Agent Guide

## Project Overview

Service Accounts is a React frontend for managing service account credentials on the Hybrid Cloud Console (HCC). It lets users create, list, reset, and delete service accounts that authenticate to Red Hat APIs. Served at `/iam/service-accounts` as a federated module loaded by [insights-chrome](https://github.com/RedHatInsights/insights-chrome).

## Project Structure

```text
service-accounts/
├── src/
│   ├── App.tsx                  # Root component (useChrome, NotificationsProvider)
│   ├── AppEntry.tsx             # QueryClientProvider wrapper
│   ├── Routes.tsx               # React Router routes (lazy-loaded pages)
│   ├── bootstrap.tsx            # Module federation bootstrap
│   ├── entry.ts                 # Webpack entry point
│   ├── Routes/
│   │   ├── ListServiceAccountsPage/
│   │   │   ├── ListServiceAccountsPage.tsx    # Main list page (useQuery)
│   │   │   ├── ServiceAccountsTable.tsx       # DataView table with sort/filter/pagination
│   │   │   ├── ServiceAccountsTable.stories.tsx
│   │   │   ├── ListServiceAccountsPage.stories.tsx  # Full user journey stories
│   │   │   ├── constants.ts                   # Sort/filter/pagination constants
│   │   │   ├── urlParams.ts                   # URL search params helpers
│   │   │   ├── urlParams.test.ts
│   │   │   └── EmptyStateNoServiceAccounts.tsx
│   │   ├── CreateServiceAccountPage/
│   │   │   ├── CreateServiceAccountPage.tsx   # Create flow orchestrator
│   │   │   └── CreateModal.tsx                # Create form with validation
│   │   ├── DeleteServiceAccountPage/
│   │   │   ├── DeleteServiceAccountPage.tsx   # Delete flow orchestrator
│   │   │   └── DeleteModal.tsx                # Delete confirmation modal
│   │   └── ResetServiceAccountPage/
│   │       ├── ResetServiceAccountPage.tsx    # Reset flow orchestrator
│   │       └── ResetModal.tsx                 # Reset confirmation modal
│   ├── shared/
│   │   ├── fetchServiceAccounts.ts            # List API (N+1 pagination)
│   │   ├── fetchServiceAccounts.test.ts
│   │   ├── fetchServiceAccount.ts             # Single SA fetch
│   │   ├── fetchServiceAccount.test.ts
│   │   ├── createServiceAccount.ts            # Create API
│   │   ├── createServiceAccount.test.ts
│   │   ├── deleteServiceAccount.ts            # Delete API
│   │   ├── deleteServiceAccount.test.ts
│   │   ├── resetServiceAccount.ts             # Reset credentials API
│   │   ├── resetServiceAccount.test.ts
│   │   ├── ServiceAccountNameSecretModal.tsx   # Shared credentials display modal
│   │   ├── AppLink.tsx                        # Link wrapper with basename
│   │   ├── utils.ts                           # mergeToBasename, appendTo
│   │   └── utils.test.ts
│   └── types/
│       └── index.d.ts                         # ServiceAccount, NewServiceAccount types
├── .storybook/
│   ├── main.ts                  # Storybook config (webpack aliases for mocks)
│   ├── preview.tsx              # Global decorators (MSW, QueryClient, Chrome mock)
│   └── mocks/                   # Mock implementations for Storybook
│       ├── useChrome.ts
│       ├── DateFormat.tsx
│       ├── Main.tsx
│       ├── PageHeader.tsx
│       ├── unleash.tsx
│       └── useNotifications.ts
├── playwright/
│   ├── hello-world.spec.ts      # E2E smoke test (authenticated)
│   ├── test-utils.ts            # Login helper, URLs
│   └── README.md
├── config/
│   └── jest.setup.js            # Jest setup (@testing-library/jest-dom)
├── deploy/
│   └── frontend.yml             # Frontend CRD (routes, modules, permissions)
├── .tekton/                     # Konflux/Tekton pipeline definitions
├── fec.config.js                # Frontend components config (module federation)
├── jest.config.js
├── tsconfig.json
├── .eslintrc.js
├── playwright.config.ts
└── package.json
```

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| TypeScript 5 | Type safety (`strict: true`) |
| PatternFly 6 | Component library (`@patternfly/react-core`, `react-table`, `react-data-view`, `react-component-groups`, `react-icons`) |
| React Router DOM 6 | Client-side routing |
| TanStack React Query v4 | Server state management |
| Unleash | Feature flags (`@unleash/proxy-client-react`) |
| Webpack 5 | Module bundling + federation (via `@redhat-cloud-services/frontend-components-config`) |
| Jest 27 | Unit testing (jsdom, identity-obj-proxy for CSS) |
| Storybook 10 | Component stories + interaction tests |
| MSW 2 | API mocking (Storybook + tests) |
| Playwright | E2E tests (authenticated, against stage) |
| ESLint 8 | Linting (`@redhat-cloud-services` config) |
| Stylelint | SCSS linting |

> **Note**: For exact dependency versions, see `package.json` as the source of truth.

## Module Federation

Single exposed module configured in `fec.config.js`:

| Module | Entry | Route |
|--------|-------|-------|
| `./RootApp` | `src/entry.ts` → `src/bootstrap.tsx` → `src/AppEntry.tsx` | `/iam/service-accounts` |

Shared singletons: `react-router-dom` (excluded from federation, shared as singleton).

## API

All API calls go through Red Hat SSO (`sso.redhat.com`):

| Operation | Endpoint | Method |
|-----------|----------|--------|
| List | `{sso}realms/redhat-external/apis/service_accounts/v1` | GET |
| Get one | `{sso}realms/redhat-external/apis/service_accounts/v1/{id}` | GET |
| Create | `{sso}realms/redhat-external/apis/service_accounts/v1` | POST |
| Delete | `{sso}realms/redhat-external/apis/service_accounts/v1/{id}` | DELETE |
| Reset secret | `{sso}realms/redhat-external/apis/service_accounts/v1/{id}/resetSecret` | POST |

Auth: Bearer token from `useChrome().auth.getToken()`. SSO URL from `useChrome().getEnvironmentDetails().sso`.

**N+1 pagination pattern**: The list endpoint does not return a total count. The client requests `perPage + 1` items — if more than `perPage` are returned, `hasMore = true` and only the first `perPage` items are displayed. See `fetchServiceAccounts.ts`.

## Feature Flags (Unleash)

| Flag | Controls |
|------|----------|
| `platform.service-accounts.sorting` | Column sorting on the table |
| `platform.service-accounts.filtering` | Name/ClientID/Owner filters |

Used via `useFlag()` from `@unleash/proxy-client-react`.

## Permissions

Access controlled by SSO scopes configured in `deploy/frontend.yml`:
- `api.console` — general console access
- `api.iam.service_accounts` — service accounts access

Feature flag `platform.rbac.workspaces` controls navigation placement (under "Access Management" vs standalone).

Row-level actions (reset/delete) require: org admin, RBAC admin (`rbac:*:*`), or being the creator of the service account.

## Conventions

1. **npm scripts only** — use `npm test`, `npm run lint`, `npm run storybook`, never call Jest/ESLint/Storybook CLIs directly.
2. **PatternFly 6** — all UI uses PF6 components. Import patterns:
   - Core: `@patternfly/react-core`
   - Icons: `@patternfly/react-icons/dist/dynamic/icons/{icon-name}`
   - Table: `@patternfly/react-table`
   - DataView: `@patternfly/react-data-view/dist/dynamic/{Component}`
   - Component groups: `@patternfly/react-component-groups/dist/dynamic/{Component}`
3. **TypeScript strict mode** — `strict: true` in tsconfig.json. No `any` types.
4. **Sort imports** — ESLint enforces `sort-imports` (declaration sort ignored, member sort required).
5. **Colocated tests** — unit tests live next to source files (`*.test.ts`).
6. **Colocated stories** — Storybook stories live next to components (`*.stories.tsx`).
7. **CSS mocking** — Jest uses `identity-obj-proxy` for CSS/SCSS modules.
8. **useChrome hook** — access Chrome API (auth, environment, user, permissions) via `useChrome()` from `@redhat-cloud-services/frontend-components/useChrome`.
9. **URL-driven state** — pagination, sorting, and filtering state stored in URL search params (not React state). See `urlParams.ts`.
10. **Modal portal** — modals use `appendTo={() => document.getElementById('chrome-app-render-root')}` to render inside the Chrome shell.
11. **Conventional commits** — `type(scope): description` format for commit messages.

## Common Pitfalls

- **Don't use `@patternfly/react-icons` barrel imports in Jest** — the babel config transforms them to specific paths for build, but in tests the `transformIgnorePatterns` must include `@patternfly`.
- **appendTo for modals** — all PF6 modals MUST use `appendTo={appendTo}` (from `shared/utils.ts`) to render inside `#chrome-app-render-root`. Without this, modals render outside the Chrome shell.
- **N+1 pagination** — the API has no total count. Always use the N+1 pattern when fetching lists. Never assume a total count exists.
- **SSO URL** — never hardcode SSO URLs. Always get from `useChrome().getEnvironmentDetails().sso`.
- **Feature flags** — sorting and filtering features are behind Unleash flags. Always check flag status before adding sort/filter UI.
- **VoidFunctionComponent** — older components use `VoidFunctionComponent` (deprecated in React 18). New components should use `FunctionComponent` or `React.FC`.

## Documentation Index

| Document | Description |
|----------|-------------|
| [Testing Guidelines](docs/testing-guidelines.md) | Jest, Storybook, Playwright setup and patterns |
| [Security Guidelines](docs/security-guidelines.md) | Auth, permissions, SSO integration |
| [Error Handling Guidelines](docs/error-handling-guidelines.md) | Error states, fallbacks, validation |
| [Integration Guidelines](docs/integration-guidelines.md) | Module federation, Chrome API, MSW mocking |
