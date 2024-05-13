import {
  Bullseye,
  Button,
  Modal,
  ModalVariant,
  Spinner,
  TextContent,
} from '@patternfly/react-core';
import React, { VoidFunctionComponent } from 'react';
import { appendTo, mergeToBasename } from '../../shared/utils';
import { useNavigate } from 'react-router-dom';

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

  const onClose = () => navigate(mergeToBasename(''));

  return (
    <Modal
      id="modalCreateServiceAccountReset"
      variant={ModalVariant.medium}
      title={'Delete service account?'}
      titleIconVariant={'warning'}
      isOpen={true}
      ouiaId={'modal-reset-service-account'}
      appendTo={appendTo}
      onClose={onClose}
      actions={[
        <Button
          key="create"
          variant="danger"
          isLoading={isDeleting}
          isDisabled={isDeleting || !name}
          onClick={onConfirm}
        >
          Delete
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]}
    >
      {name ? (
        <TextContent>
          <strong>{name}</strong> will be deleted.
        </TextContent>
      ) : (
        <Bullseye>
          <Spinner
            aria-label={'Loading service account information'}
            size={'xl'}
          />
        </Bullseye>
      )}
    </Modal>
  );
};
