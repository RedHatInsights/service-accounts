import { resetServiceAccount } from './resetServiceAccount';

describe('resetServiceAccount', () => {
  const mockToken = 'test-token';
  const mockSso = 'https://sso.example.com/auth/';
  const mockClientId = 'client-123';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return service account with new secret', async () => {
    const mockResetResponse = {
      id: '1',
      clientId: mockClientId,
      name: 'Test SA',
      secret: 'new-generated-secret',
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockResetResponse),
    });

    const result = await resetServiceAccount({
      clientId: mockClientId,
      token: mockToken,
      sso: mockSso,
    });

    expect(result).toEqual(mockResetResponse);
  });

  it('should call fetch with correct URL including resetSecret endpoint', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    });

    await resetServiceAccount({
      clientId: mockClientId,
      token: mockToken,
      sso: mockSso,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${mockClientId}/resetSecret`),
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mockToken}`,
          'content-type': 'application/json',
        },
      })
    );
  });
});
