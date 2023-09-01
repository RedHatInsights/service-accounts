import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import type { VoidFunctionComponent } from 'react';
import React from 'react';
import { AppLink } from '../../shared/AppLink';

export const EmptyStateNoServiceAccounts: VoidFunctionComponent = () => {
  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateHeader
        titleText="No service accounts yet"
        icon={<EmptyStateIcon icon={PlusCircleIcon} />}
        headingLevel="h2"
      />
      <EmptyStateBody>To get started, create a service account.</EmptyStateBody>
      <EmptyStateFooter>
        <Button
          ouiaId="button-create"
          variant="primary"
          component={(props) => <AppLink {...props} to={'create'} />}
        >
          Create service account
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};
