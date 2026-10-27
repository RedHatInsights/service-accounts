import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import React, { useState } from 'react';
import {
  CreateServiceAccessTokenFlow,
  CreatedServiceAccessToken,
} from './CreateServiceAccessTokenFlow';

const exampleCredentials: CreatedServiceAccessToken = {
  username: 'sat-demo-user',
  token: 'demo-token-shown-once',
};

const StoryFlow = ({ shouldFail = false }: { shouldFail?: boolean }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open token creation</button>
      {isOpen && (
        <CreateServiceAccessTokenFlow
          createToken={async () => {
            if (shouldFail) throw new Error('Example request failed');
            return exampleCredentials;
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

const meta: Meta<typeof StoryFlow> = {
  title: 'User Journeys/Service Access Tokens/Create',
  component: StoryFlow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The create callback is mocked here. The production SAT API request and response contract are pending CIAM-12575.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StoryFlow>;

export const CreateAndCopyOnce: Story = {
  play: async () => {
    const page = within(document.body);
    const create = page.getByRole('button', { name: 'Create' });
    expect(create).toBeDisabled();

    await userEvent.type(page.getByLabelText(/Name/), 'automation-token');
    await userEvent.type(
      page.getByLabelText(/Short description/),
      'Build access'
    );
    await userEvent.click(create);

    await waitFor(() =>
      expect(page.getByText('Service access token created')).toBeInTheDocument()
    );
    expect(page.getByDisplayValue('sat-demo-user')).toBeInTheDocument();
    expect(page.getByDisplayValue('demo-token-shown-once')).toBeInTheDocument();

    const close = page.getByRole('button', { name: 'Close' });
    expect(close).toBeDisabled();
    await userEvent.click(
      page.getByLabelText('I have copied the username and token')
    );
    await userEvent.click(close);

    expect(
      page.queryByDisplayValue('demo-token-shown-once')
    ).not.toBeInTheDocument();
    await userEvent.click(
      page.getByRole('button', { name: 'Open token creation' })
    );
    expect(
      page.queryByDisplayValue('demo-token-shown-once')
    ).not.toBeInTheDocument();
  },
};

export const FailedCreation: Story = {
  args: { shouldFail: true },
  play: async () => {
    const page = within(document.body);
    await userEvent.type(page.getByLabelText(/Name/), 'automation-token');
    await userEvent.type(
      page.getByLabelText(/Short description/),
      'Build access'
    );
    await userEvent.click(page.getByRole('button', { name: 'Create' }));
    await waitFor(() =>
      expect(
        page.getByText(
          'The service access token could not be created. Try again.'
        )
      ).toBeInTheDocument()
    );
    expect(
      page.queryByText('Service access token created')
    ).not.toBeInTheDocument();
  },
};
