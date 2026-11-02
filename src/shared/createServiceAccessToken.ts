type Options = {
  name: string;
  description: string;
  token: string;
  sso: string;
};

export class ServiceAccessTokenUnavailableError extends Error {
  constructor() {
    super('SAT creation is unavailable');
    Object.setPrototypeOf(this, ServiceAccessTokenUnavailableError.prototype);
  }
}

export async function createServiceAccessToken({
  name,
  description,
  token,
  sso,
}: Options): Promise<{ username: string; token: string }> {
  const response = await fetch(
    `${sso}realms/redhat-external/apis/service_accounts/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ name, description, type: 'service_access_token' }),
    }
  );

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    if (
      body &&
      typeof body === 'object' &&
      'error' in body &&
      typeof body.error === 'string' &&
      body.error.includes('Unrecognized field "type"')
    ) {
      throw new ServiceAccessTokenUnavailableError();
    }
    throw new Error(
      `Failed to create service access token (${response.status})`
    );
  }

  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== 'object' ||
    !('type' in data) ||
    data.type !== 'service_access_token' ||
    !('serviceAccessTokenId' in data) ||
    typeof data.serviceAccessTokenId !== 'string' ||
    !data.serviceAccessTokenId ||
    !('secret' in data) ||
    typeof data.secret !== 'string' ||
    !data.secret
  ) {
    throw new Error('Unexpected service access token response');
  }

  return { username: data.serviceAccessTokenId, token: data.secret };
}
