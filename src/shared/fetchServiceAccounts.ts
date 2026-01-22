import { ServiceAccount } from '../types';

export const NO_DATA = 'no-data';
export const LAST_PAGE = 'last-page';
export const RESULTS = 'results';

export type SortByField = 'name' | 'description' | 'createdAt' | 'clientId';
export type SortOrder = 'asc' | 'desc';

export type ServiceAccountFilters = {
  name?: string;
  clientId?: string;
  creator?: string;
};

type Options = {
  page?: number;
  perPage?: number;
  token: string;
  sso: string;
  orderBy?: SortByField;
  sortOrder?: SortOrder;
  filters?: ServiceAccountFilters;
};

export function buildQueryParams(options: {
  first: number;
  max: number;
  orderBy?: SortByField;
  sortOrder?: SortOrder;
  filters?: ServiceAccountFilters;
}): string {
  const params = new URLSearchParams();

  params.set('first', String(options.first));
  params.set('max', String(options.max));

  if (options.orderBy) {
    params.set('orderBy', options.orderBy);
  }
  if (options.sortOrder) {
    params.set('sortOrder', options.sortOrder);
  }

  if (options.filters?.name) {
    params.set('name', options.filters.name);
  }
  if (options.filters?.clientId) {
    params.set('clientId', options.filters.clientId);
  }
  if (options.filters?.creator) {
    params.set('creator', options.filters.creator);
  }

  return params.toString();
}

export async function fetchServiceAccounts({
  page = 1,
  perPage = 100,
  token,
  sso,
  orderBy,
  sortOrder,
  filters,
}: Options): Promise<{
  serviceAccounts: ServiceAccount[];
  state: string;
}> {
  const first = (page - 1) * perPage;
  const baseUrl = `${sso}realms/redhat-external/apis/service_accounts/v1`;

  const mainQueryParams = buildQueryParams({
    first,
    max: perPage - 1,
    orderBy,
    sortOrder,
    filters,
  });

  const nextPageQueryParams = buildQueryParams({
    first: page * perPage - 1,
    max: 2,
    orderBy,
    sortOrder,
    filters,
  });

  const response = await fetch(`${baseUrl}?${mainQueryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const hasNextPageResponse = await fetch(`${baseUrl}?${nextPageQueryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  const hasNextPageData = await hasNextPageResponse.json();

  let state;
  if (page === 1 && data.length === 0) {
    state = NO_DATA;
  } else {
    state = hasNextPageData.length === 2 ? RESULTS : LAST_PAGE;
  }

  return {
    serviceAccounts: [
      ...data,
      ...(hasNextPageData?.[0] ? [hasNextPageData?.[0]] : []),
    ],
    state,
  };
}
