import { FILTER_KEYS, SORT_FIELD_MAP, TEXT_FILTER_KEYS } from './constants';
import type { TextFilterKey } from './constants';

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
  newFilters: Record<TextFilterKey, string>
): (prev: URLSearchParams) => URLSearchParams {
  return (prev) => {
    const params = new URLSearchParams(prev);
    TEXT_FILTER_KEYS.forEach((key) => {
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

export function createTypeFilterParamsUpdater(
  typeValue: string
): (prev: URLSearchParams) => URLSearchParams {
  return (prev) => {
    const params = new URLSearchParams(prev);
    if (typeValue) {
      params.set('type', typeValue);
    } else {
      params.delete('type');
    }
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
