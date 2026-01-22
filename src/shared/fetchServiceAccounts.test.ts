import {
  LAST_PAGE,
  NO_DATA,
  RESULTS,
  buildQueryParams,
  fetchServiceAccounts,
} from './fetchServiceAccounts';

describe('buildQueryParams', () => {
  it('should build basic query params with first and max', () => {
    const result = buildQueryParams({ first: 0, max: 10 });
    expect(result).toBe('first=0&max=10');
  });

  it('should include orderBy when provided', () => {
    const result = buildQueryParams({ first: 0, max: 10, orderBy: 'name' });
    expect(result).toBe('first=0&max=10&orderBy=name');
  });

  it('should include sortOrder when provided', () => {
    const result = buildQueryParams({
      first: 0,
      max: 10,
      orderBy: 'name',
      sortOrder: 'desc',
    });
    expect(result).toBe('first=0&max=10&orderBy=name&sortOrder=desc');
  });

  it('should include filters when provided', () => {
    const result = buildQueryParams({
      first: 0,
      max: 10,
      filters: {
        name: 'test',
        clientId: 'client-123',
        creator: 'user@example.com',
      },
    });
    expect(result).toBe(
      'first=0&max=10&name=test&clientId=client-123&creator=user%40example.com'
    );
  });

  it('should skip empty filter values', () => {
    const result = buildQueryParams({
      first: 0,
      max: 10,
      filters: { name: 'test', clientId: '', creator: undefined },
    });
    expect(result).toBe('first=0&max=10&name=test');
  });

  it('should build complete query with all parameters', () => {
    const result = buildQueryParams({
      first: 20,
      max: 10,
      orderBy: 'createdAt',
      sortOrder: 'asc',
      filters: { name: 'api' },
    });
    expect(result).toBe(
      'first=20&max=10&orderBy=createdAt&sortOrder=asc&name=api'
    );
  });
});

describe('fetchServiceAccounts', () => {
  const mockToken = 'test-token';
  const mockSso = 'https://sso.example.com/auth/';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return NO_DATA state when no service accounts exist', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    const result = await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
    });

    expect(result.state).toBe(NO_DATA);
    expect(result.serviceAccounts).toEqual([]);
  });

  it('should return LAST_PAGE state when on the last page', async () => {
    const mockData = [
      { id: '1', name: 'SA1' },
      { id: '2', name: 'SA2' },
    ];

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockData) })
      .mockResolvedValueOnce({
        json: () => Promise.resolve([{ id: '2', name: 'SA2' }]),
      });

    const result = await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      perPage: 10,
    });

    expect(result.state).toBe(LAST_PAGE);
  });

  it('should return RESULTS state when more pages exist', async () => {
    const mockData = [{ id: '1', name: 'SA1' }];
    const mockNextPageData = [
      { id: '2', name: 'SA2' },
      { id: '3', name: 'SA3' },
    ];

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockData) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockNextPageData) });

    const result = await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      perPage: 2,
    });

    expect(result.state).toBe(RESULTS);
  });

  it('should call fetch with correct authorization header', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${mockToken}` },
      })
    );
  });

  it('should construct correct API URL', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      page: 2,
      perPage: 10,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'realms/redhat-external/apis/service_accounts/v1'
      ),
      expect.any(Object)
    );
  });
});
