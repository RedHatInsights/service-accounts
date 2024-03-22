import { ServiceAccount } from '../types';

type Options = {
  clientId: string;
  token: string;
  sso: string;
};

export async function fetchServiceAccount({
  clientId,
  token,
  sso,
}: Options): Promise<ServiceAccount> {
  const response = await fetch(
    `${sso}realms/redhat-external/apis/service_accounts/v1/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status !== 200) {
    throw new Error(`Can't found service account ${clientId}`);
  }
  const data = await response.json();
  return data;
}
