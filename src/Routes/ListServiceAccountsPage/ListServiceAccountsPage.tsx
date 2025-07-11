import { Main } from '@redhat-cloud-services/frontend-components/Main';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Content, Icon } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';
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
