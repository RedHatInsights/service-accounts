# Service Accounts E2E Setup - Summary of Changes

## ✅ Files Modified

### 1. package.json

**Changes:**
- Added `@playwright/test` to devDependencies (version ^1.48.0)
- Added `test:playwright` script to run E2E tests

**Why:** Playwright is required for E2E testing. The test script allows the pipeline to run tests via `npm run test:playwright`.

### 2. .tekton/service-accounts-pull-request.yaml

**Changes:**
- Updated pipeline reference from `docker-build-run-unit-tests.yaml` to `docker-build-run-all-tests.yaml`
- Added E2E-specific parameters:
  - `e2e-app-port: "8000"`
  - `run-app-script` - Starts Caddy server for app assets
  - `frontend-proxy-routes-configmap: "service-accounts-dev-proxy-caddyfile"`
  - `e2e-tests-script` - Waits for proxy, installs Playwright, runs tests
  - `e2e-credentials-secret: "service-accounts-credentials-secret"`

**Why:** The updated pipeline now runs both unit tests AND E2E tests on every pull request.

## ✅ Files Created

### 3. playwright.config.ts

**Purpose:** Playwright configuration file that defines:
- Test directory: `./playwright`
- Browser configuration (Chromium)
- Base URL from environment variables
- Timeout settings
- Reporter configuration
- CI-specific settings

**Environment Variables Used:**
- `HCC_ENV_URL` - HCC environment URL (used in CI/Konflux)
- `E2E_BASE_URL` - Alternative base URL
- `PLAYWRIGHT_BASE_URL` - Base URL for tests (default: http://localhost:1337)
- `E2E_USER` - Test user credentials
- `E2E_PASSWORD` - Test user password

### 4. playwright/hello-world.spec.ts

**Purpose:** Basic skeleton E2E test suite with 1 test:

1. **should render the site correctly** - Basic rendering test for `/iam/service-accounts` route

**Notes:**
- Tests use proper async/await patterns
- Tests demonstrate Playwright best practices
- Includes helpful comments for future test development

### 5. playwright/README.md

**Purpose:** Documentation for developers on:
- How to install and run tests locally
- Test structure and organization
- Writing new tests
- Available environment variables
- Best practices
- Links to resources

### 6. KONFLUX_E2E_SETUP.md

**Purpose:** Complete step-by-step guide for finishing the E2E setup:
- Summary of completed steps
- Instructions for using Plumber to generate ConfigMaps
- Instructions for setting up Vault credentials
- Instructions for creating ExternalSecret
- Troubleshooting guide
- Configuration summary
- Resources and links

### 7. service-accounts-credentials-secret.yaml

**Purpose:** Template ExternalSecret YAML that needs to be submitted to konflux-release-data.

**What it does:**
- Creates a Kubernetes Secret from Vault credentials
- Maps Vault properties to secret keys used by the pipeline
- Refreshes every 15 minutes from Vault

**Where to submit:**
`tenants-config/cluster/stone-prd-rh01/tenants/rh-platform-experien-tenant/`

## 📋 Still Required (Manual Steps)

### 1. Install and Run Plumber

```bash
git clone https://github.com/catastrophe-brandon/plumber.git
cd plumber
uv pip install -e .
# OR
pip install -e .

plumber service-accounts \
  https://github.com/RedHatInsights/service-accounts.git \
  --app-configmap-name service-accounts-app-caddy-config \
  --proxy-configmap-name service-accounts-dev-proxy-caddyfile \
  --namespace rh-platform-experien-tenant \
  --frontend-yaml deploy/frontend.yml \
  --stage-env-url https://stage.foo.redhat.com
```

This generates:
- `service-accounts-app-caddy-config.yaml`
- `service-accounts-dev-proxy-caddyfile.yaml`

### 2. Submit ConfigMaps to konflux-release-data

```bash
git clone git@gitlab.cee.redhat.com:releng/konflux-release-data.git
cd konflux-release-data

cp /path/to/service-accounts-app-caddy-config.yaml \
  tenants-config/cluster/stone-prd-rh01/tenants/rh-platform-experien-tenant/

cp /path/to/service-accounts-dev-proxy-caddyfile.yaml \
  tenants-config/cluster/stone-prd-rh01/tenants/rh-platform-experien-tenant/

git checkout -b add-service-accounts-e2e-configmaps
git add tenants-config/cluster/stone-prd-rh01/tenants/rh-platform-experien-tenant/service-accounts-*.yaml
git commit -m "Add E2E ConfigMaps for service-accounts"
git push origin add-service-accounts-e2e-configmaps
```

### 3. Create Vault Credentials

Follow Platform Engineer Survival Guide to create credentials at:
`creds/konflux/service-accounts`

Required properties:
- `username`
- `password`
- `e2e-hcc-env-url`
- `e2e-stage-actual-hostname`

### 4. Submit ExternalSecret to konflux-release-data

```bash
cd konflux-release-data

cp /path/to/service-accounts-credentials-secret.yaml \
  tenants-config/cluster/stone-prd-rh01/tenants/rh-platform-experien-tenant/

# Edit kustomization.yaml to add:
# - service-accounts-credentials-secret.yaml

git checkout -b add-service-accounts-e2e-credentials
git add tenants-config/cluster/stone-prd-rh01/tenants/rh-platform-experien-tenant/service-accounts-credentials-secret.yaml
git add tenants-config/cluster/stone-prd-rh01/tenants/rh-platform-experien-tenant/kustomization.yaml
git commit -m "Add ExternalSecret for service-accounts E2E credentials"
git push origin add-service-accounts-e2e-credentials
```

### 5. Install Dependencies and Test Locally (Optional)

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium

# Run tests locally
npm run test:playwright
```

### 6. Commit Changes and Open PR

```bash
git add package.json playwright.config.ts playwright/ .tekton/service-accounts-pull-request.yaml E2E_SETUP_SUMMARY.md service-accounts-credentials-secret.yaml
git commit -m "Add Playwright E2E tests and Konflux pipeline configuration"
git push origin <your-branch>
```

Open a PR and monitor the pipeline execution in Konflux UI.

## 🎯 What Happens in the Pipeline

When you open a PR, the Konflux pipeline will:

1. **Build the application container** (same as before)
2. **Run unit tests** (same as before - lint and Jest tests)
3. **Start E2E test environment:**
   - App sidecar container (serves service-accounts assets on port 8000)
   - Proxy sidecar container (routes requests based on ConfigMap)
   - Test container (runs Playwright tests)
4. **Execute Playwright tests** against the test environment
5. **Report results** back to the PR

## 📚 Resources

- **Full Setup Guide**: See `KONFLUX_E2E_SETUP.md`
- **Test Documentation**: See `playwright/README.md`
- **Example Tests**: See `playwright/hello-world.spec.ts`
- **Plumber**: https://github.com/catastrophe-brandon/plumber
- **Learning Resources Example**: https://github.com/RedHatInsights/learning-resources
- **E2E Pipeline Docs**: https://github.com/RedHatInsights/frontend-experience-docs/blob/master/pages/testing/e2e-pipeline.md

## ⚠️ Important Notes

1. **Never manually edit ConfigMaps** - Always use Plumber
2. **Chrome sidecar has been removed** - Proxy routes directly to stage for non-app routes
3. **All 4 secret properties are required** - Pipeline expects all credentials
4. **Plumber is for federated modules only** - Ensure service-accounts is a federated module

## 🆘 Getting Help

- **Konflux Pipeline Issues**: #konflux-users Slack channel
- **Plumber Issues**: https://github.com/catastrophe-brandon/plumber/issues
- **Playwright Test Help**: Playwright documentation at https://playwright.dev
