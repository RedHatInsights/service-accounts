import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({ updateDocumentTitle: jest.fn() }),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/NotificationPortal',
  () => ({
    __esModule: true,
    default: () => null,
  })
);

jest.mock('./Routes', () => {
  const React = jest.requireActual('react');
  const { useAddNotification, useNotifications } = jest.requireActual(
    '@redhat-cloud-services/frontend-components-notifications/hooks/useNotifications'
  );

  return {
    Routes: () => {
      const addNotification = useAddNotification();
      const { notifications } = useNotifications();
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'button',
          {
            onClick: () =>
              addNotification({
                variant: 'info',
                title: 'Service access token "build-token" has been deleted.',
              }),
          },
          'Notify'
        ),
        notifications.map(({ id, title }: { id: string; title: string }) =>
          React.createElement('div', { key: id }, title)
        )
      );
    },
  };
});

test('route notifications reach the shared provider', async () => {
  Object.defineProperty(window, 'crypto', {
    configurable: true,
    value: { randomUUID: () => 'test-id' },
  });

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Notify' }));

  expect(
    await screen.findByText(
      'Service access token "build-token" has been deleted.'
    )
  ).toBeInTheDocument();
});
