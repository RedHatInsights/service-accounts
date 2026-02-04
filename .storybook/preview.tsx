import React from 'react';
import type { Preview } from '@storybook/react-webpack5';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { FeatureFlagsProvider } from './mocks/unleash.tsx';

// PatternFly 6 styles
import '@patternfly/react-core/dist/styles/base.css';

// Initialize MSW
initialize({ onUnhandledRequest: 'bypass' });

// Create a QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Mock Chrome context for frontend-components
const mockChrome = {
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
};

// Inject mock into window for useChrome hook
if (typeof window !== 'undefined') {
  (window as any).insights = {
    chrome: mockChrome,
  };

  // Create portal target for modals (used by appendTo in utils.ts)
  if (!document.getElementById('chrome-app-render-root')) {
    const portalRoot = document.createElement('div');
    portalRoot.id = 'chrome-app-render-root';
    document.body.appendChild(portalRoot);
  }
}

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'padded',
  },
  globalTypes: {
    sortingFlag: {
      name: 'Sorting',
      description: 'Enable/disable sorting feature flag',
      defaultValue: 'enabled',
      toolbar: {
        icon: 'listunordered',
        items: [
          { value: 'enabled', title: 'Sorting Enabled' },
          { value: 'disabled', title: 'Sorting Disabled' },
        ],
        dynamicTitle: true,
      },
    },
    filteringFlag: {
      name: 'Filtering',
      description: 'Enable/disable filtering feature flag',
      defaultValue: 'enabled',
      toolbar: {
        icon: 'filter',
        items: [
          { value: 'enabled', title: 'Filtering Enabled' },
          { value: 'disabled', title: 'Filtering Disabled' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      // Get feature flag values from toolbar globals (convert string to boolean)
      const featureFlags = {
        'platform.service-accounts.sorting': context.globals.sortingFlag !== 'disabled',
        'platform.service-accounts.filtering': context.globals.filteringFlag !== 'disabled',
      };

      // Always wrap with FeatureFlagsProvider, but allow stories to skip other decorators
      if (context.parameters.skipGlobalDecorators) {
        return (
          <FeatureFlagsProvider flags={featureFlags}>
            <Story />
          </FeatureFlagsProvider>
        );
      }

      return (
        <FeatureFlagsProvider flags={featureFlags}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter>
              <Story />
            </MemoryRouter>
          </QueryClientProvider>
        </FeatureFlagsProvider>
      );
    },
  ],
};

export default preview;
