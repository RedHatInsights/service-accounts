import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Skeleton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import {
  ActionsColumn,
  Table /* data-codemods */,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLink } from '../../shared/AppLink';
import { mergeToBasename } from '../../shared/utils';

import { ServiceAccount } from '../../types';

export const ServiceAccountsTable: FC<{
  serviceAccounts: ServiceAccount[];
  page: number;
  perPage: number;
  hasMore: boolean;
  onPaginationChange: (page: number, perPage: number) => void;
  isLoading: boolean;
}> = ({ serviceAccounts, perPage, onPaginationChange, isLoading }) => {
  const navigate = useNavigate();
  return (
    <>
      <Toolbar id="toolbar-items">
        <ToolbarContent>
          <ToolbarItem>
            <Button
              component={(props) => (
                <AppLink {...props} to="create">
                  Create service account
                </AppLink>
              )}
              isDisabled={serviceAccounts.length === 50}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="List of created service accounts">
        <Thead>
          <Tr>
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
                <Td dataLabel={'Description'}>
                  <Skeleton screenreaderText={'Loading service accounts'} />
                </Td>
                <Td dataLabel={'Client ID'}>
                  <Skeleton />
                </Td>
                <Td dataLabel={'Owner'}>
                  <Skeleton />
                </Td>
                <Td dataLabel={'Time created'}>
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
                <Td dataLabel={'Description'}>{sa.name}</Td>
                <Td dataLabel={'Client ID'}>{sa.clientId}</Td>
                <Td dataLabel={'Owner'}>{sa.createdBy}</Td>
                <Td dataLabel={'Time created'}>
                  <DateFormat date={sa.createdAt * 1000} />
                </Td>
                <Td isActionCell={true}>
                  <ActionsColumn
                    items={[
                      {
                        title: 'Reset credentials',
                        onClick: () =>
                          navigate(mergeToBasename(`reset/${sa.id}`)),
                      },
                      {
                        title: 'Delete service account',
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
              <EmptyState>
                <EmptyStateHeader
                  titleText="No results found"
                  icon={<EmptyStateIcon icon={SearchIcon} />}
                  headingLevel="h4"
                />
                <EmptyStateBody>
                  No results match the filter criteria. Clear all filters and
                  try again.
                </EmptyStateBody>
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button
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
    </>
  );
};
