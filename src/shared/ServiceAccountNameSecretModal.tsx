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
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { NewServiceAccount } from '../types';
import { AppLink } from './AppLink';
import { appendTo } from './utils';

const messages = defineMessages({
  modalAriaLabel: {
    id: 'serviceAccounts.credentials.ariaLabel',
    defaultMessage: 'Service account credentials',
  },
  satModalAriaLabel: {
    id: 'serviceAccounts.token.credentials.ariaLabel',
    defaultMessage: 'Service access token credentials',
  },
  errorTitle: {
    id: 'serviceAccounts.credentials.errorTitle',
    defaultMessage: 'Credentials were not generated successfully',
  },
  close: {
    id: 'serviceAccounts.credentials.button.close',
    defaultMessage: 'Close',
  },
  successTitle: {
    id: 'serviceAccounts.credentials.successTitle',
    defaultMessage: 'Credentials successfully generated',
  },
  connectBody: {
    id: 'serviceAccounts.credentials.connectBody',
    defaultMessage:
      'Connect to Red Hat cloud services or APIs using this client ID and secret',
  },
  satConnectBody: {
    id: 'serviceAccounts.token.credentials.connectBody',
    defaultMessage:
      'Connect to Red Hat cloud services or APIs using this username and token',
  },
  clientId: {
    id: 'serviceAccounts.credentials.clientId',
    defaultMessage: 'Client ID',
  },
  clientSecret: {
    id: 'serviceAccounts.credentials.clientSecret',
    defaultMessage: 'Client secret',
  },
  username: {
    id: 'serviceAccounts.token.credentials.username',
    defaultMessage: 'Username',
  },
  token: {
    id: 'serviceAccounts.token.credentials.token',
    defaultMessage: 'Token',
  },
  safeCopyBody: {
    id: 'serviceAccounts.credentials.safeCopyBody',
    defaultMessage:
      'Make a copy of the client ID and secret to store in a safe place. The client secret won’t appear again after closing this screen.',
  },
  satSafeCopyBody: {
    id: 'serviceAccounts.token.credentials.oneTime',
    defaultMessage:
      'Copy the username and token now. The token will not be shown again after you close this window.',
  },
  confirmCheckbox: {
    id: 'serviceAccounts.credentials.confirmCheckbox',
    defaultMessage: 'I have copied the client ID and secret',
  },
  satConfirmCheckbox: {
    id: 'serviceAccounts.token.credentials.acknowledge',
    defaultMessage: 'I have copied the username and token',
  },
});

type Props =
  | {
      serviceAccount: NewServiceAccount;
      serviceAccessToken?: never;
      onClose?: never;
    }
  | {
      serviceAccount?: never;
      serviceAccessToken: { username: string; token: string };
      onClose: () => void;
    };

export const ServiceAccountNameSecretModal: VoidFunctionComponent<Props> = ({
  serviceAccount,
  serviceAccessToken,
  onClose,
}) => {
  const [confirmationCheckbox, confirm] = useState(false);
  const intl = useIntl();
  const isSat = !!serviceAccessToken;
  const identifier = serviceAccessToken
    ? serviceAccessToken.username
    : serviceAccount!.clientId;
  const secret = serviceAccessToken
    ? serviceAccessToken.token
    : serviceAccount!.secret;
  const identifierLabel = intl.formatMessage(
    isSat ? messages.username : messages.clientId
  );
  const secretLabel = intl.formatMessage(
    isSat ? messages.token : messages.clientSecret
  );
  return (
    <Modal
      id="modalCreateServiceAccountStep2"
      variant={ModalVariant.medium}
      aria-label={intl.formatMessage(
        isSat ? messages.satModalAriaLabel : messages.modalAriaLabel
      )}
      isOpen
      appendTo={appendTo}
      ouiaId="modal-Credentials"
    >
      <ModalBody>
        {serviceAccount?.error ? (
          <ErrorState
            titleText={intl.formatMessage(messages.errorTitle)}
            bodyText={serviceAccount.error_description}
            customFooter={
              <Button
                variant={ButtonVariant.primary}
                data-testid="modalCredentialsError-buttonClose"
                ouiaId="button-close"
                component={
                  onClose ? undefined : (props) => <AppLink {...props} to="" />
                }
                onClick={onClose}
              >
                {intl.formatMessage(messages.close)}
              </Button>
            }
          />
        ) : (
          <EmptyState
            headingLevel="h2"
            icon={KeyIcon}
            titleText={intl.formatMessage(messages.successTitle)}
          >
            <EmptyStateFooter>
              <Content>
                <Content
                  component={ContentVariants.small}
                  className="pf-u-mt-lg"
                >
                  <FormattedMessage
                    {...(isSat
                      ? messages.satConnectBody
                      : messages.connectBody)}
                  />
                </Content>
              </Content>
              <InputGroup className="pf-u-mt-lg">
                <InputGroupText
                  className="pf-u-text-nowrap pf-u-flex-shrink-0"
                  style={{ minWidth: '120px', textAlign: 'left' }}
                >
                  {identifierLabel}
                </InputGroupText>
                <InputGroupItem className="pf-v6-u-w-100">
                  <ClipboardCopy
                    className="pf-v6-u-w-100"
                    isReadOnly
                    data-testid="modalCredentials-copyClientID"
                    ouiaId="button-copy-clientID"
                    textAriaLabel={identifierLabel}
                  >
                    {identifier}
                  </ClipboardCopy>
                </InputGroupItem>
              </InputGroup>
              <InputGroup className="pf-u-mt-md">
                <InputGroupText
                  className="pf-u-text-nowrap pf-u-flex-shrink-0"
                  style={{ minWidth: '120px', textAlign: 'left' }}
                >
                  {secretLabel}
                </InputGroupText>
                <InputGroupItem className="pf-v6-u-w-100">
                  <ClipboardCopy
                    isReadOnly
                    className="pf-v6-u-w-100"
                    data-testid="modalCredentials-copyClientSecret"
                    ouiaId="button-copy-clientSecret"
                    textAriaLabel={secretLabel}
                  >
                    {secret}
                  </ClipboardCopy>
                </InputGroupItem>
              </InputGroup>
              <Content>
                <Content
                  component={ContentVariants.small}
                  className="pf-u-mt-lg"
                >
                  <FormattedMessage
                    {...(isSat
                      ? messages.satSafeCopyBody
                      : messages.safeCopyBody)}
                  />
                </Content>
              </Content>
              <Bullseye className="pf-u-mt-lg">
                <Checkbox
                  label={intl.formatMessage(
                    isSat
                      ? messages.satConfirmCheckbox
                      : messages.confirmCheckbox
                  )}
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
                component={
                  onClose ? undefined : (props) => <AppLink {...props} to="" />
                }
                onClick={onClose}
              >
                {intl.formatMessage(messages.close)}
              </Button>
            </EmptyStateFooter>
          </EmptyState>
        )}
      </ModalBody>
    </Modal>
  );
};
