// import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import {
  LAST_PAGE,
  NO_DATA,
  fetchServiceAccounts,
} from '../../shared/fetchServiceAccounts';
import { EmptyStateNoServiceAccounts } from './EmptyStateNoServiceAccounts';
import { ServiceAccountsTable } from './ServiceAccountsTable';
import { Alert } from '@patternfly/react-core';

const ListServiceAccountsPage = () => {
  const { appAction } = useChrome();

  useEffect(() => {
    appAction('service-accounts-list');
  }, []);

  const { auth, getEnvironmentDetails } = useChrome();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 50;

  const queryClient = useQueryClient();
  const results = useQuery({
    queryKey: ['service-accounts', { page, perPage }],
    queryFn: async () => {
      const env = getEnvironmentDetails();
      const token = await auth.getToken();
      const response = await fetchServiceAccounts({
        token: token as string,
        sso: env?.sso as string,
        page,
        perPage,
      });
      response.serviceAccounts.forEach((sa) =>
        queryClient.setQueryData(['service-account', sa.id], sa)
      );
      return response;
    },
    refetchInterval: 1000 * 30,
  });

  return (
    <>
      <PageHeader>
        <PageHeaderTitle title="Service Accounts" />
        <p>
          Use service accounts to securely and automatically connect and
          authenticate services or applications without requiring an end
          user&#39;s credentials or direct interaction.
        </p>
      </PageHeader>
      <Main>
        <>
          {(results.data || results.isLoading) &&
          results.data?.state !== NO_DATA ? (
            <ServiceAccountsTable
              serviceAccounts={results.data?.serviceAccounts || []}
              page={page}
              perPage={perPage}
              hasMore={results.data?.state !== LAST_PAGE}
              isLoading={results.isLoading}
              onPaginationChange={(page, perPage) => {
                setSearchParams({ page: `${page}`, perPage: `${perPage}` });
              }}
            />
          ) : (
            <EmptyStateNoServiceAccounts />
          )}
        </>
        <Outlet />
      </Main>
    </>
  );
};

export default ListServiceAccountsPage;
