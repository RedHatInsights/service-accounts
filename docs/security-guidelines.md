# Security Guidelines

## Authentication

All API calls require a Bearer token from Red Hat SSO. The token is obtained via Chrome's auth API:

```typescript
const { auth, getEnvironmentDetails } = useChrome();
const token = await auth.getToken();
const env = getEnvironmentDetails();
// API call: fetch(`${env.sso}realms/redhat-external/apis/service_accounts/v1`, {
//   headers: { Authorization: `Bearer ${token}` }
// });
```

### Rules

- **Never hardcode SSO URLs** — always use `getEnvironmentDetails().sso` which returns the correct URL for the current environment (stage/prod).
- **Never store tokens** — call `auth.getToken()` for each request. Chrome handles token refresh.
- **Never expose tokens in logs or error messages** — the shared API functions in `src/shared/` handle auth headers internally.

## Authorization

### Console-level access

Controlled by SSO scopes in `deploy/frontend.yml`:
- `api.console` — required for HCC access
- `api.iam.service_accounts` — required for the service accounts page

Navigation visibility is additionally gated by:
- Feature flag `platform.rbac.workspaces` — controls whether the nav item appears under "Access Management" or standalone in the IAM bundle.
- Scope check: `api.iam.service_accounts`

### Row-level permissions

Not all users can modify all service accounts. The `ServiceAccountsTable` component checks:

```typescript
const canChange = (serviceAccount: ServiceAccount) =>
  isOrgAdmin ||
  isRbacAdmin ||
  serviceAccount.createdBy === currUser?.identity.user?.username;
```

- **Org admin**: `auth.getUser().identity.user.is_org_admin`
- **RBAC admin**: has `rbac:*:*` permission via `getUserPermissions()`
- **Creator**: `serviceAccount.createdBy` matches current user

Reset and Delete actions are disabled if the user cannot change the service account.

## Sensitive Data Handling

### Client secrets

- Secrets are displayed only once (in the `ServiceAccountNameSecretModal` after create/reset)
- Users must check "I have copied the client ID and secret" before closing
- The modal warns: "The client secret won't appear again after closing this screen"
- Secrets are never persisted in the frontend — they exist only in the modal's component state

### API keys and tokens

- No API keys or tokens are hardcoded in the codebase
- SSO tokens are obtained at runtime via Chrome auth
- The `service-accounts-credentials-secret.yaml` file in the repo root is a Kubernetes secret template (contains placeholders, not actual secrets)

## Feature Flags

Feature flags (`useFlag` from `@unleash/proxy-client-react`) gate UI features:

| Flag | Feature |
|------|---------|
| `platform.service-accounts.sorting` | Column sorting |
| `platform.service-accounts.filtering` | Name/ClientID/Owner filters |

These are evaluated client-side. The Unleash proxy client connects to the Chrome-provided Unleash instance automatically.

## Input Validation

The create form (`CreateModal.tsx`) validates:

- **Name**: required, must match `^[a-z]([-a-z0-9]*[a-z0-9])?$`, max 32 chars
- **Description**: required, max 255 chars

Validation is performed client-side before submission. The SSO API performs its own server-side validation.

## Storybook Security

Storybook mocks replace real auth with static values:
- Mock token: `'mock-token'`
- Mock user: `john.doe` with `is_org_admin: true`
- Mock permissions: `rbac:*:*`
- Mock SSO: `https://sso.example.com/`

These mocks are only used in Storybook (webpack alias resolution). They never appear in production builds.
