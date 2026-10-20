import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Pagination,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DataView,
  DataViewState,
} from '@patternfly/react-data-view/dist/dynamic/DataView';
import {
  DataViewTable,
  DataViewTh,
  DataViewTr,
} from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import DataViewFilters from '@patternfly/react-data-view/dist/cjs/DataViewFilters';
import { DataViewTextFilter } from '@patternfly/react-data-view';
import { useDataViewPagination } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import { ActionsColumn, Tbody, Td, ThProps, Tr } from '@patternfly/react-table';
import {
  SkeletonTableBody,
  SkeletonTableHead,
} from '@patternfly/react-component-groups';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { ChromeUser } from '@redhat-cloud-services/types';
import { useFlag } from '@unleash/proxy-client-react';
import { defineMessages, useIntl } from 'react-intl';
import { mergeToBasename } from '../../shared/utils';
import { ServiceAccount } from '../../types';
import { SortByField, SortOrder } from '../../shared/fetchServiceAccounts';
import {
  DEFAULT_SORT_FIELD,
  DEFAULT_SORT_ORDER,
  FILTER_DEBOUNCE_MS,
  FILTER_KEYS,
  FilterKey,
  OUIA_ID,
  PER_PAGE_OPTIONS,
  SORT_FIELD_MAP,
  SORT_FIELD_TO_INDEX,
} from './constants';
import {
  createClearFiltersParamsUpdater,
  createFiltersParamsUpdater,
  createSortParamsUpdater,
} from './urlParams';
import { CreateCredentialButton } from './CreateCredentialButton';

const messages = defineMessages({
  columnName: {
    id: 'serviceAccounts.table.column.name',
    defaultMessage: 'Name',
  },
  columnDescription: {
    id: 'serviceAccounts.table.column.description',
    defaultMessage: 'Description',
  },
  columnClientId: {
    id: 'serviceAccounts.table.column.clientId',
    defaultMessage: 'Client ID',
  },
  columnOwner: {
    id: 'serviceAccounts.table.column.owner',
    defaultMessage: 'Owner',
  },
  columnTimeCreated: {
    id: 'serviceAccounts.table.column.timeCreated',
    defaultMessage: 'Time created',
  },
  columnActionsSr: {
    id: 'serviceAccounts.table.column.actionsSr',
    defaultMessage: 'Actions',
  },
  filterNamePlaceholder: {
    id: 'serviceAccounts.table.filter.namePlaceholder',
    defaultMessage: 'Filter by name',
  },
  filterClientIdPlaceholder: {
    id: 'serviceAccounts.table.filter.clientIdPlaceholder',
    defaultMessage: 'Filter by client ID',
  },
  filterOwnerPlaceholder: {
    id: 'serviceAccounts.table.filter.ownerPlaceholder',
    defaultMessage: 'Filter by owner',
  },
  tableAriaLabel: {
    id: 'serviceAccounts.table.ariaLabel',
    defaultMessage: 'List of created service accounts',
  },
  actionResetCredentials: {
    id: 'serviceAccounts.table.action.resetCredentials',
    defaultMessage: 'Reset credentials',
  },
  actionDelete: {
    id: 'serviceAccounts.table.action.delete',
    defaultMessage: 'Delete service account',
  },
  paginationOf: {
    id: 'serviceAccounts.table.pagination.of',
    defaultMessage: 'of',
  },
  paginationMany: {
    id: 'serviceAccounts.table.pagination.many',
    defaultMessage: 'many',
  },
  emptyTitle: {
    id: 'serviceAccounts.table.empty.title',
    defaultMessage: 'No results found',
  },
  emptyFilteredBody: {
    id: 'serviceAccounts.table.empty.filteredBody',
    defaultMessage:
      'No results match the filter criteria. Clear all filters and try again.',
  },
  emptyBody: {
    id: 'serviceAccounts.table.empty.body',
    defaultMessage: 'No service accounts found.',
  },
  emptyClearFilters: {
    id: 'serviceAccounts.table.empty.clearFilters',
    defaultMessage: 'Clear all filters',
  },
});

export interface ServiceAccountsTableProps {
  serviceAccounts: ServiceAccount[];
  itemCount?: number;
  hasMore?: boolean;
  isLoading: boolean;
  onParamsChange?: () => void;
  onCreateToken?: () => void;
}

export const ServiceAccountsTable: FunctionComponent<
  ServiceAccountsTableProps
> = ({
  serviceAccounts,
  itemCount,
  hasMore = false,
  isLoading,
  onCreateToken,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth, getUserPermissions } = useChrome();
  const intl = useIntl();

  const isSortingEnabled = useFlag('platform.service-accounts.sorting');
  const isFilteringEnabled = useFlag('platform.service-accounts.filtering');

  const [isOrgAdmin, setIsOrgAdmin] = useState<boolean | undefined>();
  const [isRbacAdmin, setIsRbacAdmin] = useState<boolean | undefined>();
  const [currUser, setCurrUser] = useState<ChromeUser | undefined>();

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

  const pagination = useDataViewPagination({
    perPage: 50,
    searchParams,
    setSearchParams,
  });
  const { page, perPage } = pagination;

  const currentSortBy =
    (searchParams.get('orderBy') as SortByField) || DEFAULT_SORT_FIELD;
  const currentSortOrder =
    (searchParams.get('sortOrder') as SortOrder) || DEFAULT_SORT_ORDER;

  const activeSortIndex = SORT_FIELD_TO_INDEX[currentSortBy] ?? 0;
  const activeSortDirection = currentSortOrder;

  const handleSort = useCallback(
    (
      _event: React.MouseEvent,
      columnIndex: number,
      sortDirection: 'asc' | 'desc'
    ) => {
      setSearchParams(createSortParamsUpdater(columnIndex, sortDirection));
    },
    [setSearchParams]
  );

  const getSortParams = useCallback(
    (columnIndex: number): ThProps['sort'] | undefined => {
      if (!isSortingEnabled) return undefined;
      if (!(columnIndex in SORT_FIELD_MAP)) return undefined;
      return {
        sortBy: {
          index: activeSortIndex,
          direction: activeSortDirection,
        },
        onSort: handleSort,
        columnIndex,
      };
    },
    [isSortingEnabled, activeSortIndex, activeSortDirection, handleSort]
  );

  const urlFilters = useMemo(
    () => ({
      name: searchParams.get('name') || '',
      clientId: searchParams.get('clientId') || '',
      creator: searchParams.get('creator') || '',
    }),
    [searchParams]
  );

  const [filterInputs, setFilterInputs] =
    useState<Record<FilterKey, string>>(urlFilters);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFilterInputs(urlFilters);
  }, [urlFilters]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const updateUrlWithFilters = useCallback(
    (newFilters: Record<FilterKey, string>) => {
      setSearchParams(createFiltersParamsUpdater(newFilters));
    },
    [setSearchParams]
  );

  const handleFilterChange = useCallback(
    (key: FilterKey, value: string) => {
      const newFilters = { ...filterInputs, [key]: value };
      setFilterInputs(newFilters);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        updateUrlWithFilters(newFilters);
      }, FILTER_DEBOUNCE_MS);
    },
    [filterInputs, updateUrlWithFilters]
  );

  const clearAllFilters = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const clearedFilters = FILTER_KEYS.reduce(
      (acc, key) => ({ ...acc, [key]: '' }),
      {} as Record<FilterKey, string>
    );
    setFilterInputs(clearedFilters);

    setSearchParams(createClearFiltersParamsUpdater());
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(
    () => isFilteringEnabled && FILTER_KEYS.some((key) => filterInputs[key]),
    [isFilteringEnabled, filterInputs]
  );

  const canChange = useCallback(
    (serviceAccount: ServiceAccount) =>
      isOrgAdmin ||
      isRbacAdmin ||
      serviceAccount.createdBy === currUser?.identity.user?.username,
    [isOrgAdmin, currUser?.identity.user?.username, isRbacAdmin]
  );

  const calculatedItemCount = useMemo(() => {
    if (itemCount !== undefined) {
      return itemCount;
    }
    return hasMore
      ? undefined
      : Math.max(page - 1, 0) * perPage + serviceAccounts.length;
  }, [itemCount, hasMore, page, perPage, serviceAccounts.length]);

  const toggleTemplate = useCallback(
    ({ firstIndex }: { firstIndex?: number; lastIndex?: number }) => {
      const count = Math.max(page - 1, 0) * perPage + serviceAccounts.length;
      return (
        <>
          <b>
            {firstIndex} - {count}
          </b>{' '}
          {intl.formatMessage(messages.paginationOf)}{' '}
          <b>{hasMore ? intl.formatMessage(messages.paginationMany) : count}</b>
        </>
      );
    },
    [page, perPage, serviceAccounts.length, hasMore, intl]
  );

  const getRowActions = useCallback(
    (sa: ServiceAccount) => [
      {
        title: intl.formatMessage(messages.actionResetCredentials),
        isDisabled: !canChange(sa),
        ouiaId: 'reset-credentials-service-account-button',
        onClick: () => navigate(mergeToBasename(`reset/${sa.id}`)),
      },
      {
        title: intl.formatMessage(messages.actionDelete),
        isDisabled: !canChange(sa),
        ouiaId: 'delete-service-account-button',
        onClick: () => navigate(mergeToBasename(`delete/${sa.id}`)),
      },
    ],
    [canChange, navigate, intl]
  );

  const rows: DataViewTr[] = useMemo(
    () =>
      serviceAccounts.map((sa) => ({
        row: [
          sa.name,
          sa.description,
          sa.clientId,
          sa.createdBy,
          <DateFormat key={`date-${sa.id}`} date={sa.createdAt * 1000} />,
          {
            cell: <ActionsColumn items={getRowActions(sa)} />,
            props: { isActionCell: true },
          },
        ],
        id: sa.id,
      })),
    [serviceAccounts, getRowActions]
  );

  const columns: DataViewTh[] = useMemo(
    () => [
      {
        cell: intl.formatMessage(messages.columnName),
        props: { sort: getSortParams(0) },
      },
      {
        cell: intl.formatMessage(messages.columnDescription),
        props: { sort: getSortParams(1) },
      },
      intl.formatMessage(messages.columnClientId),
      intl.formatMessage(messages.columnOwner),
      {
        cell: intl.formatMessage(messages.columnTimeCreated),
        props: { sort: getSortParams(4) },
      },
      {
        cell: '',
        props: {
          screenReaderText: intl.formatMessage(messages.columnActionsSr),
        },
      },
    ],
    [getSortParams, intl]
  );

  const columnCount = columns.length;

  const headLoading = <SkeletonTableHead columns={columns} />;
  const bodyLoading = (
    <SkeletonTableBody rowsCount={perPage} columnsCount={columnCount} />
  );

  const emptyState = (
    <Tbody>
      <Tr>
        <Td colSpan={columnCount}>
          <EmptyState
            headingLevel="h4"
            icon={SearchIcon}
            titleText={intl.formatMessage(messages.emptyTitle)}
          >
            <EmptyStateBody>
              {hasActiveFilters
                ? intl.formatMessage(messages.emptyFilteredBody)
                : intl.formatMessage(messages.emptyBody)}
            </EmptyStateBody>
            {hasActiveFilters && (
              <EmptyStateFooter>
                <EmptyStateActions>
                  <Button
                    ouiaId={`${OUIA_ID}-emptystate-clear-filters-button`}
                    variant="link"
                    onClick={clearAllFilters}
                  >
                    {intl.formatMessage(messages.emptyClearFilters)}
                  </Button>
                </EmptyStateActions>
              </EmptyStateFooter>
            )}
          </EmptyState>
        </Td>
      </Tr>
    </Tbody>
  );

  const activeState = useMemo(() => {
    if (isLoading) return DataViewState.loading;
    if (serviceAccounts.length === 0) return DataViewState.empty;
    return undefined;
  }, [isLoading, serviceAccounts.length]);

  return (
    <DataView activeState={activeState}>
      <DataViewToolbar
        ouiaId={`${OUIA_ID}-header-toolbar`}
        filters={
          isFilteringEnabled ? (
            <DataViewFilters
              onChange={(_e, values) => {
                Object.entries(values).forEach(([key, value]) => {
                  handleFilterChange(key as FilterKey, value as string);
                });
              }}
              values={filterInputs}
            >
              <DataViewTextFilter
                filterId="name"
                title={intl.formatMessage(messages.columnName)}
                placeholder={intl.formatMessage(messages.filterNamePlaceholder)}
                ouiaId={`${OUIA_ID}-filter-name`}
              />
              <DataViewTextFilter
                filterId="clientId"
                title={intl.formatMessage(messages.columnClientId)}
                placeholder={intl.formatMessage(
                  messages.filterClientIdPlaceholder
                )}
                ouiaId={`${OUIA_ID}-filter-clientId`}
              />
              <DataViewTextFilter
                filterId="creator"
                title={intl.formatMessage(messages.columnOwner)}
                placeholder={intl.formatMessage(
                  messages.filterOwnerPlaceholder
                )}
                ouiaId={`${OUIA_ID}-filter-creator`}
              />
            </DataViewFilters>
          ) : undefined
        }
        clearAllFilters={isFilteringEnabled ? clearAllFilters : undefined}
        actions={
          <ToolbarGroup>
            <ToolbarItem>
              <CreateCredentialButton onCreateToken={onCreateToken} />
            </ToolbarItem>
          </ToolbarGroup>
        }
        pagination={
          <Pagination
            ouiaId={`${OUIA_ID}-top-pagination`}
            widgetId="top-sa-pagination"
            perPageOptions={PER_PAGE_OPTIONS}
            itemCount={calculatedItemCount}
            toggleTemplate={toggleTemplate}
            isCompact
            {...pagination}
          />
        }
      />

      <DataViewTable
        aria-label={intl.formatMessage(messages.tableAriaLabel)}
        ouiaId={OUIA_ID}
        columns={columns}
        rows={rows}
        headStates={{ loading: headLoading }}
        bodyStates={{
          loading: bodyLoading,
          empty: emptyState,
        }}
      />

      <DataViewToolbar
        ouiaId={`${OUIA_ID}-footer-toolbar`}
        pagination={
          <Pagination
            ouiaId={`${OUIA_ID}-bottom-pagination`}
            widgetId="bottom-sa-pagination"
            perPageOptions={PER_PAGE_OPTIONS}
            itemCount={calculatedItemCount}
            toggleTemplate={toggleTemplate}
            {...pagination}
          />
        }
      />
    </DataView>
  );
};
