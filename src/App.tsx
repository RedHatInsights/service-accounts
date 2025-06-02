import React, { Fragment, useEffect } from 'react';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

import { Routes } from './Routes';

const App = () => {
  const { updateDocumentTitle } = useChrome();

  useEffect(() => {
    // You can use directly the name of your app
    updateDocumentTitle('Service Accounts');
  }, []);

  return (
    <Fragment>
      <NotificationsProvider />
      <Routes />
    </Fragment>
  );
};

export default App;
