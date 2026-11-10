import { NewServiceAccount } from '../types';

type Options = {
  clientId: string;
  token: string;
  sso: string;
  expectedSatUsername?: string;
};

export class UnexpectedServiceAccessTokenResetResponseError extends Error {
  constructor() {
    super('Unexpected service access token reset response');
    Object.setPrototypeOf(
      this,
      UnexpectedServiceAccessTokenResetResponseError.prototype
    );
  }
}

export async function resetServiceAccount({
  clientId,
  token,
  sso,
  expectedSatUsername,
}: Options): Promise<NewServiceAccount> {
  let response: Response;
  try {
    response = await fetch(
      `${sso}realms/redhat-external/apis/service_accounts/v1/${clientId}/resetSecret`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        method: 'POST',
      }
    );
  } catch (error) {
    if (expectedSatUsername !== undefined) {
      throw new UnexpectedServiceAccessTokenResetResponseError();
    }
    throw error;
  }
  if (!response.ok && expectedSatUsername !== undefined) {
    throw new Error(`Failed to reset credentials (${response.status})`);
  }

  const data: unknown = await response.json().catch(() => null);
  if (expectedSatUsername !== undefined) {
    if (
      !data ||
      typeof data !== 'object' ||
      !('type' in data) ||
      data.type !== 'service_access_token' ||
      !('serviceAccessTokenId' in data) ||
      data.serviceAccessTokenId !== expectedSatUsername ||
      !('secret' in data) ||
      typeof data.secret !== 'string' ||
      !data.secret
    ) {
      throw new UnexpectedServiceAccessTokenResetResponseError();
    }
  }
  if (!data) throw new Error('Empty service account reset response');
  return data as NewServiceAccount;
}
