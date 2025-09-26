import {
  Bullseye,
  Button,
  ButtonVariant,
  Checkbox,
  ClipboardCopy,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateFooter,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  Modal,
  ModalBody,
  ModalVariant,
} from '@patternfly/react-core';
import { KeyIcon } from '@patternfly/react-icons';
import ErrorState from '@patternfly/react-component-groups/dist/dynamic/ErrorState';
import React, { VoidFunctionComponent, useState } from 'react';
import { NewServiceAccount } from '../types';
import { AppLink } from './AppLink';
import { appendTo } from './utils';
import { useNavigate } from 'react-router-dom';

export const ServiceAccountNameSecretModal: VoidFunctionComponent<{
  serviceAccount: NewServiceAccount;
}> = ({ serviceAccount }) => {
  const [confirmationCheckbox, confirm] = useState(false);
  const navigate = useNavigate();
  return (
    <Modal
      id="modalCreateServiceAccountStep2"
      variant={ModalVariant.medium}
      aria-label="Service account credentials"
      isOpen
      appendTo={appendTo}
      ouiaId="modal-Credentials"
      onClose={() => navigate('')}
    >
      <ModalBody>
        {serviceAccount.error ? (
          <ErrorState
            titleText="Credentials were not generated successfully"
            bodyText={serviceAccount.error_description}
            customFooter={
              <Button
                variant={ButtonVariant.primary}
                data-testid="modalCredentialsError-buttonClose"
                ouiaId="button-close"
                component={(props) => <AppLink {...props} to="" />}
              >
                Close
              </Button>
            }
          />
        ) : (
          <EmptyState
            headingLevel="h2"
            icon={KeyIcon}
            titleText="Credentials successfully generated"
          >
            <EmptyStateFooter>
              <Content>
                <Content
                  component={ContentVariants.small}
                  className="pf-u-mt-lg"
                >
                  Connect to Red Hat cloud services or APIs using this client ID
                  and secret
                </Content>
              </Content>
              <InputGroup className="pf-u-mt-lg">
                <InputGroupText
                  className="pf-u-text-nowrap pf-u-flex-shrink-0"
                  style={{ minWidth: '120px', textAlign: 'left' }}
                >
                  Client ID
                </InputGroupText>
                <InputGroupItem className="pf-v6-u-w-100">
                  <ClipboardCopy
                    className="pf-v6-u-w-100"
                    isReadOnly
                    data-testid="modalCredentials-copyClientID"
                    data-ouia-component-id="button-copy-clientID"
                    textAriaLabel="Client ID"
                  >
                    {serviceAccount.clientId}
                  </ClipboardCopy>
                </InputGroupItem>
              </InputGroup>
              <InputGroup className="pf-u-mt-md">
                <InputGroupText
                  className="pf-u-text-nowrap pf-u-flex-shrink-0"
                  style={{ minWidth: '120px', textAlign: 'left' }}
                >
                  Client secret
                </InputGroupText>
                <InputGroupItem className="pf-v6-u-w-100">
                  <ClipboardCopy
                    isReadOnly
                    className="pf-v6-u-w-100"
                    data-testid="modalCredentials-copyClientSecret"
                    data-ouia-component-id="button-copy-clientSecret"
                    textAriaLabel="Client secret"
                  >
                    {serviceAccount.secret}
                  </ClipboardCopy>
                </InputGroupItem>
              </InputGroup>
              <Content>
                <Content
                  component={ContentVariants.small}
                  className="pf-u-mt-lg"
                >
                  Make a copy of the client ID and secret to store in a safe
                  place. The client secret won&#39;t appear again after closing
                  this screen.
                </Content>
              </Content>
              <Bullseye className="pf-u-mt-lg">
                <Checkbox
                  label="I have copied the client ID and secret"
                  isChecked={confirmationCheckbox}
                  onChange={(_event, val) => confirm(val)}
                  id="check-1"
                  name="check1"
                  ouiaId="checkbox"
                />
              </Bullseye>
              <Button
                variant={ButtonVariant.primary}
                isDisabled={!confirmationCheckbox}
                data-testid="modalCredentials-buttonClose"
                ouiaId="button-close"
                component={(props) => <AppLink {...props} to="" />}
              >
                Close
              </Button>
            </EmptyStateFooter>
          </EmptyState>
        )}
      </ModalBody>
    </Modal>
  );
};
