import {
  ServiceAccessTokenUnavailableError,
  createServiceAccessToken,
} from './createServiceAccessToken';

describe('createServiceAccessToken', () => {
  const options = {
    name: 'build-token',
    description: 'Build access',
    token: 'user-token',
    sso: 'https://sso.example.com/auth/',
  };

  beforeEach(() => jest.resetAllMocks());

  it('creates a SAT and returns its one-time credentials', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'service_access_token',
        serviceAccessTokenId: '|service-account-client-123',
        secret: 'new-secret',
      }),
    });

    await expect(createServiceAccessToken(options)).resolves.toEqual({
      username: '|service-account-client-123',
      token: 'new-secret',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://sso.example.com/auth/realms/redhat-external/apis/service_accounts/v1',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer user-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'build-token',
          description: 'Build access',
          type: 'service_access_token',
        }),
      }
    );
  });

  it('rejects an unsuccessful response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
    });

    await expect(createServiceAccessToken(options)).rejects.toThrow('(403)');
  });

  it('identifies a backend that does not accept SAT creation', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error:
          'Invalid json representation for ServiceAccountCreateRequestData. Unrecognized field "type" at line 1 column 56.',
      }),
    });

    await expect(createServiceAccessToken(options)).rejects.toBeInstanceOf(
      ServiceAccessTokenUnavailableError
    );
  });

  it('rejects an ordinary service account response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clientId: 'client-123', secret: 'new-secret' }),
    });

    await expect(createServiceAccessToken(options)).rejects.toThrow(
      'Unexpected service access token response'
    );
  });

  it('treats unreadable successful responses as unexpected', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected end of JSON input');
      },
    });

    await expect(createServiceAccessToken(options)).rejects.toThrow(
      'Unexpected service access token response'
    );
  });
});
