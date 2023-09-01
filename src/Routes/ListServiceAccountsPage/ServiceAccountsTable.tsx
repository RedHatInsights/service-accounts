import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Pagination,
  Skeleton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import {
  ActionsColumn,
  Table /* data-codemods */,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import React, { VoidFunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLink } from '../../shared/AppLink';
import { mergeToBasename } from '../../shared/utils';

import { ServiceAccount } from '../../types';

const timeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

function getRelativeTime(timestamp: number) {
  const diff = timestamp - new Date().getTime();
  const toSec = Math.floor(diff / 1000);
  const toMin = Math.floor(toSec / 60);
  const toHour = Math.floor(toMin / 60);
  const toDays = Math.floor(toHour / 24);
  const toWeeks = Math.floor(toDays / 7);
  const toMonths = Math.floor(toWeeks / 4);
  const toYears = Math.floor(toMonths / 12);
  const [value, unit] = (() => {
    switch (true) {
      case Math.abs(toYears) > 1:
        return [toYears, 'years' as const];
      case Math.abs(toMonths) > 1:
        return [toMonths, 'months' as const];
      case Math.abs(toWeeks) > 1:
        return [toWeeks, 'weeks' as const];
      case Math.abs(toDays) > 1:
        return [toDays, 'days' as const];
      case Math.abs(toHour) > 1:
        return [toHour, 'hours' as const];
      case Math.abs(toMin) > 1:
        return [toMin, 'minutes' as const];
      default:
        return [toSec, 'seconds' as const];
    }
  })();
  return timeFormat.format(value, unit);
}

export const ServiceAccountsTable: VoidFunctionComponent<{
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
            />
          </ToolbarItem>
          {page === 1 && serviceAccounts.length < perPage ? null : (
            <ToolbarItem variant="pagination" align={{ default: 'alignRight' }}>
              <Pagination
                toggleTemplate={({ firstIndex, lastIndex }) => (
                  <>
                    <b>
                      {firstIndex} - {lastIndex}
                    </b>{' '}
                    of <b>many</b>
                  </>
                )}
                widgetId="indeterminate-example"
                perPage={perPage}
                page={page}
                itemCount={hasMore ? undefined : page * perPage}
                onSetPage={(_, page) => {
                  onPaginationChange(page, perPage);
                }}
                onPerPageSelect={(_, perPage) => {
                  onPaginationChange(1, perPage);
                }}
              />
            </ToolbarItem>
          )}
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
                  about {getRelativeTime(sa.createdAt * 1000)}
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
