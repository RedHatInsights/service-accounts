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
  return (
    <Modal
      id="modalCreateServiceAccountReset"
      variant={ModalVariant.medium}
      title={'Reset service account credentials?'}
      isOpen={true}
      ouiaId={'modal-reset-service-account'}
      appendTo={appendTo}
      showClose={false}
      actions={[
        <Button
          key="create"
          variant="primary"
          isLoading={isResetting}
          isDisabled={isResetting || !name}
          onClick={onConfirm}
        >
          Reset
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
          Client secret for <strong>{name || <Spinner size={'sm'} />}</strong>{' '}
          with client ID will be reset.
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
