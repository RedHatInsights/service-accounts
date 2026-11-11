import {
  Alert,
  Bullseye,
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';
import React, { VoidFunctionComponent } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { AppLink } from '../../shared/AppLink';
import { appendTo } from '../../shared/utils';
import { useNavigate } from 'react-router-dom';

const messages = defineMessages({
  title: {
    id: 'serviceAccounts.reset.title',
    defaultMessage: 'Reset service account credentials?',
  },
  body: {
    id: 'serviceAccounts.reset.body',
    defaultMessage: 'Client secret for {name} with client ID will be reset.',
  },
  loading: {
    id: 'serviceAccounts.reset.loading',
    defaultMessage: 'Loading service account information',
  },
  resetButton: {
    id: 'serviceAccounts.reset.button.reset',
    defaultMessage: 'Reset',
  },
  cancelButton: {
    id: 'serviceAccounts.reset.button.cancel',
    defaultMessage: 'Cancel',
  },
  satTitle: {
    id: 'serviceAccounts.token.reset.title',
    defaultMessage: 'Reset service access token credentials?',
  },
  satBody: {
    id: 'serviceAccounts.token.reset.body',
    defaultMessage:
      'Resetting the token for {name} will make the current token stop working. The username will stay the same.',
  },
  satError: {
    id: 'serviceAccounts.token.reset.error',
    defaultMessage: 'The service access token could not be reset. Try again.',
  },
  satUnexpectedResponse: {
    id: 'serviceAccounts.token.reset.unexpectedResponse',
    defaultMessage:
      'The server did not confirm the new token credentials. The old token may no longer work. Check the service account list before trying again.',
  },
  satMissingUsername: {
    id: 'serviceAccounts.token.reset.missingUsername',
    defaultMessage:
      'Reset is unavailable because the service access token username could not be confirmed.',
  },
});

export type ResetModalProps = {
  name: string | undefined;
  isResetting: boolean;
  onConfirm: () => void;
  isSat?: boolean;
  satError?: 'request' | 'unexpected' | 'missingUsername';
};

export const ResetModal: VoidFunctionComponent<ResetModalProps> = ({
  name,
  isResetting,
  onConfirm,
  isSat = false,
  satError,
}) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const title = intl.formatMessage(isSat ? messages.satTitle : messages.title);
  return (
    <Modal
      variant={ModalVariant.medium}
      aria-label={title}
      isOpen={true}
      ouiaId={'modal-reset-service-account'}
      appendTo={appendTo}
      onClose={isSat && isResetting ? undefined : () => navigate('')}
    >
      <ModalHeader title={title} />
      <ModalBody>
        {isSat && satError && (
          <Alert
            variant="danger"
            title={intl.formatMessage(
              satError === 'unexpected'
                ? messages.satUnexpectedResponse
                : satError === 'missingUsername'
                ? messages.satMissingUsername
                : messages.satError
            )}
          />
        )}
        {name ? (
          <Content>
            <FormattedMessage
              {...(isSat ? messages.satBody : messages.body)}
              values={{
                name: <strong>{name || <Spinner size={'sm'} />}</strong>,
              }}
            />
          </Content>
        ) : (
          <Bullseye>
            <Spinner
              aria-label={intl.formatMessage(messages.loading)}
              size={'xl'}
            />
          </Bullseye>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          key="create"
          variant="primary"
          isLoading={isResetting}
          isDisabled={isResetting || !name || satError === 'missingUsername'}
          onClick={onConfirm}
          ouiaId="resetmodal-confirm-button"
        >
          {intl.formatMessage(messages.resetButton)}
        </Button>
        <Button
          key="cancel"
          variant="link"
          component={(props) => <AppLink {...props} to={''} />}
          isDisabled={isSat && isResetting}
          ouiaId="resetmodal-cancel-button"
        >
          {intl.formatMessage(messages.cancelButton)}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
