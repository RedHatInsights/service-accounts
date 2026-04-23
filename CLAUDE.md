@AGENTS.md

## Build Commands

```bash
npm install          # Install dependencies
npm run build        # Production build (fec build)
npm run start        # Dev server with HMR (HOT=true fec dev)
npm test             # Run Jest unit tests
npm run lint         # Run all linters (ESLint + Stylelint)
npm run lint:js      # ESLint only
npm run lint:js:fix  # ESLint with auto-fix
npm run verify       # Build + lint + test (CI validation)
npm run storybook    # Start Storybook dev server (port 6006)
npm run build-storybook    # Build static Storybook
npm run test-storybook     # Run Storybook interaction tests
npm run test-storybook:ci  # Run Storybook tests in CI mode
npm run test:playwright    # Run Playwright E2E tests
```

## Git Conventions

- Default branch: `main`
- Commit format: `type(scope): description` (conventional commits)
- Bot branches: `bot/<TICKET-KEY>`
- PR target: `main`

## Key Files

- `fec.config.js` — module federation + dev proxy config
- `deploy/frontend.yml` — Frontend CRD (routes, SSO scopes, nav segments)
- `src/types/index.d.ts` — `ServiceAccount` and `NewServiceAccount` types
- `src/shared/fetchServiceAccounts.ts` — N+1 pagination pattern (critical)
- `.storybook/preview.tsx` — global Storybook decorators + Chrome mock
- `.storybook/mocks/` — mock implementations for isolated Storybook rendering
