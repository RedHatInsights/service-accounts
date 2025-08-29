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
  const response = await fetch(
    `${sso}realms/redhat-external/apis/service_accounts/v1?first=${first}&max=${
      perPage - 1
    }`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const hasNextPageResponse = await fetch(
    `${sso}realms/redhat-external/apis/service_accounts/v1?first=${
      page * perPage - 1
    }&max=${2}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  const hasNextPageData = await hasNextPageResponse.json();

  let state;
  if (page === 1 && data.length === 0) {
    state = NO_DATA;
  } else {
    state = hasNextPageData.length === 2 ? RESULTS : LAST_PAGE;
  }

  console.log(state, data, 'this is state and data!');

  return {
    serviceAccounts: [
      ...data,
      ...(hasNextPageData?.[0] ? [hasNextPageData?.[0]] : []),
    ],
    state,
  };
}
