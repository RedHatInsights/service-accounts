// Mock for @redhat-cloud-services/frontend-components/useChrome
export const useChrome = () => ({
  auth: {
    getUser: () => Promise.resolve({
      identity: {
        user: {
          username: 'john.doe',
          is_org_admin: true,
        },
      },
    }),
    getToken: () => Promise.resolve('mock-token'),
  },
  getUserPermissions: () => Promise.resolve([
    { permission: 'rbac:*:*' }
  ]),
  appAction: () => {},
  getEnvironmentDetails: () => ({
    sso: 'https://sso.example.com/',
  }),
  quickStarts: {
    set: () => {},
  },
});

export default useChrome;
