import { createServiceAccount } from './createServiceAccount';

describe('createServiceAccount', () => {
  const mockToken = 'test-token';
  const mockSso = 'https://sso.example.com/auth/';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return created service account data', async () => {
    const mockNewServiceAccount = {
      id: '1',
      clientId: 'new-client-id',
      name: 'New SA',
      secret: 'generated-secret',
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockNewServiceAccount),
    });

    const result = await createServiceAccount({
      name: 'New SA',
      description: 'Test description',
      token: mockToken,
      sso: mockSso,
    });

    expect(result).toEqual(mockNewServiceAccount);
  });

  it('should call fetch with correct URL, method, headers and body', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    });

    await createServiceAccount({
      name: 'New SA',
      description: 'Test description',
      token: mockToken,
      sso: mockSso,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${mockSso}realms/redhat-external/apis/service_accounts/v1`,
      {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New SA',
          description: 'Test description',
        }),
        method: 'POST',
      }
    );
  });
});
