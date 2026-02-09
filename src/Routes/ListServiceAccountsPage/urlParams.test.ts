import {
  createClearFiltersParamsUpdater,
  createFiltersParamsUpdater,
  createSortParamsUpdater,
} from './urlParams';

describe('urlParams - multiple API calls fix', () => {
  describe('createSortParamsUpdater', () => {
    it('returns updater that sets orderBy, sortOrder and resets page to 1', () => {
      const updater = createSortParamsUpdater(0, 'desc');
      const prev = new URLSearchParams(
        '?page=3&orderBy=createdAt&sortOrder=asc'
      );

      const result = updater(prev);

      expect(result.get('orderBy')).toBe('name');
      expect(result.get('sortOrder')).toBe('desc');
      expect(result.get('page')).toBe('1');
    });

    it('preserves other params when updating sort', () => {
      const updater = createSortParamsUpdater(1, 'asc');
      const prev = new URLSearchParams(
        '?page=2&perPage=20&name=test&orderBy=name'
      );

      const result = updater(prev);

      expect(result.get('orderBy')).toBe('description');
      expect(result.get('sortOrder')).toBe('asc');
      expect(result.get('page')).toBe('1');
      expect(result.get('perPage')).toBe('20');
      expect(result.get('name')).toBe('test');
    });

    it('returns identity updater for unknown column index', () => {
      const updater = createSortParamsUpdater(99, 'desc');
      const prev = new URLSearchParams('?page=1&orderBy=name');

      const result = updater(prev);

      expect(result.get('orderBy')).toBe('name');
      expect(result.get('page')).toBe('1');
    });
  });

  describe('createFiltersParamsUpdater', () => {
    it('sets filter params and resets page to 1', () => {
      const updater = createFiltersParamsUpdater({
        name: 'my-app',
        clientId: '',
        creator: '',
      });
      const prev = new URLSearchParams('?page=5');

      const result = updater(prev);

      expect(result.get('name')).toBe('my-app');
      expect(result.get('page')).toBe('1');
    });

    it('removes empty filter params', () => {
      const updater = createFiltersParamsUpdater({
        name: '',
        clientId: 'client-123',
        creator: '',
      });
      const prev = new URLSearchParams('?name=old&page=2');

      const result = updater(prev);

      expect(result.get('name')).toBeNull();
      expect(result.get('clientId')).toBe('client-123');
      expect(result.get('page')).toBe('1');
    });
  });

  describe('createClearFiltersParamsUpdater', () => {
    it('removes all filter params and resets page to 1', () => {
      const updater = createClearFiltersParamsUpdater();
      const prev = new URLSearchParams(
        '?name=test&clientId=abc&creator=user&page=3'
      );

      const result = updater(prev);

      expect(result.get('name')).toBeNull();
      expect(result.get('clientId')).toBeNull();
      expect(result.get('creator')).toBeNull();
      expect(result.get('page')).toBe('1');
    });

    it('preserves non-filter params', () => {
      const updater = createClearFiltersParamsUpdater();
      const prev = new URLSearchParams(
        '?name=test&perPage=20&orderBy=createdAt'
      );

      const result = updater(prev);

      expect(result.get('name')).toBeNull();
      expect(result.get('perPage')).toBe('20');
      expect(result.get('orderBy')).toBe('createdAt');
      expect(result.get('page')).toBe('1');
    });
  });
});
