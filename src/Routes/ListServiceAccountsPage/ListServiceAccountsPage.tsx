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
import { useFlag } from '@unleash/proxy-client-react';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Outlet, useSearchParams } from 'react-router-dom';
import {
  SortByField,
  SortOrder,
  fetchServiceAccounts,
} from '../../shared/fetchServiceAccounts';
import { createServiceAccessToken } from '../../shared/createServiceAccessToken';
import { isValidServiceAccountType } from '../../shared/serviceAccountTypes';
import { CreateServiceAccessTokenFlow } from '../CreateServiceAccessTokenPage/CreateServiceAccessTokenFlow';
import { EmptyStateNoServiceAccounts } from './EmptyStateNoServiceAccounts';
import { ServiceAccountsTable } from './ServiceAccountsTable';

const messages = defineMessages({
  title: {
    id: 'serviceAccounts.list.title',
    defaultMessage: 'Service Accounts',
  },
  description: {
    id: 'serviceAccounts.list.description',
    defaultMessage:
      'Use service accounts to securely and automatically connect and authenticate services or applications without requiring an end user’s credentials or direct interaction.',
  },
  learnMore: {
    id: 'serviceAccounts.list.learnMore',
    defaultMessage: 'Watch a video to learn more',
  },
});

const ListServiceAccountsPage = () => {
  const { appAction } = useChrome();
  const intl = useIntl();
  const isSatEnabled = useFlag('platform.service-accounts.sat');
  const [isCreateTokenOpen, setIsCreateTokenOpen] = useState(false);

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
  const filterTypeRaw = searchParams.get('type') || '';

  const isTypeFilteringEnabled = useFlag('platform.service-accounts.sat');

  // Only include the type param when the flag is on AND the value is valid.
  const filterType =
    isTypeFilteringEnabled && isValidServiceAccountType(filterTypeRaw)
      ? filterTypeRaw
      : '';

  const filters = useMemo(
    () => ({
      ...(filterName && { name: filterName }),
      ...(filterClientId && { clientId: filterClientId }),
      ...(filterCreator && { creator: filterCreator }),
      ...(filterType && { type: filterType }),
    }),
    [filterName, filterClientId, filterCreator, filterType]
  );

  const hasActiveFilters = !!(
    filterName ||
    filterClientId ||
    filterCreator ||
    filterType
  );

  const queryClient = useQueryClient();
  const createToken = async (name: string, description: string) => {
    const token = await auth.getToken();
    return createServiceAccessToken({
      name,
      description,
      token: token as string,
      sso: getEnvironmentDetails()?.sso as string,
    });
  };
  const refreshServiceAccounts = () =>
    queryClient.invalidateQueries({ queryKey: ['service-accounts'] });
  const results = useQuery({
    queryKey: [
      'service-accounts',
      page,
      perPage,
      orderBy,
      sortOrder,
      filters,
      isSatEnabled,
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
        excludeServiceAccessTokens: !isSatEnabled,
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
          title={intl.formatMessage(messages.title)}
        />
        <Content>
          <Content component="p" className="pf-v6-u-pt-sm">
            <FormattedMessage {...messages.description} />
          </Content>
          <Content
            component="a"
            href="https://youtu.be/UvNcmJsbg1w"
            target="_blank"
          >
            <FormattedMessage {...messages.learnMore} />
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
              onCreateToken={
                isSatEnabled ? () => setIsCreateTokenOpen(true) : undefined
              }
            />
          ) : (
            <EmptyStateNoServiceAccounts
              onCreateToken={
                isSatEnabled ? () => setIsCreateTokenOpen(true) : undefined
              }
            />
          )}
        </>
        <Outlet />
        {isSatEnabled && isCreateTokenOpen && (
          <CreateServiceAccessTokenFlow
            createToken={createToken}
            onClose={() => setIsCreateTokenOpen(false)}
            onCreated={refreshServiceAccounts}
          />
        )}
      </Main>
    </>
  );
};

export default ListServiceAccountsPage;
