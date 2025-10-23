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
import { AppLink } from '../../shared/AppLink';
import { appendTo } from '../../shared/utils';
import { useNavigate } from 'react-router-dom';

export type ResetModalProps = {
  name: string | undefined;
  isResetting: boolean;
  onConfirm: () => void;
};

export const ResetModal: VoidFunctionComponent<ResetModalProps> = ({
  name,
  isResetting,
  onConfirm,
}) => {
  const navigate = useNavigate();
  return (
    <Modal
      id="modalCreateServiceAccountReset"
      variant={ModalVariant.medium}
      title={'Reset service account credentials?'}
      isOpen={true}
      ouiaId={'modal-reset-service-account'}
      appendTo={appendTo}
      onClose={() => navigate('')}
    >
      <ModalHeader title="Reset service account credentials?" />
      <ModalBody>
        {name ? (
          <Content>
            Client secret for <strong>{name || <Spinner size={'sm'} />}</strong>{' '}
            with client ID will be reset.
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
          variant="primary"
          isLoading={isResetting}
          isDisabled={isResetting || !name}
          onClick={onConfirm}
          ouiaId="resetmodal-confirm-button"
        >
          Reset
        </Button>
        <Button
          key="cancel"
          variant="link"
          component={(props) => <AppLink {...props} to={''} />}
          ouiaId="resetmodal-cancel-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
