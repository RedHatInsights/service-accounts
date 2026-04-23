# Error Handling Guidelines

## Error States in the UI

### List page errors

The `ListServiceAccountsPage` uses React Query's `isError` state to show a PF6 `ErrorState` component:

```tsx
{results.isError ? (
  <ErrorState />
) : results.isLoading || hasActiveFilters || (results.data?.serviceAccounts?.length ?? 0) > 0 ? (
  <ServiceAccountsTable ... />
) : (
  <EmptyStateNoServiceAccounts />
)}
```

`ErrorState` is imported from `@patternfly/react-component-groups/dist/dynamic/ErrorState` — it renders a generic error empty state.

### API function errors

All API functions in `src/shared/` throw errors for non-OK responses:

```typescript
if (!response.ok) {
  throw new Error(`Failed to fetch service accounts (${response.status})`);
}
```

The `fetchServiceAccounts` function also validates response shape:

```typescript
if (!Array.isArray(data)) {
  throw new Error('Unexpected service accounts response shape');
}
```

React Query catches these errors and surfaces them via `isError` / `error` state.

### Credentials modal error state

The `ServiceAccountNameSecretModal` handles API error responses from create/reset operations:

```tsx
{serviceAccount.error ? (
  <ErrorState
    titleText="Credentials were not generated successfully"
    bodyText={serviceAccount.error_description}
    customFooter={<Button component={AppLink} to="">Close</Button>}
  />
) : (
  // Success: show credentials
)}
```

The `NewServiceAccount` type includes optional `error` and `error_description` fields from the SSO API.

## Empty States

### No service accounts

When the user has no service accounts and no active filters, `EmptyStateNoServiceAccounts` is rendered instead of the table. This provides guidance on how to create a first service account.

### No search results

When filters are active but return no results, the `ServiceAccountsTable` shows:

```tsx
<EmptyState icon={SearchIcon} titleText="No results found">
  <EmptyStateBody>
    No results match the filter criteria. Clear all filters and try again.
  </EmptyStateBody>
  <Button variant="link" onClick={clearAllFilters}>
    Clear all filters
  </Button>
</EmptyState>
```

## Loading States

### Page loading

The `Routes.tsx` uses `React.Suspense` with a PF6 `Spinner` in a `Bullseye` for lazy-loaded page components.

### Table loading

The `ServiceAccountsTable` uses PF6 DataView's built-in loading state:

```tsx
const activeState = isLoading ? DataViewState.loading : 
  serviceAccounts.length === 0 ? DataViewState.empty : undefined;
```

Loading renders `SkeletonTableHead` and `SkeletonTableBody` from `@patternfly/react-component-groups`.

### Modal loading

Delete and Reset modals show a `Spinner` while fetching the service account details, and a loading state on the confirm button during the operation:

```tsx
<Button isLoading={isDeleting} isDisabled={isDeleting || !name}>Delete</Button>
```

## Form Validation

The `CreateModal` uses real-time validation with visual feedback:

- `default` — no validation shown (initial state)
- `error` — red border + helper text (e.g., "Must start with a letter...")
- `success` — green border

Validation triggers:
- On each keystroke (via `useEffect` watching `name` and `description`)
- On blur (shows errors for empty fields after user leaves the input)

The submit button is disabled until both fields are valid (`nameValidated === 'success' && descriptionValidated === 'success'`).

## Error Handling Patterns for New Code

1. **API calls**: throw `Error` with descriptive message including HTTP status. Let React Query handle the error state.
2. **Components**: use PF6 `ErrorState` from `@patternfly/react-component-groups` for full-page errors.
3. **Modals**: show inline error messages using the API's `error_description` field when available.
4. **Loading**: always show a spinner or skeleton while async operations are in progress.
5. **Empty states**: distinguish between "no data exists" and "no results match filters" with appropriate messaging and actions.
