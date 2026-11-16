import {
  Alert,
  Button,
  Form,
  FormGroup,
  Icon,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Popover,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import React, { FunctionComponent, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ServiceAccessTokenUnavailableError } from '../../shared/createServiceAccessToken';
import { ServiceAccountNameSecretModal } from '../../shared/ServiceAccountNameSecretModal';
import { appendTo } from '../../shared/utils';

const messages = defineMessages({
  title: {
    id: 'serviceAccounts.token.create.title',
    defaultMessage: 'Create a Service Access Token',
  },
  name: {
    id: 'serviceAccounts.token.create.name',
    defaultMessage: 'Service access token name',
  },
  namePopoverBody: {
    id: 'serviceAccounts.token.create.namePopoverBody',
    defaultMessage:
      'Please provide a simple and short name for the service access token you are creating',
  },
  nameAriaLabel: {
    id: 'serviceAccounts.token.create.nameAriaLabel',
    defaultMessage: 'name of service access token',
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
  unavailable: {
    id: 'serviceAccounts.token.create.unavailable',
    defaultMessage:
      'Service access token creation is not available in this environment yet. Try again after the SSO update is deployed.',
  },
  unexpectedResponse: {
    id: 'serviceAccounts.token.create.unexpectedResponse',
    defaultMessage:
      'The server did not confirm a service access token. Check the service account list before trying again.',
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
  const [error, setError] = useState<
    'request' | 'unexpected' | 'unavailable' | null
  >(null);
  const [credentials, setCredentials] =
    useState<CreatedServiceAccessToken | null>(null);

  const close = () => {
    setCredentials(null);
    if (credentials) onCreated?.();
    onClose();
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !description.trim() || isCreating) return;

    setIsCreating(true);
    setError(null);
    try {
      const result = await createToken(name.trim(), description.trim());
      if (!result.username || !result.token)
        throw new Error('Missing token credentials');
      setCredentials(result);
    } catch (error) {
      setError(
        error instanceof ServiceAccessTokenUnavailableError
          ? 'unavailable'
          : error instanceof Error &&
            error.message === 'Unexpected service access token response'
          ? 'unexpected'
          : 'request'
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (credentials) {
    return (
      <ServiceAccountNameSecretModal
        serviceAccessToken={credentials}
        onClose={close}
      />
    );
  }

  return (
    <Modal
      isOpen
      variant="medium"
      aria-label={intl.formatMessage(messages.title)}
      appendTo={appendTo}
      onClose={isCreating ? undefined : close}
      ouiaId="modal-create-service-access-token"
    >
      <Form onSubmit={submit}>
        <ModalHeader title={intl.formatMessage(messages.title)} />
        <ModalBody>
          {error && (
            <Alert
              variant="danger"
              title={intl.formatMessage(
                error === 'unavailable'
                  ? messages.unavailable
                  : error === 'unexpected'
                  ? messages.unexpectedResponse
                  : messages.error
              )}
            />
          )}
          <FormGroup
            isRequired
            label={intl.formatMessage(messages.name)}
            fieldId="sat-name"
            labelHelp={
              <Popover
                headerContent={intl.formatMessage(messages.name)}
                bodyContent={intl.formatMessage(messages.namePopoverBody)}
              >
                <Button
                  aria-label={intl.formatMessage(messages.nameAriaLabel)}
                  aria-describedby="sat-name"
                  className="pf-c-form__group-label-help"
                  type="button"
                  onClick={(event) => event.preventDefault()}
                  variant="plain"
                >
                  <Icon>
                    <HelpIcon />
                  </Icon>
                </Button>
              </Popover>
            }
          >
            <TextInput
              id="sat-name"
              value={name}
              onChange={(_event, value) => setName(value)}
              isRequired
              maxLength={50}
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
              maxLength={255}
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
    </Modal>
  );
};
