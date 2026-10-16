import {
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
});

export type DeleteModalProps = {
  name: string | undefined;
  isDeleting: boolean;
  onConfirm: () => void;
};

export const DeleteModal: VoidFunctionComponent<DeleteModalProps> = ({
  name,
  isDeleting,
  onConfirm,
}) => {
  const navigate = useNavigate();
  const intl = useIntl();

  const onClose = () => navigate(mergeToBasename(''));

  return (
    <Modal
      id="modalCreateServiceAccountReset"
      variant={ModalVariant.medium}
      isOpen={true}
      ouiaId={'modal-delete-service-account'}
      appendTo={appendTo}
      onClose={onClose}
    >
      <ModalHeader
        titleIconVariant="warning"
        title={intl.formatMessage(messages.title)}
      />
      <ModalBody>
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
          onClick={onClose}
          ouiaId="deletemodal-cancel-button"
        >
          {intl.formatMessage(messages.cancelButton)}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
