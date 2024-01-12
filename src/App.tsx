import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';

import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import React, { Fragment, useEffect, useState } from 'react';
import { Reducer } from 'redux';
import './App.scss';

import { Routes } from './Routes';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const [isOrgAdmin, setIsOrgAdmin] = useState<boolean | undefined>();
  const { updateDocumentTitle, auth } = useChrome();
  const navigate = useNavigate();

  useEffect(() => {
    const registry = getRegistry();
    registry.register({ notifications: notificationsReducer as Reducer });
    // You can use directly the name of your app
    updateDocumentTitle('Service Accounts');
    const getUser = () => auth.getUser();
    getUser().then((data) => {
      setIsOrgAdmin(data?.identity.user?.is_org_admin);
    });
  }, []);

  if (isOrgAdmin === undefined) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (!isOrgAdmin) {
    navigate('/iam/my-user-access');
  }

  return (
    <Fragment>
      <NotificationsPortal />
      <Routes />
    </Fragment>
  );
};

export default App;
