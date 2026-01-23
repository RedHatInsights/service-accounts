import { mergeToBasename } from './utils';

describe('mergeToBasename', () => {
  const defaultBasename = '/iam/service-accounts';

  it('should merge string path without leading slash', () => {
    const result = mergeToBasename('create', defaultBasename);
    expect(result).toBe('/iam/service-accounts/create');
  });

  it('should merge string path with leading slash', () => {
    const result = mergeToBasename('/create', defaultBasename);
    expect(result).toBe('/iam/service-accounts//create');
  });

  it('should merge object path (LocationDescriptor)', () => {
    const result = mergeToBasename(
      { pathname: 'create', search: '?id=123' },
      defaultBasename
    );
    expect(result).toEqual({
      pathname: '/iam/service-accounts/create',
      search: '?id=123',
    });
  });

  it('should use default basename from package.json when not provided', () => {
    const result = mergeToBasename('create');
    expect(result).toBe('/iam/service-accounts/create');
  });
});
