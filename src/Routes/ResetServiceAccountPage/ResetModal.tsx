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
});

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
  const intl = useIntl();
  return (
    <Modal
      id="modalCreateServiceAccountReset"
      variant={ModalVariant.medium}
      title={intl.formatMessage(messages.title)}
      isOpen={true}
      ouiaId={'modal-reset-service-account'}
      appendTo={appendTo}
      onClose={() => navigate('')}
    >
      <ModalHeader title={intl.formatMessage(messages.title)} />
      <ModalBody>
        {name ? (
          <Content>
            <FormattedMessage
              {...messages.body}
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
          isDisabled={isResetting || !name}
          onClick={onConfirm}
          ouiaId="resetmodal-confirm-button"
        >
          {intl.formatMessage(messages.resetButton)}
        </Button>
        <Button
          key="cancel"
          variant="link"
          component={(props) => <AppLink {...props} to={''} />}
          ouiaId="resetmodal-cancel-button"
        >
          {intl.formatMessage(messages.cancelButton)}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
