type Options = {
  clientId: string;
  token: string;
  sso: string;
};

export async function deleteServiceAccount({ clientId, token, sso }: Options) {
  return fetch(
    `${sso}realms/redhat-external/apis/service_accounts/v1/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      method: 'DELETE',
    }
  );
}
