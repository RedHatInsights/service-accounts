import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Pagination,
  PaginationVariant,
  Skeleton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { ChromeUser } from '@redhat-cloud-services/types';
import {
  ActionsColumn,
  Table /* data-codemods */,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLink } from '../../shared/AppLink';
import { mergeToBasename } from '../../shared/utils';

import { ServiceAccount } from '../../types';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

export const ServiceAccountsTable: FunctionComponent<{
  serviceAccounts: ServiceAccount[];
  page: number;
  perPage: number;
  hasMore: boolean;
  onPaginationChange: (page: number, perPage: number) => void;
  isLoading: boolean;
}> = ({
  serviceAccounts,
  page,
  perPage,
  hasMore,
  onPaginationChange,
  isLoading,
}) => {
  const [isOrgAdmin, setIsOrgAdmin] = useState<boolean | undefined>();
  const [isRbacAdmin, setIsRbacAdmin] = useState<boolean | undefined>();
  const [currUser, setCurrUser] = useState<ChromeUser | undefined>();
  const navigate = useNavigate();
  const { auth, getUserPermissions } = useChrome();

  useEffect(() => {
    const getUser = () => auth.getUser();
    getUserPermissions().then((data) => {
      setIsRbacAdmin(data.some(({ permission }) => permission === 'rbac:*:*'));
    });
    getUser().then((data) => {
      setIsOrgAdmin(data?.identity?.user?.is_org_admin);
      setCurrUser(data as ChromeUser);
    });
  }, []);

  const canChange = useCallback(
    (serviceAccount: ServiceAccount) =>
      isOrgAdmin ||
      isRbacAdmin ||
      serviceAccount.createdBy === currUser?.identity.user?.username,
    [isOrgAdmin, currUser?.identity.user?.username, isRbacAdmin]
  );

  const itemCount = useMemo(
    () =>
      hasMore
        ? undefined
        : Math.max(page - 1, 0) * perPage + serviceAccounts.length,
    [hasMore, page, perPage]
  );

  const toggleTemplate = ({ firstIndex }: { firstIndex?: number }) => {
    const count = Math.max(page - 1, 0) * perPage + serviceAccounts.length;
    return (
      <>
        <b>
          {firstIndex} - {count}
        </b>{' '}
        of <b>{hasMore ? 'many' : count}</b>
      </>
    );
  };

  return (
    <>
      <Toolbar id="toolbar-items">
        <ToolbarContent>
          <ToolbarItem>
            <Button
              ouiaId="service-accounts-table-create-button"
              component={(props) => (
                <AppLink {...props} to="create">
                  Create service account
                </AppLink>
              )}
            />
          </ToolbarItem>
          <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
            <Pagination
              ouiaId="service-accounts-table-top-pagination"
              widgetId="top-sa-pagination"
              itemCount={itemCount}
              perPage={perPage}
              page={page}
              onSetPage={(e, newPage) => onPaginationChange(newPage, perPage)}
              onPerPageSelect={(e, newPerPage) =>
                onPaginationChange(1, newPerPage)
              }
              toggleTemplate={toggleTemplate}
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table
        aria-label="List of created service accounts"
        ouiaId="service-accounts-table"
      >
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Client ID</Th>
            <Th>Owner</Th>
            <Th>Time created</Th>
            <Td />
          </Tr>
        </Thead>
        <Tbody>
          {isLoading &&
            new Array(perPage).fill(0).map((_, idx) => (
              <Tr key={idx}>
                <Td dataLabel="Name">
                  <Skeleton screenreaderText={'Loading service accounts'} />
                </Td>
                <Td dataLabel="Description">
                  <Skeleton />
                </Td>
                <Td dataLabel="Client ID">
                  <Skeleton />
                </Td>
                <Td dataLabel="Owner">
                  <Skeleton />
                </Td>
                <Td dataLabel="Time created">
                  <Skeleton />
                </Td>
                <Td isActionCell={true}>
                  <ActionsColumn isDisabled={true} items={[]} />
                </Td>
              </Tr>
            ))}
          {!isLoading &&
            serviceAccounts.length > 0 &&
            serviceAccounts.map((sa) => (
              <Tr key={sa.id}>
                <Td dataLabel="Name">{sa.name}</Td>
                <Td dataLabel="Description">{sa.description}</Td>
                <Td dataLabel="Client ID">{sa.clientId}</Td>
                <Td dataLabel="Owner">{sa.createdBy}</Td>
                <Td dataLabel="Time created">
                  <DateFormat date={sa.createdAt * 1000} />
                </Td>
                <Td isActionCell={true}>
                  <ActionsColumn
                    items={[
                      {
                        title: 'Reset credentials',
                        isDisabled: !canChange(sa),
                        ouiaId: 'reset-credentials-service-account-button',
                        onClick: () =>
                          navigate(mergeToBasename(`reset/${sa.id}`)),
                      },
                      {
                        title: 'Delete service account',
                        isDisabled: !canChange(sa),
                        ouiaId: 'delete-service-account-button',
                        onClick: () =>
                          navigate(mergeToBasename(`delete/${sa.id}`)),
                      },
                    ]}
                  />
                </Td>
              </Tr>
            ))}
          {!isLoading && serviceAccounts.length === 0 && (
            <Td colSpan={5}>
              <EmptyState
                headingLevel="h4"
                icon={SearchIcon}
                titleText="No results found"
              >
                <EmptyStateBody>
                  No results match the filter criteria. Clear all filters and
                  try again.
                </EmptyStateBody>
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button
                      ouiaId="service-accounts-table-emptystate-clear-filters-button"
                      variant="link"
                      onClick={() => onPaginationChange(1, perPage)}
                    >
                      Clear all filters
                    </Button>
                  </EmptyStateActions>
                </EmptyStateFooter>
              </EmptyState>
            </Td>
          )}
        </Tbody>
      </Table>
      <Pagination
        ouiaId="service-accounts-table-bottom-pagination"
        widgetId="bottom-sa-pagination"
        itemCount={itemCount}
        perPage={perPage}
        page={page}
        variant={PaginationVariant.bottom}
        onSetPage={(e, newPage) => onPaginationChange(newPage, perPage)}
        onPerPageSelect={(e, newPerPage) => onPaginationChange(1, newPerPage)}
        toggleTemplate={toggleTemplate}
        isCompact
      />
    </>
  );
};
