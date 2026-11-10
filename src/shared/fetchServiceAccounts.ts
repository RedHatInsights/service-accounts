import { ServiceAccount } from '../types';

export type SortByField = 'name' | 'description' | 'createdAt' | 'clientId';
export type SortOrder = 'asc' | 'desc';

export type ServiceAccountFilters = {
  name?: string;
  clientId?: string;
  creator?: string;
  type?: string;
};

type Options = {
  page?: number;
  perPage?: number;
  token: string;
  sso: string;
  orderBy?: SortByField;
  sortOrder?: SortOrder;
  filters?: ServiceAccountFilters;
  excludeServiceAccessTokens?: boolean;
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
  if (options.filters?.type) {
    params.set('type', options.filters.type);
  }

  return params.toString();
}

/**
 * Fetches service accounts using the N+1 pagination pattern.
 * Since the API does not provide a total count, we request perPage + 1 items
 * to determine if more pages exist. If we receive more than perPage items,
 * we know there are additional pages and return only the first perPage items.
 */
export async function fetchServiceAccounts({
  page = 1,
  perPage = 50,
  token,
  sso,
  orderBy,
  sortOrder,
  filters,
  excludeServiceAccessTokens = false,
}: Options): Promise<{
  serviceAccounts: ServiceAccount[];
  hasMore: boolean;
}> {
  const sanitizedPage = Math.max(1, Math.floor(page));
  const sanitizedPerPage = Math.max(1, Math.floor(perPage));

  const baseUrl = `${sso}realms/redhat-external/apis/service_accounts/v1`;
  const fetchPage = async (first: number, max: number) => {
    const queryParams = buildQueryParams({
      first,
      max,
      orderBy,
      sortOrder,
      filters,
    });
    const response = await fetch(`${baseUrl}?${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service accounts (${response.status})`);
    }

    const data: ServiceAccount[] = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Unexpected service accounts response shape');
    }
    return data;
  };

  if (excludeServiceAccessTokens) {
    // The list API has no type filter, so scan its pages before paginating visible rows.
    const firstVisible = (sanitizedPage - 1) * sanitizedPerPage;
    const visible: ServiceAccount[] = [];
    let first = 0;
    const max = 100;

    while (visible.length <= firstVisible + sanitizedPerPage) {
      const data = await fetchPage(first, max);
      visible.push(...data.filter((sa) => sa.type !== 'service_access_token'));
      first += data.length;
      if (data.length < max) break;
    }

    return {
      serviceAccounts: visible.slice(
        firstVisible,
        firstVisible + sanitizedPerPage
      ),
      hasMore: visible.length > firstVisible + sanitizedPerPage,
    };
  }

  const first = (sanitizedPage - 1) * sanitizedPerPage;
  const data = await fetchPage(first, sanitizedPerPage + 1);

  const hasMore = data.length > sanitizedPerPage;

  return {
    serviceAccounts: hasMore ? data.slice(0, sanitizedPerPage) : data,
    hasMore,
  };
}
