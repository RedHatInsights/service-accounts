import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ServiceAccountsTable } from './ServiceAccountsTable';
import { ServiceAccount } from '../../types';

// Mock data for stories
const mockServiceAccounts: ServiceAccount[] = [
  {
    id: 'sa-001',
    clientId: 'client-abc-123',
    createdAt: 1704067200, // 2024-01-01
    createdBy: 'john.doe',
    name: 'my-api-service',
    description: 'Production API connector for backend services',
  },
  {
    id: 'sa-002',
    clientId: 'client-def-456',
    createdAt: 1706745600, // 2024-02-01
    createdBy: 'jane.smith',
    name: 'data-pipeline',
    description: 'ETL pipeline service account',
  },
  {
    id: 'sa-003',
    clientId: 'client-ghi-789',
    createdAt: 1709251200, // 2024-03-01
    createdBy: 'bob.wilson',
    name: 'monitoring-agent',
    description: 'System monitoring and alerting service',
  },
  {
    id: 'sa-004',
    clientId: 'client-jkl-012',
    createdAt: 1711929600, // 2024-04-01
    createdBy: 'alice.johnson',
    name: 'ci-cd-runner',
    description: 'Continuous integration runner account',
  },
  {
    id: 'sa-005',
    clientId: 'client-mno-345',
    createdAt: 1714521600, // 2024-05-01
    createdBy: 'john.doe',
    name: 'backup-service',
    description: 'Automated backup service account',
  },
];

const meta: Meta<typeof ServiceAccountsTable> = {
  title: 'Pages/ListServiceAccountsPage/ServiceAccountsTable',
  component: ServiceAccountsTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The ServiceAccountsTable component displays a list of service accounts using PatternFly DataView.

## Features
- **DataView Structure**: Uses DataView → DataViewToolbar → DataViewTable → DataViewToolbar pattern
- **URL-synced Pagination**: Pagination state is automatically synced with URL parameters
- **Loading State**: Shows skeleton rows while data is being fetched
- **Empty State**: Clear messaging when no data is available
- **Row Actions**: Reset credentials and Delete actions based on user permissions
        `,
      },
    },
  },
  argTypes: {
    serviceAccounts: {
      description: 'Array of service account objects to display',
    },
    itemCount: {
      description: 'Total count of items for pagination (optional)',
      control: { type: 'number' },
    },
    hasMore: {
      description: 'Whether there are more pages available',
      control: 'boolean',
    },
    isLoading: {
      description: 'Whether data is currently loading',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ServiceAccountsTable>;

/**
 * Default state showing a list of service accounts with DataView pagination.
 * Pagination is automatically synced with URL parameters via useDataViewPagination hook.
 */
export const Default: Story = {
  args: {
    serviceAccounts: mockServiceAccounts,
    hasMore: false,
    isLoading: false,
  },
};

/**
 * Loading state showing skeleton placeholders while data is being fetched.
 * Uses SkeletonTableHead and SkeletonTableBody from @patternfly/react-component-groups.
 */
export const Loading: Story = {
  args: {
    serviceAccounts: [],
    hasMore: false,
    isLoading: true,
  },
};

/**
 * Empty state when no service accounts exist.
 * Displays a centered empty state with guidance.
 */
export const Empty: Story = {
  args: {
    serviceAccounts: [],
    hasMore: false,
    isLoading: false,
  },
};

/**
 * State with more pages available (hasMore = true).
 * Pagination shows "X of many" instead of total count.
 */
export const WithMorePages: Story = {
  args: {
    serviceAccounts: mockServiceAccounts,
    hasMore: true,
    isLoading: false,
  },
};

/**
 * State with explicit item count for accurate pagination.
 */
export const WithItemCount: Story = {
  args: {
    serviceAccounts: mockServiceAccounts,
    itemCount: 150,
    hasMore: true,
    isLoading: false,
  },
};
