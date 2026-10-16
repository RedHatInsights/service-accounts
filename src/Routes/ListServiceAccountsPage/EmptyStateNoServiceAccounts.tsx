import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import type { VoidFunctionComponent } from 'react';
import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import { AppLink } from '../../shared/AppLink';

const messages = defineMessages({
  title: {
    id: 'serviceAccounts.empty.title',
    defaultMessage: 'No service accounts yet',
  },
  body: {
    id: 'serviceAccounts.empty.body',
    defaultMessage: 'To get started, create a service account.',
  },
  createButton: {
    id: 'serviceAccounts.empty.createButton',
    defaultMessage: 'Create service account',
  },
});

export const EmptyStateNoServiceAccounts: VoidFunctionComponent = () => {
  return (
    <EmptyState
      headingLevel="h2"
      icon={PlusCircleIcon}
      titleText={<FormattedMessage {...messages.title} />}
      variant={EmptyStateVariant.xs}
    >
      <EmptyStateBody>
        <FormattedMessage {...messages.body} />
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button
          ouiaId="button-create"
          variant="primary"
          component={(props) => <AppLink {...props} to={'create'} />}
        >
          <FormattedMessage {...messages.createButton} />
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};
