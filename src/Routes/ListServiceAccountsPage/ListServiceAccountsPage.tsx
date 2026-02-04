import { Main } from '@redhat-cloud-services/frontend-components/Main';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Content, Icon } from '@patternfly/react-core';
import ErrorState from '@patternfly/react-component-groups/dist/dynamic/ErrorState';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import {
  SortByField,
  SortOrder,
  fetchServiceAccounts,
} from '../../shared/fetchServiceAccounts';
import { EmptyStateNoServiceAccounts } from './EmptyStateNoServiceAccounts';
import { ServiceAccountsTable } from './ServiceAccountsTable';

const ListServiceAccountsPage = () => {
  const { appAction } = useChrome();

  useEffect(() => {
    appAction('service-accounts-list');
  }, []);

  const { auth, getEnvironmentDetails } = useChrome();
  const [searchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 50;

  const orderBy = (searchParams.get('orderBy') as SortByField) || 'name';
  const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'asc';

  const filterName = searchParams.get('name') || '';
  const filterClientId = searchParams.get('clientId') || '';
  const filterCreator = searchParams.get('creator') || '';

  const filters = useMemo(
    () => ({
      ...(filterName && { name: filterName }),
      ...(filterClientId && { clientId: filterClientId }),
      ...(filterCreator && { creator: filterCreator }),
    }),
    [filterName, filterClientId, filterCreator]
  );

  const hasActiveFilters = !!(filterName || filterClientId || filterCreator);

  const queryClient = useQueryClient();
  const results = useQuery({
    queryKey: [
      'service-accounts',
      {
        page,
        perPage,
        orderBy,
        sortOrder,
        filterName,
        filterClientId,
        filterCreator,
        filters,
      },
    ],
    queryFn: async () => {
      const env = getEnvironmentDetails();
      const token = await auth.getToken();
      const response = await fetchServiceAccounts({
        token: token as string,
        sso: env?.sso as string,
        page,
        perPage,
        orderBy,
        sortOrder,
        filters,
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
        <PageHeaderTitle
          ouiaId="service-accounts-page-title"
          title="Service Accounts"
        />
        <Content>
          <Content component="p" className="pf-v6-u-pt-sm">
            Use service accounts to securely and automatically connect and
            authenticate services or applications without requiring an end
            user&#39;s credentials or direct interaction.
          </Content>
          <Content
            component="a"
            href="https://youtu.be/UvNcmJsbg1w"
            target="_blank"
          >
            Watch a video to learn more
            <Icon className="pf-v6-u-ml-sm" size="md" isInline>
              <ExternalLinkAltIcon />
            </Icon>
          </Content>
        </Content>
      </PageHeader>
      <Main>
        <>
          {results.isError ? (
            <ErrorState />
          ) : results.isLoading ||
            hasActiveFilters ||
            (results.data?.serviceAccounts?.length ?? 0) > 0 ? (
            <ServiceAccountsTable
              serviceAccounts={results.data?.serviceAccounts || []}
              hasMore={results.data?.hasMore ?? false}
              isLoading={results.isLoading}
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
