import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
} from '@patternfly/react-core';
import React, { FunctionComponent, useState } from 'react';
import { useFlag } from '@unleash/proxy-client-react';
import { defineMessages, useIntl } from 'react-intl';
import { AppLink } from '../../shared/AppLink';

const messages = defineMessages({
  createNew: {
    id: 'serviceAccounts.createNew',
    defaultMessage: 'Create new',
  },
  serviceAccount: {
    id: 'serviceAccounts.createNew.serviceAccount',
    defaultMessage: 'Service account',
  },
  serviceAccessToken: {
    id: 'serviceAccounts.createNew.serviceAccessToken',
    defaultMessage: 'Service access token',
  },
  createServiceAccount: {
    id: 'serviceAccounts.table.createButton',
    defaultMessage: 'Create service account',
  },
});

export const CreateCredentialButton: FunctionComponent<{
  // shortcut: Keep SAT creation hidden until CIAM-12575 defines the API contract and the permission guard is ready.
  onCreateToken?: () => void;
}> = ({ onCreateToken }) => {
  const intl = useIntl();
  const isSatEnabled = useFlag('platform.service-accounts.sat');
  const [isOpen, setIsOpen] = useState(false);

  if (!isSatEnabled || !onCreateToken) {
    return (
      <Button
        ouiaId="service-accounts-table-create-button"
        component={(props) => <AppLink {...props} to="create" />}
      >
        {intl.formatMessage(messages.createServiceAccount)}
      </Button>
    );
  }

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={() => setIsOpen(false)}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          variant="primary"
          isExpanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          ouiaId="service-accounts-create-new-button"
        >
          {intl.formatMessage(messages.createNew)}
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem
          key="service-account"
          component={(props) => <AppLink {...props} to="create" />}
        >
          {intl.formatMessage(messages.serviceAccount)}
        </DropdownItem>
        <DropdownItem key="service-access-token" onClick={onCreateToken}>
          {intl.formatMessage(messages.serviceAccessToken)}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
