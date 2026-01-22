import { fetchServiceAccount } from './fetchServiceAccount';

describe('fetchServiceAccount', () => {
  const mockToken = 'test-token';
  const mockSso = 'https://sso.example.com/auth/';
  const mockClientId = 'client-123';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return service account data on successful fetch', async () => {
    const mockServiceAccount = {
      id: '1',
      clientId: mockClientId,
      name: 'Test SA',
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve(mockServiceAccount),
    });

    const result = await fetchServiceAccount({
      clientId: mockClientId,
      token: mockToken,
      sso: mockSso,
    });

    expect(result).toEqual(mockServiceAccount);
  });

  it('should throw error when service account not found', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 404,
      json: () => Promise.resolve({}),
    });

    await expect(
      fetchServiceAccount({
        clientId: mockClientId,
        token: mockToken,
        sso: mockSso,
      })
    ).rejects.toThrow(`Can't found service account ${mockClientId}`);
  });

  it('should call fetch with correct URL and headers', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve({}),
    });

    await fetchServiceAccount({
      clientId: mockClientId,
      token: mockToken,
      sso: mockSso,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${mockSso}realms/redhat-external/apis/service_accounts/v1/${mockClientId}`,
      {
        headers: { Authorization: `Bearer ${mockToken}` },
      }
    );
  });
});
