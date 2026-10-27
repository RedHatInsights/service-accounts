import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EmptyStateNoServiceAccounts } from './EmptyStateNoServiceAccounts';

const meta: Meta<typeof EmptyStateNoServiceAccounts> = {
  title: 'Pages/ListServiceAccountsPage/EmptyState',
  component: EmptyStateNoServiceAccounts,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The SAT action callback is supplied by the creation flow when the CIAM API is available.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyStateNoServiceAccounts>;

export const BothCreationChoices: Story = {
  globals: { satFlag: 'enabled' },
  args: { onCreateToken: fn() },
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement);
    expect(
      page.getByText('No service accounts or service access tokens yet')
    ).toBeInTheDocument();
    expect(
      page.getByRole('link', { name: 'Create service account' })
    ).toBeInTheDocument();
    await userEvent.click(
      page.getByRole('button', { name: 'Create service access token' })
    );
    expect(args.onCreateToken).toHaveBeenCalledTimes(1);
  },
};

export const SatFlagDisabled: Story = {
  args: { onCreateToken: fn() },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    expect(page.getByText('No service accounts yet')).toBeInTheDocument();
    expect(
      page.getByRole('link', { name: 'Create service account' })
    ).toBeInTheDocument();
    expect(
      page.queryByRole('button', { name: 'Create service access token' })
    ).not.toBeInTheDocument();
  },
};
