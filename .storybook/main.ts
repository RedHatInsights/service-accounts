import { createMainConfig } from '@redhat-cloud-services/hcc-storybook-hub/main-config';
import path from 'path';

const mocksDir = path.join(process.cwd(), '.storybook/mocks');

export default createMainConfig({
  staticDirs: ['../public'],
  extraAliases: {
    '@redhat-cloud-services/frontend-components/DateFormat': path.join(mocksDir, 'DateFormat.tsx'),
    '@redhat-cloud-services/frontend-components/Main': path.join(mocksDir, 'Main.tsx'),
    '@redhat-cloud-services/frontend-components/PageHeader': path.join(mocksDir, 'PageHeader.tsx'),
    '@redhat-cloud-services/frontend-components-notifications/hooks/useNotifications': path.join(mocksDir, 'useNotifications.ts'),
  },
});
