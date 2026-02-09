import { FILTER_KEYS, SORT_FIELD_MAP } from './constants';
import type { FilterKey } from './constants';

export function createSortParamsUpdater(
  columnIndex: number,
  sortDirection: 'asc' | 'desc'
): (prev: URLSearchParams) => URLSearchParams {
  const sortField = SORT_FIELD_MAP[columnIndex];
  if (!sortField) return (prev) => prev;

  return (prev) => {
    const params = new URLSearchParams(prev);
    params.set('orderBy', sortField);
    params.set('sortOrder', sortDirection);
    params.set('page', '1');
    return params;
  };
}

export function createFiltersParamsUpdater(
  newFilters: Record<FilterKey, string>
): (prev: URLSearchParams) => URLSearchParams {
  return (prev) => {
    const params = new URLSearchParams(prev);
    FILTER_KEYS.forEach((key) => {
      if (newFilters[key]) {
        params.set(key, newFilters[key]);
      } else {
        params.delete(key);
      }
    });
    params.set('page', '1');
    return params;
  };
}

export function createClearFiltersParamsUpdater(): (
  prev: URLSearchParams
) => URLSearchParams {
  return (prev) => {
    const params = new URLSearchParams(prev);
    FILTER_KEYS.forEach((key) => {
      params.delete(key);
    });
    params.set('page', '1');
    return params;
  };
}
