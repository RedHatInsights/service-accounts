import {
  Alert,
  Bullseye,
  Button,
  ButtonVariant,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';
import WarningModal from '@patternfly/react-component-groups/dist/dynamic/WarningModal';
import React, { VoidFunctionComponent } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { appendTo, mergeToBasename } from '../../shared/utils';
import { useNavigate } from 'react-router-dom';

const messages = defineMessages({
  title: {
    id: 'serviceAccounts.delete.title',
    defaultMessage: 'Delete service account?',
  },
  body: {
    id: 'serviceAccounts.delete.body',
    defaultMessage: '{name} will be deleted.',
  },
  loading: {
    id: 'serviceAccounts.delete.loading',
    defaultMessage: 'Loading service account information',
  },
  deleteButton: {
    id: 'serviceAccounts.delete.button.delete',
    defaultMessage: 'Delete',
  },
  cancelButton: {
    id: 'serviceAccounts.delete.button.cancel',
    defaultMessage: 'Cancel',
  },
  error: {
    id: 'serviceAccounts.delete.error',
    defaultMessage: 'The service account could not be deleted. Try again.',
  },
  satTitle: {
    id: 'serviceAccounts.token.delete.title',
    defaultMessage: 'Delete service access token?',
  },
  satBody: {
    id: 'serviceAccounts.token.delete.body',
    defaultMessage:
      'Deleting {name} will revoke this token, terminate any active sessions, and permanently remove it. This action cannot be undone.',
  },
  satError: {
    id: 'serviceAccounts.token.delete.error',
    defaultMessage: 'The service access token could not be deleted. Try again.',
  },
});

export type DeleteModalProps = {
  name: string | undefined;
  isDeleting: boolean;
  isError?: boolean;
  isSat?: boolean;
  onConfirm: () => void;
  onClose?: () => void;
};

export const DeleteModal: VoidFunctionComponent<DeleteModalProps> = ({
  name,
  isDeleting,
  isError = false,
  isSat = false,
  onConfirm,
  onClose,
}) => {
  const navigate = useNavigate();
  const intl = useIntl();

  const close = onClose || (() => navigate(mergeToBasename('')));

  if (isSat) {
    return (
      <WarningModal
        isOpen
        title={intl.formatMessage(messages.satTitle)}
        confirmButtonLabel={intl.formatMessage(messages.deleteButton)}
        cancelButtonLabel={intl.formatMessage(messages.cancelButton)}
        confirmButtonVariant={ButtonVariant.danger}
        onConfirm={() => name && !isDeleting && onConfirm()}
        onClose={() => !isDeleting && close()}
        appendTo={appendTo}
        ouiaId="modal-delete-service-access-token"
      >
        {isError && (
          <Alert
            variant="danger"
            title={intl.formatMessage(messages.satError)}
            className="pf-v6-u-mb-md"
          />
        )}
        {name ? (
          <FormattedMessage
            {...messages.satBody}
            values={{ name: <strong>{name}</strong> }}
          />
        ) : (
          <Spinner
            aria-label={intl.formatMessage(messages.loading)}
            size="lg"
          />
        )}
        {isDeleting && <Spinner size="sm" />}
      </WarningModal>
    );
  }

  return (
    <Modal
      id="modalCreateServiceAccountReset"
      variant={ModalVariant.medium}
      isOpen={true}
      ouiaId={'modal-delete-service-account'}
      appendTo={appendTo}
      onClose={close}
    >
      <ModalHeader
        titleIconVariant="warning"
        title={intl.formatMessage(messages.title)}
      />
      <ModalBody>
        {isError && (
          <Alert variant="danger" title={intl.formatMessage(messages.error)} />
        )}
        {name ? (
          <Content>
            <FormattedMessage
              {...messages.body}
              values={{ name: <strong>{name}</strong> }}
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
          variant="danger"
          isLoading={isDeleting}
          isDisabled={isDeleting || !name}
          onClick={onConfirm}
          ouiaId="deletemodal-confirm-button"
        >
          {intl.formatMessage(messages.deleteButton)}
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={close}
          ouiaId="deletemodal-cancel-button"
        >
          {intl.formatMessage(messages.cancelButton)}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
