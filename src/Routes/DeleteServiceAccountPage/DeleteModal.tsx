import {
  Bullseye,
  Button,
  Modal,
  ModalVariant,
  Spinner,
  TextContent,
} from '@patternfly/react-core';
import React, { VoidFunctionComponent } from 'react';
import { AppLink } from '../../shared/AppLink';
import { appendTo } from '../../shared/utils';

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
  return (
    <Modal
      id="modalCreateServiceAccountReset"
      variant={ModalVariant.medium}
      title={'Delete service account?'}
      titleIconVariant={'warning'}
      isOpen={true}
      ouiaId={'modal-reset-service-account'}
      appendTo={appendTo}
      showClose={false}
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
        <Button
          key="cancel"
          variant="link"
          component={(props) => <AppLink {...props} to={''} />}
        >
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
