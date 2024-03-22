import { ServiceAccount } from '../types';

export const NO_DATA = 'no-data';
export const LAST_PAGE = 'last-page';
export const RESULTS = 'results';

type Options = {
  page?: number;
  perPage?: number;
  token: string;
  sso: string;
};

export async function fetchServiceAccounts({
  page = 1,
  perPage = 100,
  token,
  sso,
}: Options): Promise<{
  serviceAccounts: ServiceAccount[];
  state: string;
}> {
  const first = (page - 1) * perPage;
  const max = Math.min(perPage + 1, 100);
  const response = await fetch(
    `${sso}realms/redhat-external/apis/service_accounts/v1?first=${first}&max=${max}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();

  let state;
  if (page === 1 && data.length === 0) {
    state = NO_DATA;
  } else {
    state = data.length < perPage + 1 ? LAST_PAGE : RESULTS;
  }

  return {
    serviceAccounts: data.slice(0, perPage),
    state,
  };
}
