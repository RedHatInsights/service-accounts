import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';

import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import React, { Fragment, useEffect } from 'react';
import { Reducer } from 'redux';
import './App.scss';

import { Routes } from './Routes';

const App = () => {
  const { updateDocumentTitle } = useChrome();

  useEffect(() => {
    const registry = getRegistry();
    registry.register({ notifications: notificationsReducer as Reducer });
    // You can use directly the name of your app
    updateDocumentTitle('Service Accounts');
  }, []);

  return (
    <Fragment>
      <NotificationsPortal />
      <Routes />
    </Fragment>
  );
};

export default App;
