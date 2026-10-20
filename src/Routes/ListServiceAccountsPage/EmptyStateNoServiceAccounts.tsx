import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import type { FunctionComponent } from 'react';
import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import { AppLink } from '../../shared/AppLink';

const messages = defineMessages({
  title: {
    id: 'serviceAccounts.empty.title',
    defaultMessage: 'No service accounts yet',
  },
  tokenTitle: {
    id: 'serviceAccounts.empty.tokenTitle',
    defaultMessage: 'No service accounts or service access tokens yet',
  },
  body: {
    id: 'serviceAccounts.empty.body',
    defaultMessage: 'To get started, create a service account.',
  },
  tokenBody: {
    id: 'serviceAccounts.empty.tokenBody',
    defaultMessage:
      'Create a service account or a service access token to get started.',
  },
  createButton: {
    id: 'serviceAccounts.empty.createButton',
    defaultMessage: 'Create service account',
  },
  createTokenButton: {
    id: 'serviceAccounts.empty.createTokenButton',
    defaultMessage: 'Create service access token',
  },
});

export const EmptyStateNoServiceAccounts: FunctionComponent<{
  onCreateToken?: () => void;
}> = ({ onCreateToken }) => {
  return (
    <EmptyState
      headingLevel="h2"
      icon={PlusCircleIcon}
      titleText={
        <FormattedMessage
          {...(onCreateToken ? messages.tokenTitle : messages.title)}
        />
      }
      variant={EmptyStateVariant.xs}
    >
      <EmptyStateBody>
        <FormattedMessage
          {...(onCreateToken ? messages.tokenBody : messages.body)}
        />
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button
          ouiaId="button-create"
          variant="primary"
          component={(props) => <AppLink {...props} to={'create'} />}
        >
          <FormattedMessage {...messages.createButton} />
        </Button>
        {onCreateToken && (
          <Button
            ouiaId="button-create-token"
            variant="secondary"
            onClick={onCreateToken}
          >
            <FormattedMessage {...messages.createTokenButton} />
          </Button>
        )}
      </EmptyStateFooter>
    </EmptyState>
  );
};
