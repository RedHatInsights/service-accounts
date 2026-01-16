import { SortByField, SortOrder } from '../../shared/fetchServiceAccounts';

export const OUIA_ID = 'service-accounts-table';
export const FILTER_DEBOUNCE_MS = 300;

export const PER_PAGE_OPTIONS = [
  { title: '10', value: 10 },
  { title: '20', value: 20 },
  { title: '50', value: 50 },
  { title: '100', value: 100 },
];

export const SORT_FIELD_MAP: Record<number, SortByField> = {
  0: 'name',
  1: 'description',
  4: 'createdAt',
};

export const SORT_FIELD_TO_INDEX: Record<SortByField, number> = {
  name: 0,
  description: 1,
  clientId: 2,
  createdAt: 4,
};

export const DEFAULT_SORT_FIELD: SortByField = 'name';
export const DEFAULT_SORT_ORDER: SortOrder = 'asc';

export const FILTER_KEYS = ['name', 'clientId', 'creator'] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
