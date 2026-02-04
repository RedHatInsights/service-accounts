import { buildQueryParams, fetchServiceAccounts } from './fetchServiceAccounts';

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

describe('fetchServiceAccounts - N+1 pagination pattern', () => {
  const mockToken = 'test-token';
  const mockSso = 'https://sso.example.com/auth/';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return empty array and hasMore=false when no service accounts exist', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const result = await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      perPage: 10,
    });

    expect(result.hasMore).toBe(false);
    expect(result.serviceAccounts).toEqual([]);
  });

  it('should return hasMore=false when on the last page (fewer items than perPage+1)', async () => {
    const mockData = [
      { id: '1', name: 'SA1' },
      { id: '2', name: 'SA2' },
    ];

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      perPage: 10,
    });

    expect(result.hasMore).toBe(false);
    expect(result.serviceAccounts).toEqual(mockData);
    expect(result.serviceAccounts.length).toBe(2);
  });

  it('should return hasMore=true when more pages exist (perPage+1 items returned)', async () => {
    const mockData = [
      { id: '1', name: 'SA1' },
      { id: '2', name: 'SA2' },
      { id: '3', name: 'SA3' },
    ];

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      perPage: 2,
    });

    expect(result.hasMore).toBe(true);
    expect(result.serviceAccounts.length).toBe(2);
    expect(result.serviceAccounts).toEqual([
      { id: '1', name: 'SA1' },
      { id: '2', name: 'SA2' },
    ]);
  });

  it('should return hasMore=false when exactly perPage items returned', async () => {
    const mockData = [
      { id: '1', name: 'SA1' },
      { id: '2', name: 'SA2' },
    ];

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      perPage: 2,
    });

    expect(result.hasMore).toBe(false);
    expect(result.serviceAccounts.length).toBe(2);
  });

  it('should make only one API call (N+1 pattern)', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      perPage: 10,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should request perPage+1 items from API', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      perPage: 10,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('max=11'),
      expect.any(Object)
    );
  });

  it('should call fetch with correct authorization header', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

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
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

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

  it('should calculate correct offset for page 2', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      page: 2,
      perPage: 10,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('first=10'),
      expect.any(Object)
    );
  });

  it('should throw error when API returns non-OK response', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(
      fetchServiceAccounts({
        token: mockToken,
        sso: mockSso,
      })
    ).rejects.toThrow('Failed to fetch service accounts (500)');
  });

  it('should throw error when API returns non-array response', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ error: 'something went wrong' }),
    });

    await expect(
      fetchServiceAccounts({
        token: mockToken,
        sso: mockSso,
      })
    ).rejects.toThrow('Unexpected service accounts response shape');
  });

  it('should return exactly 1 item on last page without slicing', async () => {
    const mockData = [{ id: '1', name: 'SA1' }];

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      perPage: 10,
    });

    expect(result.hasMore).toBe(false);
    expect(result.serviceAccounts.length).toBe(1);
    expect(result.serviceAccounts).toEqual(mockData);
  });

  it('should sanitize page to minimum 1 when zero is provided', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      page: 0,
      perPage: 10,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('first=0'),
      expect.any(Object)
    );
  });

  it('should sanitize page to minimum 1 when negative is provided', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      page: -5,
      perPage: 10,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('first=0'),
      expect.any(Object)
    );
  });

  it('should sanitize perPage to minimum 1 when zero is provided', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      perPage: 0,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('max=2'),
      expect.any(Object)
    );
  });

  it('should floor decimal page values', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      page: 2.7,
      perPage: 10,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('first=10'),
      expect.any(Object)
    );
  });

  it('should floor decimal perPage values', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchServiceAccounts({
      token: mockToken,
      sso: mockSso,
      perPage: 10.9,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('max=11'),
      expect.any(Object)
    );
  });
});
