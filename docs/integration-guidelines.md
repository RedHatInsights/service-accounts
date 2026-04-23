# Integration Guidelines

## Module Federation

Service Accounts is a federated module loaded by [insights-chrome](https://github.com/RedHatInsights/insights-chrome) at runtime.

### Configuration

**`fec.config.js`** — frontend components config:
- `appUrl`: `/iam/service-accounts` (from `package.json insights.appUrl`)
- `moduleFederation.exclude`: `['react-router-dom']` — excluded from federation, shared as singleton
- `moduleFederation.shared`: `react-router-dom` as singleton (MF compatibility range `^6.3.0`; installed version `^6.30.3` — see `package.json`)
- `routes`: optional local chrome-service proxy via `REMOTE_CONFIG` env var

**`deploy/frontend.yml`** — Frontend CRD deployed to OpenShift:
- Exposes module `./RootApp` at `/apps/service-accounts/fed-mods.json`
- Defines navigation segments for the IAM bundle
- Configures SSO scopes (`api.console`, `api.iam.service_accounts`)
- Feature flag `platform.rbac.workspaces` gates navigation placement

### Bootstrap Chain

```text
entry.ts → bootstrap.tsx → AppEntry.tsx → App.tsx → Routes.tsx → Page components
```

The `entry.ts` → `bootstrap.tsx` split is required for webpack module federation (async boundary for shared modules).

## Chrome API Integration

The app depends on [insights-chrome](https://github.com/RedHatInsights/insights-chrome) for:

| API | Usage |
|-----|-------|
| `useChrome().auth.getToken()` | Bearer token for SSO API calls |
| `useChrome().auth.getUser()` | Current user info (org admin check) |
| `useChrome().getEnvironmentDetails()` | SSO URL for API calls |
| `useChrome().getUserPermissions()` | RBAC permission check (`rbac:*:*`) |
| `useChrome().updateDocumentTitle()` | Set page title to "Service Accounts" |
| `useChrome().appAction()` | Track page action for analytics |

**Important**: `useChrome()` only works inside the Chrome shell. For Storybook, mocks are provided via webpack aliases in `.storybook/main.ts`.

## React Query (TanStack)

Server state management uses `@tanstack/react-query` v4:

### QueryClient Configuration

```typescript
// AppEntry.tsx — production config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000 * 3,
    },
  },
});
```

### Query Keys

| Key | Description |
|-----|-------------|
| `['service-accounts', page, perPage, orderBy, sortOrder, filters]` | List with pagination/sort/filter params |
| `['service-account', id]` | Single service account (pre-populated from list) |

The list query pre-populates individual caches:

```typescript
response.serviceAccounts.forEach((sa) =>
  queryClient.setQueryData(['service-account', sa.id], sa)
);
```

### Refetch

The list query auto-refetches every 30 seconds (`refetchInterval: 1000 * 30`).

## MSW (Mock Service Worker) in Storybook

### Setup

MSW is initialized in `.storybook/preview.tsx`:
```typescript
import { initialize, mswLoader } from 'msw-storybook-addon';
initialize({ onUnhandledRequest: 'bypass' });
```

### Handler Pattern

Stories use stateful handler factories that maintain in-memory data:

```typescript
const createStatefulHandlers = (initialServiceAccounts: ServiceAccount[]) => {
  let serviceAccounts = [...initialServiceAccounts];
  return [
    http.get('*/apis/service_accounts/v1', ({ request }) => { /* ... */ }),
    http.post('*/apis/service_accounts/v1', async ({ request }) => { /* ... */ }),
    // ... CRUD handlers that mutate serviceAccounts array
  ];
};
```

This enables full CRUD journey testing within a single Storybook story.

### Story Configuration

```typescript
export const MyStory: Story = {
  parameters: {
    msw: {
      handlers: createStatefulHandlers(mockData),
    },
  },
};
```

## URL State Management

Pagination, sorting, and filtering state is stored in URL search params (not React state):

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Current page |
| `perPage` | number | 50 | Items per page |
| `orderBy` | SortByField | `'name'` | Sort column |
| `sortOrder` | SortOrder | `'asc'` | Sort direction |
| `name` | string | — | Name filter |
| `clientId` | string | — | Client ID filter |
| `creator` | string | — | Owner filter |

URL updates use functional `setSearchParams` updaters from `urlParams.ts` to preserve existing params while modifying specific ones.

## Notifications

Uses `@redhat-cloud-services/frontend-components-notifications`:
- `NotificationsProvider` wraps the app in `App.tsx`
- `useNotifications()` hook provides `addSuccessNotification` and `addDangerNotification`

Notifications appear in Chrome's notification drawer.

## CI/CD Pipeline

### GitHub Actions

- `chromatic.yml` — visual regression testing via Chromatic

### Tekton/Konflux

Pipeline definitions in `.tekton/`:
- `service-accounts-pull-request.yaml` — PR checks
- `service-accounts-push.yaml` — build on push
- `service-accounts-sc-pull-request.yaml` — security compliance PR checks
- `service-accounts-sc-push.yaml` — security compliance on push

### Local Development

```bash
npm run start                      # Dev server with HMR
REMOTE_CONFIG=8080 npm run start   # With local chrome-service proxy
npm run patch:hosts                # Add *.foo.redhat.com to /etc/hosts
```

The dev server runs at `https://stage.foo.redhat.com:1337` with proxy to the stage Chrome API.
