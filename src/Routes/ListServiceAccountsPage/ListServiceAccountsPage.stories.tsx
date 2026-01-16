import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { HttpResponse, delay, http } from 'msw';
import React, { Suspense } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ListServiceAccountsPage from './ListServiceAccountsPage';
import CreateServiceAccountPage from '../CreateServiceAccountPage/CreateServiceAccountPage';
import DeleteServiceAccountPage from '../DeleteServiceAccountPage/DeleteServiceAccountPage';
import ResetServiceAccountPage from '../ResetServiceAccountPage/ResetServiceAccountPage';
import { NewServiceAccount, ServiceAccount } from '../../types';

async function waitForStoryReady(canvas: ReturnType<typeof within>) {
  await waitFor(
    () => {
      const serviceAccount = canvas.queryByText('my-api-service');
      expect(serviceAccount).toBeInTheDocument();
    },
    { timeout: 30000, interval: 1000 }
  );

  await waitFor(
    () => {
      const createButton = canvas.queryByText(/create service account/i);
      expect(createButton).toBeInTheDocument();
    },
    { timeout: 10000, interval: 500 }
  );
}

async function waitForModal() {
  await waitFor(
    () => {
      const modal =
        document.querySelector('[role="dialog"]') ||
        document.querySelector('.pf-v6-c-modal-box') ||
        document.getElementById('modalCreateServiceAccountStep1');
      expect(modal).not.toBeNull();
    },
    { timeout: 15000 }
  );
  await delay(500);
}

async function waitForModalClose() {
  await waitFor(
    () => {
      const modal = document.querySelector('[role="dialog"]');
      expect(modal).not.toBeInTheDocument();
    },
    { timeout: 15000 }
  );
}

const createStatefulHandlers = (initialServiceAccounts: ServiceAccount[]) => {
  let serviceAccounts = [...initialServiceAccounts];

  return [
    http.get('*/apis/service_accounts/v1/:id', ({ params, request }) => {
      const { id } = params;
      const url = new URL(request.url);

      if (url.searchParams.has('first') || url.searchParams.has('max')) {
        return;
      }

      const sa = serviceAccounts.find((s) => s.id === id || s.clientId === id);

      if (sa) {
        return HttpResponse.json(sa);
      }
      return new HttpResponse(null, { status: 404 });
    }),

    http.get('*/apis/service_accounts/v1', ({ request }) => {
      const url = new URL(request.url);
      const first = parseInt(url.searchParams.get('first') || '0');
      const max = parseInt(url.searchParams.get('max') || '50');

      const orderBy = url.searchParams.get('orderBy') || 'name';
      const sortOrder = url.searchParams.get('sortOrder') || 'asc';

      const filterName = url.searchParams.get('name')?.toLowerCase();
      const filterClientId = url.searchParams.get('clientId')?.toLowerCase();
      const filterCreator = url.searchParams.get('creator')?.toLowerCase();

      let filteredAccounts = [...serviceAccounts];

      if (filterName) {
        filteredAccounts = filteredAccounts.filter((sa) =>
          sa.name.toLowerCase().includes(filterName)
        );
      }
      if (filterClientId) {
        filteredAccounts = filteredAccounts.filter((sa) =>
          sa.clientId.toLowerCase().includes(filterClientId)
        );
      }
      if (filterCreator) {
        filteredAccounts = filteredAccounts.filter((sa) =>
          sa.createdBy.toLowerCase().includes(filterCreator)
        );
      }

      filteredAccounts.sort((a, b) => {
        let valueA: string | number;
        let valueB: string | number;

        switch (orderBy) {
          case 'name':
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
          case 'description':
            valueA = (a.description || '').toLowerCase();
            valueB = (b.description || '').toLowerCase();
            break;
          case 'createdAt':
            valueA = a.createdAt;
            valueB = b.createdAt;
            break;
          case 'clientId':
            valueA = a.clientId.toLowerCase();
            valueB = b.clientId.toLowerCase();
            break;
          default:
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
        }

        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      const result = filteredAccounts.slice(first, first + max);
      return HttpResponse.json(result);
    }),

    http.post('*/apis/service_accounts/v1', async ({ request }) => {
      const body = (await request.json()) as {
        name: string;
        description: string;
      };

      const newServiceAccount: NewServiceAccount = {
        id: `sa-${Date.now()}`,
        clientId: `client-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}`,
        secret: `secret-${Math.random()
          .toString(36)
          .substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`,
        createdAt: Date.now(),
        createdBy: 'john.doe',
        name: body.name,
        description: body.description,
      };

      serviceAccounts = [newServiceAccount, ...serviceAccounts];

      return HttpResponse.json(newServiceAccount, { status: 201 });
    }),

    http.delete('*/apis/service_accounts/v1/:id', ({ params }) => {
      const { id } = params;
      serviceAccounts = serviceAccounts.filter(
        (sa) => sa.id !== id && sa.clientId !== id
      );
      return new HttpResponse(null, { status: 204 });
    }),

    http.post('*/apis/service_accounts/v1/:id/resetSecret', ({ params }) => {
      const { id } = params;
      const sa = serviceAccounts.find((s) => s.id === id || s.clientId === id);

      if (!sa) {
        return new HttpResponse(null, { status: 404 });
      }

      const resetResponse: NewServiceAccount = {
        ...sa,
        secret: `new-secret-${Math.random().toString(36).substring(2, 15)}`,
      };

      return HttpResponse.json(resetResponse);
    }),
  ];
};

const mockServiceAccounts: ServiceAccount[] = [
  {
    id: 'sa-001',
    clientId: 'client-abc-123',
    createdAt: 1704067200,
    createdBy: 'john.doe',
    name: 'my-api-service',
    description: 'Production API connector',
  },
  {
    id: 'sa-002',
    clientId: 'client-def-456',
    createdAt: 1706745600,
    createdBy: 'jane.smith',
    name: 'data-pipeline',
    description: 'ETL pipeline service account',
  },
  {
    id: 'sa-003',
    clientId: 'client-ghi-789',
    createdAt: 1709251200,
    createdBy: 'bob.wilson',
    name: 'monitoring-agent',
    description: 'System monitoring service',
  },
];

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 0,
      },
    },
  });

interface PageWithRoutesProps {
  initialRoute?: string;
}

const PageWithRoutes: React.FC<PageWithRoutesProps> = ({
  initialRoute = '/iam/service-accounts',
}) => {
  const [queryClient] = React.useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route
              path="/iam/service-accounts"
              element={<ListServiceAccountsPage />}
            >
              <Route path="create" element={<CreateServiceAccountPage />} />
              <Route
                path="reset/:clientId"
                element={<ResetServiceAccountPage />}
              />
              <Route
                path="delete/:clientId"
                element={<DeleteServiceAccountPage />}
              />
            </Route>
          </Routes>
        </Suspense>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const meta: Meta<typeof PageWithRoutes> = {
  title: 'User Journeys/Service Accounts',
  component: PageWithRoutes,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    skipGlobalDecorators: true,
    docs: {
      description: {
        component: `
# Service Accounts - User Journeys

Complete end-to-end user flows for the Service Accounts application.

## Available Journeys

- **Default**: Basic page view with data loaded
- **Create Service Account Journey**: Full create flow with validation
- **Delete Service Account Journey**: Full delete flow with confirmation
- **Reset Service Account Journey**: Full reset credentials flow
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageWithRoutes>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: createStatefulHandlers(mockServiceAccounts),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForStoryReady(canvas);

    expect(canvas.getByText('my-api-service')).toBeInTheDocument();
    expect(canvas.getByText('data-pipeline')).toBeInTheDocument();
    expect(canvas.getByText('monitoring-agent')).toBeInTheDocument();
  },
};

export const CreateServiceAccountJourney: Story = {
  parameters: {
    msw: {
      handlers: createStatefulHandlers(mockServiceAccounts),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const typingDelay =
      typeof process !== 'undefined' && process.env?.CI ? 0 : 50;
    const user = userEvent.setup({ delay: typingDelay });

    await waitForStoryReady(canvas);

    expect(canvas.getByText('my-api-service')).toBeInTheDocument();
    expect(canvas.getByText('data-pipeline')).toBeInTheDocument();
    expect(canvas.getByText('monitoring-agent')).toBeInTheDocument();

    const createButton = canvas.getByText(/create service account/i);
    await user.click(createButton);

    await waitForModal();

    const modalDialog = document.querySelector(
      '[role="dialog"]'
    ) as HTMLElement;
    expect(modalDialog).not.toBeNull();
    const modal = within(modalDialog);

    const modalTitle = modal.getByText('Create a service account');
    expect(modalTitle).toBeInTheDocument();

    const nameInput = document.getElementById(
      'text-input-name'
    ) as HTMLInputElement;
    expect(nameInput).not.toBeNull();
    await user.type(nameInput, 'INVALID-NAME');
    await user.tab();

    await waitFor(() => {
      const errorText = modal.queryByText(/must start with a letter/i);
      expect(errorText).toBeInTheDocument();
    });

    await user.clear(nameInput);
    await user.type(nameInput, 'test-journey-account');

    await waitFor(() => {
      const errorText = modal.queryByText(/must start with a letter/i);
      expect(errorText).not.toBeInTheDocument();
    });

    const descriptionInput = document.getElementById(
      'text-input-description'
    ) as HTMLInputElement;
    expect(descriptionInput).not.toBeNull();
    await user.type(descriptionInput, 'Created during Storybook journey test');

    const submitButton = document.querySelector(
      '[data-ouia-component-id="createmodal-create-button"]'
    ) as HTMLButtonElement;
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(
      () => {
        const credentialsModalEl = document.getElementById(
          'modalCreateServiceAccountStep2'
        );
        expect(credentialsModalEl).not.toBeNull();
      },
      { timeout: 15000 }
    );
    await delay(500);

    const credentialsModal = document.getElementById(
      'modalCreateServiceAccountStep2'
    ) as HTMLElement;
    const credModal = within(credentialsModal);

    expect(
      credModal.getByText('Credentials successfully generated')
    ).toBeInTheDocument();
    expect(credModal.getByText('Client ID')).toBeInTheDocument();
    expect(credModal.getByText('Client secret')).toBeInTheDocument();

    const confirmCheckbox = document.querySelector(
      '[data-ouia-component-id="checkbox"]'
    ) as HTMLInputElement;
    await user.click(confirmCheckbox);

    const closeButton = document.querySelector(
      '[data-ouia-component-id="button-close"]'
    ) as HTMLButtonElement;
    await waitFor(() => expect(closeButton).not.toBeDisabled());
    await user.click(closeButton);

    await waitForModalClose();

    await waitFor(
      () => {
        const newAccount = canvas.queryByText('test-journey-account');
        expect(newAccount).toBeInTheDocument();
      },
      { timeout: 15000 }
    );

    await waitFor(() => {
      const paginationTexts = canvas.getAllByText(/1 - 4/);
      expect(paginationTexts.length).toBeGreaterThan(0);
    });
  },
};

export const DeleteServiceAccountJourney: Story = {
  parameters: {
    msw: {
      handlers: createStatefulHandlers(mockServiceAccounts),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const typingDelay =
      typeof process !== 'undefined' && process.env?.CI ? 0 : 50;
    const user = userEvent.setup({ delay: typingDelay });

    await waitForStoryReady(canvas);

    expect(canvas.getByText('my-api-service')).toBeInTheDocument();
    expect(canvas.getByText('data-pipeline')).toBeInTheDocument();
    expect(canvas.getByText('monitoring-agent')).toBeInTheDocument();

    await waitFor(() => {
      const rows = canvas.getAllByRole('row');
      expect(rows.length).toBeGreaterThanOrEqual(4);
    });

    const dataPipelineCell = canvas.getByText('data-pipeline');
    const dataPipelineRow = dataPipelineCell.closest('tr') as HTMLElement;
    expect(dataPipelineRow).not.toBeNull();

    const allButtons = dataPipelineRow.querySelectorAll('button');
    const kebabButton = allButtons[allButtons.length - 1] as HTMLButtonElement;
    expect(kebabButton).not.toBeNull();
    await user.click(kebabButton);
    await delay(300);

    const body = within(document.body);
    const deleteMenuItem = await body.findByText(
      'Delete service account',
      {},
      { timeout: 5000 }
    );
    await user.click(deleteMenuItem);

    await waitFor(
      () => {
        const modal = document.querySelector(
          '[data-ouia-component-id="modal-delete-service-account"]'
        );
        expect(modal).not.toBeNull();
      },
      { timeout: 15000 }
    );
    await delay(500);

    const modalBody = document.body;
    await waitFor(() => {
      expect(modalBody.textContent).toContain('data-pipeline');
      expect(modalBody.textContent).toContain('will be deleted');
    });

    const deleteButton = document.querySelector(
      '[data-ouia-component-id="deletemodal-confirm-button"]'
    ) as HTMLButtonElement;
    await waitFor(() => expect(deleteButton).not.toBeDisabled());
    await user.click(deleteButton);

    await waitForModalClose();

    await waitFor(
      () => {
        const deletedAccount = canvas.queryByText('data-pipeline');
        expect(deletedAccount).not.toBeInTheDocument();
      },
      { timeout: 15000 }
    );

    expect(canvas.getByText('my-api-service')).toBeInTheDocument();
    expect(canvas.getByText('monitoring-agent')).toBeInTheDocument();

    await waitFor(() => {
      const paginationTexts = canvas.getAllByText(/1 - 2/);
      expect(paginationTexts.length).toBeGreaterThan(0);
    });
  },
};

export const ResetServiceAccountJourney: Story = {
  parameters: {
    msw: {
      handlers: createStatefulHandlers(mockServiceAccounts),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const typingDelay =
      typeof process !== 'undefined' && process.env?.CI ? 0 : 50;
    const user = userEvent.setup({ delay: typingDelay });

    await waitForStoryReady(canvas);

    expect(canvas.getByText('my-api-service')).toBeInTheDocument();
    expect(canvas.getByText('monitoring-agent')).toBeInTheDocument();

    await waitFor(() => {
      const rows = canvas.getAllByRole('row');
      expect(rows.length).toBeGreaterThanOrEqual(3);
    });

    const myApiServiceCell = canvas.getByText('my-api-service');
    const myApiServiceRow = myApiServiceCell.closest('tr') as HTMLElement;
    expect(myApiServiceRow).not.toBeNull();

    const allButtons = myApiServiceRow.querySelectorAll('button');
    const kebabButton = allButtons[allButtons.length - 1] as HTMLButtonElement;
    expect(kebabButton).not.toBeNull();
    await user.click(kebabButton);
    await delay(300);

    const body = within(document.body);
    const resetMenuItem = await body.findByText(
      'Reset credentials',
      {},
      { timeout: 5000 }
    );
    await user.click(resetMenuItem);

    await waitFor(
      () => {
        const modal = document.querySelector(
          '[data-ouia-component-id="modal-reset-service-account"]'
        );
        expect(modal).not.toBeNull();
      },
      { timeout: 15000 }
    );
    await delay(500);

    await waitFor(() => {
      expect(document.body.textContent).toContain('my-api-service');
      expect(document.body.textContent).toContain('will be reset');
    });

    const resetButton = document.querySelector(
      '[data-ouia-component-id="resetmodal-confirm-button"]'
    ) as HTMLButtonElement;
    await waitFor(() => expect(resetButton).not.toBeDisabled());
    await user.click(resetButton);

    await waitFor(
      () => {
        const credentialsModalEl = document.getElementById(
          'modalCreateServiceAccountStep2'
        );
        expect(credentialsModalEl).not.toBeNull();
      },
      { timeout: 15000 }
    );
    await delay(500);

    const credentialsModal = document.getElementById(
      'modalCreateServiceAccountStep2'
    ) as HTMLElement;
    const credModal = within(credentialsModal);

    expect(
      credModal.getByText('Credentials successfully generated')
    ).toBeInTheDocument();
    expect(credModal.getByText('Client ID')).toBeInTheDocument();
    expect(credModal.getByText('Client secret')).toBeInTheDocument();

    const confirmCheckbox = document.querySelector(
      '[data-ouia-component-id="checkbox"]'
    ) as HTMLInputElement;
    await user.click(confirmCheckbox);

    const closeButton = document.querySelector(
      '[data-ouia-component-id="button-close"]'
    ) as HTMLButtonElement;
    await waitFor(() => expect(closeButton).not.toBeDisabled());
    await user.click(closeButton);

    await waitForModalClose();

    await waitFor(
      () => {
        expect(canvas.queryByText('my-api-service')).toBeInTheDocument();
        expect(canvas.queryByText('monitoring-agent')).toBeInTheDocument();
      },
      { timeout: 15000 }
    );
  },
};
