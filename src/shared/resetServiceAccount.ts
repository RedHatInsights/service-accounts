import { NewServiceAccount } from '../types';

type Options = {
  clientId: string;
  token: string;
  sso: string;
};

export async function resetServiceAccount({
  clientId,
  token,
  sso,
}: Options): Promise<NewServiceAccount> {
  const response = await fetch(
    `${sso}realms/redhat-external/apis/service_accounts/v1/${clientId}/resetSecret
`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      method: 'POST',
    }
  );
  const sa = await response.json();
  return sa;
}
