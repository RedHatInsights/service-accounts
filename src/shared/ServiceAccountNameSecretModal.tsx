import {
  Bullseye,
  Button,
  Checkbox,
  ClipboardCopy,
  EmptyState,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  Modal,
  ModalVariant,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { KeyIcon } from '@patternfly/react-icons';
import React, { VoidFunctionComponent, useState } from 'react';
import { NewServiceAccount } from '../types';
import { AppLink } from './AppLink';
import { appendTo } from './utils';

export const ServiceAccountNameSecretModal: VoidFunctionComponent<{
  serviceAccount: NewServiceAccount;
}> = ({ serviceAccount }) => {
  const [confirmationCheckbox, confirm] = useState(false);
  return (
    <Modal
      id="modalCreateServiceAccountStep2"
      variant={ModalVariant.medium}
      aria-label={'Service account credentials'}
      isOpen={true}
      appendTo={appendTo}
      ouiaId={'modal-CredentialsSuccess'}
      showClose={false}
    >
      <EmptyState>
        <EmptyStateHeader
          titleText="Credentials successfully generated"
          icon={<EmptyStateIcon icon={KeyIcon} />}
          headingLevel="h2"
        />
        <EmptyStateFooter>
          <TextContent>
            <Text component={TextVariants.small} className="pf-u-mt-lg">
              Connect to the Kafka instance using this client ID and secret
            </Text>
          </TextContent>
          <InputGroup className="pf-u-mt-lg">
            <InputGroupText className="pf-u-text-nowrap">
              Client&nbsp;ID
            </InputGroupText>
            <InputGroupItem>
              <ClipboardCopy
                isReadOnly
                className="pf-u-w-100"
                data-testid="modalCredentials-copyClientID"
                data-ouia-component-id={'button-copy-clientID'}
                textAriaLabel={'Client ID'}
              >
                {serviceAccount.clientId}
              </ClipboardCopy>
            </InputGroupItem>
          </InputGroup>
          <InputGroup className="pf-u-mt-md">
            <InputGroupText className="pf-u-text-nowrap">
              Client&nbsp;secret
            </InputGroupText>
            <InputGroupItem>
              <ClipboardCopy
                isReadOnly
                className="pf-u-w-100"
                data-testid="modalCredentials-copyClientSecret"
                data-ouia-component-id={'button-copy-clientSecret'}
                textAriaLabel={'Client secret'}
              >
                {serviceAccount.secret}
              </ClipboardCopy>
            </InputGroupItem>
          </InputGroup>
          <TextContent>
            <Text component={TextVariants.small} className="pf-u-mt-lg">
              Make a copy of the client ID and secret to store in a safe place.
              The client secret won&#39;t appear again after closing this
              screen.
            </Text>
          </TextContent>
          <Bullseye className="pf-u-mt-lg">
            <Checkbox
              label={'I have copied the client ID and secret'}
              isChecked={confirmationCheckbox}
              onChange={(_event, val) => confirm(val)}
              id="check-1"
              name="check1"
              ouiaId={'checkbox'}
            />
          </Bullseye>
          <Button
            variant="primary"
            isDisabled={!confirmationCheckbox}
            data-testid="modalCredentials-buttonClose"
            ouiaId={'button-close'}
            component={(props) => <AppLink {...props} to={''} />}
          >
            Close
          </Button>
        </EmptyStateFooter>
      </EmptyState>
    </Modal>
  );
};
