import React, { useEffect } from 'react';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

import { Routes } from './Routes';
import { IntlMessagesProvider, useChromeLocale } from './shared/i18n';

const App = () => {
  const { updateDocumentTitle } = useChrome();
  const locale = useChromeLocale();

  useEffect(() => {
    // You can use directly the name of your app
    updateDocumentTitle('Service Accounts');
  }, []);

  return (
    <IntlMessagesProvider locale={locale}>
      <NotificationsProvider />
      <Routes />
    </IntlMessagesProvider>
  );
};

export default App;
