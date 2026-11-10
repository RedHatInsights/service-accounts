/**
 * Centralized service account type mapping.
 *
 * The parameter name and enum values below are provisional — pending
 * confirmation from the Service Accounts API owners.  Keeping them in
 * one place means backend alignment later is a small adapter change.
 */

/** Query-parameter name sent to the API. */
export const TYPE_QUERY_PARAM = 'type';

/** Provisional enum values and their human-readable labels. */
export const SERVICE_ACCOUNT_TYPES = {
  service_account: 'Service account',
  service_access_token: 'Service Access Token',
} as const;

export type ServiceAccountTypeValue = keyof typeof SERVICE_ACCOUNT_TYPES;

/** Options array for DataViewCheckboxFilter / Select components. */
export const SERVICE_ACCOUNT_TYPE_OPTIONS: {
  label: string;
  value: string;
}[] = Object.entries(SERVICE_ACCOUNT_TYPES).map(([value, label]) => ({
  label,
  value,
}));

/** Type-guard for URL / external input validation. */
export function isValidServiceAccountType(
  value: string
): value is ServiceAccountTypeValue {
  return value in SERVICE_ACCOUNT_TYPES;
}
