import {
  UnexpectedServiceAccessTokenResetResponseError,
  resetServiceAccount,
} from './resetServiceAccount';

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
      ok: true,
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
      ok: true,
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

  it('preserves the service-account error response for the existing credentials modal', async () => {
    const errorResponse = {
      error: 'reset_denied',
      error_description: 'Access denied',
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve(errorResponse),
    });

    await expect(
      resetServiceAccount({
        clientId: mockClientId,
        token: mockToken,
        sso: mockSso,
      })
    ).resolves.toEqual(errorResponse);
  });

  it('returns a SAT reset only when the new secret and unchanged username are confirmed', async () => {
    const sat = {
      type: 'service_access_token',
      serviceAccessTokenId: '|service-account-client-123',
      secret: 'new-token',
      expiresAt: 1800000000,
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(sat),
    });

    await expect(
      resetServiceAccount({
        clientId: mockClientId,
        token: mockToken,
        sso: mockSso,
        expectedSatUsername: sat.serviceAccessTokenId,
      })
    ).resolves.toEqual(sat);
  });

  it('rejects a failed SAT reset without showing credentials', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    await expect(
      resetServiceAccount({
        clientId: mockClientId,
        token: mockToken,
        sso: mockSso,
        expectedSatUsername: '|service-account-client-123',
      })
    ).rejects.toThrow('Failed to reset credentials (403)');
  });

  it.each([
    {
      type: 'service_access_token',
      serviceAccessTokenId: '|service-account-client-123',
    },
    {
      type: 'service_access_token',
      serviceAccessTokenId: '|service-account-changed',
      secret: 'new-token',
    },
    {
      type: 'service_account',
      serviceAccessTokenId: '|service-account-client-123',
      secret: 'new-token',
    },
  ])('rejects an unconfirmed SAT reset response', async (body) => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(body),
    });

    await expect(
      resetServiceAccount({
        clientId: mockClientId,
        token: mockToken,
        sso: mockSso,
        expectedSatUsername: '|service-account-client-123',
      })
    ).rejects.toBeInstanceOf(UnexpectedServiceAccessTokenResetResponseError);
  });

  it('treats unreadable successful SAT reset JSON as an uncertain result', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Invalid JSON')),
    });

    await expect(
      resetServiceAccount({
        clientId: mockClientId,
        token: mockToken,
        sso: mockSso,
        expectedSatUsername: '|service-account-client-123',
      })
    ).rejects.toBeInstanceOf(UnexpectedServiceAccessTokenResetResponseError);
  });
});
