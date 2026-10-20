import {
  Alert,
  Button,
  Checkbox,
  ClipboardCopy,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@patternfly/react-core';
import React, { FunctionComponent, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { appendTo } from '../../shared/utils';

const messages = defineMessages({
  title: {
    id: 'serviceAccounts.token.create.title',
    defaultMessage: 'Create a service access token',
  },
  name: {
    id: 'serviceAccounts.token.create.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'serviceAccounts.token.create.description',
    defaultMessage: 'Short description',
  },
  create: {
    id: 'serviceAccounts.token.create.button',
    defaultMessage: 'Create',
  },
  cancel: {
    id: 'serviceAccounts.token.create.cancel',
    defaultMessage: 'Cancel',
  },
  error: {
    id: 'serviceAccounts.token.create.error',
    defaultMessage: 'The service access token could not be created. Try again.',
  },
  success: {
    id: 'serviceAccounts.token.credentials.success',
    defaultMessage: 'Service access token created',
  },
  oneTime: {
    id: 'serviceAccounts.token.credentials.oneTime',
    defaultMessage:
      'Copy the username and token now. The token will not be shown again after you close this window.',
  },
  username: {
    id: 'serviceAccounts.token.credentials.username',
    defaultMessage: 'Username',
  },
  token: {
    id: 'serviceAccounts.token.credentials.token',
    defaultMessage: 'Token',
  },
  acknowledge: {
    id: 'serviceAccounts.token.credentials.acknowledge',
    defaultMessage: 'I have copied the username and token',
  },
  close: {
    id: 'serviceAccounts.token.credentials.close',
    defaultMessage: 'Close',
  },
});

export type CreatedServiceAccessToken = {
  username: string;
  token: string;
};

export type CreateServiceAccessTokenFlowProps = {
  createToken: (
    name: string,
    description: string
  ) => Promise<CreatedServiceAccessToken>;
  onClose: () => void;
  onCreated?: () => void;
};

export const CreateServiceAccessTokenFlow: FunctionComponent<
  CreateServiceAccessTokenFlowProps
> = ({ createToken, onClose, onCreated }) => {
  const intl = useIntl();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [credentials, setCredentials] =
    useState<CreatedServiceAccessToken | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  const close = () => {
    setCredentials(null);
    if (credentials) onCreated?.();
    onClose();
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !description.trim() || isCreating) return;

    setIsCreating(true);
    setHasError(false);
    try {
      const result = await createToken(name.trim(), description.trim());
      if (!result.username || !result.token)
        throw new Error('Missing token credentials');
      setCredentials(result);
    } catch {
      setHasError(true);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isOpen
      variant="medium"
      aria-label={intl.formatMessage(
        credentials ? messages.success : messages.title
      )}
      appendTo={appendTo}
      onClose={credentials || isCreating ? undefined : close}
      ouiaId="modal-create-service-access-token"
    >
      {credentials ? (
        <>
          <ModalHeader title={intl.formatMessage(messages.success)} />
          <ModalBody>
            <p>{intl.formatMessage(messages.oneTime)}</p>
            <FormGroup
              label={intl.formatMessage(messages.username)}
              fieldId="sat-username"
            >
              <ClipboardCopy
                id="sat-username"
                isReadOnly
                textAriaLabel={intl.formatMessage(messages.username)}
              >
                {credentials.username}
              </ClipboardCopy>
            </FormGroup>
            <FormGroup
              label={intl.formatMessage(messages.token)}
              fieldId="sat-token"
            >
              <ClipboardCopy
                id="sat-token"
                isReadOnly
                textAriaLabel={intl.formatMessage(messages.token)}
              >
                {credentials.token}
              </ClipboardCopy>
            </FormGroup>
            <Checkbox
              id="sat-acknowledge"
              label={intl.formatMessage(messages.acknowledge)}
              isChecked={acknowledged}
              onChange={(_event, checked) => setAcknowledged(checked)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="primary"
              isDisabled={!acknowledged}
              onClick={close}
            >
              {intl.formatMessage(messages.close)}
            </Button>
          </ModalFooter>
        </>
      ) : (
        <Form onSubmit={submit}>
          <ModalHeader title={intl.formatMessage(messages.title)} />
          <ModalBody>
            {hasError && (
              <Alert
                variant="danger"
                title={intl.formatMessage(messages.error)}
              />
            )}
            <FormGroup
              isRequired
              label={intl.formatMessage(messages.name)}
              fieldId="sat-name"
            >
              <TextInput
                id="sat-name"
                value={name}
                onChange={(_event, value) => setName(value)}
                isRequired
                autoFocus
              />
            </FormGroup>
            <FormGroup
              isRequired
              label={intl.formatMessage(messages.description)}
              fieldId="sat-description"
            >
              <TextInput
                id="sat-description"
                value={description}
                onChange={(_event, value) => setDescription(value)}
                isRequired
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="primary"
              type="submit"
              isLoading={isCreating}
              isDisabled={!name.trim() || !description.trim() || isCreating}
            >
              {intl.formatMessage(messages.create)}
            </Button>
            <Button variant="link" onClick={close} isDisabled={isCreating}>
              {intl.formatMessage(messages.cancel)}
            </Button>
          </ModalFooter>
        </Form>
      )}
    </Modal>
  );
};
