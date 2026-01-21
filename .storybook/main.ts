import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';

// Use process.cwd() as base path for Storybook 10 ESM compatibility
const storybookDir = path.join(process.cwd(), '.storybook');

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    'msw-storybook-addon',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  staticDirs: ['../public'],
  webpackFinal: async (config) => {
    // Add SCSS support
    config.module?.rules?.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
    });

    // Mock frontend-components modules
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@redhat-cloud-services/frontend-components/useChrome': path.join(storybookDir, 'mocks/useChrome.ts'),
      '@redhat-cloud-services/frontend-components/DateFormat': path.join(storybookDir, 'mocks/DateFormat.tsx'),
      '@redhat-cloud-services/frontend-components/Main': path.join(storybookDir, 'mocks/Main.tsx'),
      '@redhat-cloud-services/frontend-components/PageHeader': path.join(storybookDir, 'mocks/PageHeader.tsx'),
      '@redhat-cloud-services/frontend-components-notifications/hooks/useNotifications': path.join(storybookDir, 'mocks/useNotifications.ts'),
    };

    return config;
  },
};

export default config;
