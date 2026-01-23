import { deleteServiceAccount } from './deleteServiceAccount';

describe('deleteServiceAccount', () => {
  const mockToken = 'test-token';
  const mockSso = 'https://sso.example.com/auth/';
  const mockClientId = 'client-123';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return fetch response', async () => {
    const mockResponse = { ok: true, status: 204 };
    global.fetch = jest.fn().mockResolvedValueOnce(mockResponse);

    const result = await deleteServiceAccount({
      clientId: mockClientId,
      token: mockToken,
      sso: mockSso,
    });

    expect(result).toEqual(mockResponse);
  });

  it('should call fetch with correct URL, method and headers', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });

    await deleteServiceAccount({
      clientId: mockClientId,
      token: mockToken,
      sso: mockSso,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${mockSso}realms/redhat-external/apis/service_accounts/v1/${mockClientId}`,
      {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          'content-type': 'application/json',
        },
        method: 'DELETE',
      }
    );
  });
});
