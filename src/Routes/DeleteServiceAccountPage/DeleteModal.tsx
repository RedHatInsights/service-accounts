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
      isOpen={true}
      ouiaId={'modal-reset-service-account'}
      appendTo={appendTo}
      onClose={onClose}
    >
      <ModalHeader titleIconVariant="warning" title="Delete service account?" />
      <ModalBody>
        {name ? (
          <Content>
            <strong>{name}</strong> will be deleted.
          </Content>
        ) : (
          <Bullseye>
            <Spinner
              aria-label={'Loading service account information'}
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
        >
          Delete
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
