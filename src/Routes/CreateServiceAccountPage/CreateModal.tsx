import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormHelperText,
  FormProps,
  HelperText,
  HelperTextItem,
  Icon,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Popover,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import React, { VoidFunctionComponent, useRef, useState } from 'react';
import { MessageDescriptor, defineMessages, useIntl } from 'react-intl';
import { appendTo, mergeToBasename } from '../../shared/utils';
import { useNavigate } from 'react-router-dom';

const FORM_ID = 'service-account-form';
const MAX_SERVICE_ACCOUNT_NAME_LENGTH = 32;
const MAX_SERVICE_ACCOUNT_DESC_LENGTH = 255;

const messages = defineMessages({
  title: {
    id: 'serviceAccounts.create.title',
    defaultMessage: 'Create a service account',
  },
  nameLabel: {
    id: 'serviceAccounts.create.nameLabel',
    defaultMessage: 'Service account name',
  },
  namePopoverBody: {
    id: 'serviceAccounts.create.namePopoverBody',
    defaultMessage:
      'Please provide a simple and short name of the service account you are creating',
  },
  nameAriaLabel: {
    id: 'serviceAccounts.create.nameAriaLabel',
    defaultMessage: 'name of service account',
  },
  descriptionLabel: {
    id: 'serviceAccounts.create.descriptionLabel',
    defaultMessage: 'Short description',
  },
  required: {
    id: 'serviceAccounts.create.validation.required',
    defaultMessage: 'Required',
  },
  invalidFormat: {
    id: 'serviceAccounts.create.validation.invalidFormat',
    defaultMessage:
      'Must start with a letter and end with a letter or number. Valid characters include lowercase letters from a to z, numbers from 0 to 9, and hyphens ( - ).',
  },
  invalidNameLength: {
    id: 'serviceAccounts.create.validation.invalidNameLength',
    defaultMessage: 'Cannot exceed {max} characters.',
  },
  invalidDescLength: {
    id: 'serviceAccounts.create.validation.invalidDescLength',
    defaultMessage: 'Cannot exceed {max} characters.',
  },
  createButton: {
    id: 'serviceAccounts.create.button.create',
    defaultMessage: 'Create',
  },
  cancelButton: {
    id: 'serviceAccounts.create.button.cancel',
    defaultMessage: 'Cancel',
  },
});

/** Maps validation results to their helper-text message descriptors. */
const HELPER_TEXT: Record<string, MessageDescriptor> = {
  'empty-name': messages.required,
  'empty-desc': messages.required,
  'invalid-format': messages.invalidFormat,
  'invalid-length': messages.invalidNameLength,
  'invalid-desc-length': messages.invalidDescLength,
};

export type CreateModalProps = {
  isCreating: boolean;
  onSubmit: (name: string, description: string) => void;
};

export const CreateModal: VoidFunctionComponent<CreateModalProps> = ({
  isCreating,
  onSubmit,
}) => {
  type Validate = 'default' | 'error' | 'success';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inputFieldBlur, setInputFieldBlur] = React.useState(false);
  const [nameValidated, setNameValidated] = React.useState<Validate>('default');
  const [descriptionValidated, setDescriptionValidated] =
    React.useState<Validate>('default');
  const [nameHelperText, setNameHelperText] = React.useState<string>('');
  const [descHelperText, setDescHelperText] = React.useState<string>('');

  const navigate = useNavigate();
  const submitButton = useRef();
  const intl = useIntl();

  const isNameValid = (name: string) => {
    if (name === undefined || name.trim() === '') {
      return 'empty-name' as const;
    } else if (!/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(name.trim())) {
      return 'invalid-format' as const;
    } else if (name.length > MAX_SERVICE_ACCOUNT_NAME_LENGTH) {
      return 'invalid-length' as const;
    } else {
      return 'valid' as const;
    }
  };

  React.useEffect(() => {
    const validationResult = isNameValid(name);
    if (validationResult === 'valid') {
      setNameValidated('success');
      setNameHelperText(intl.formatMessage(HELPER_TEXT['empty-name']));
    } else if (name !== '' || (name === '' && inputFieldBlur)) {
      setNameValidated('error');
      setNameHelperText(
        intl.formatMessage(HELPER_TEXT[isNameValid(name)], {
          max: MAX_SERVICE_ACCOUNT_NAME_LENGTH,
        })
      );
    }
  }, [name, inputFieldBlur, intl]);

  const isDescriptionValid = (description: string) => {
    if (description === undefined || description.trim() === '') {
      return 'empty-desc' as const;
    } else if (description.length > MAX_SERVICE_ACCOUNT_DESC_LENGTH) {
      return 'invalid-desc-length' as const;
    } else {
      return 'valid' as const;
    }
  };

  React.useEffect(() => {
    const validationResult = isDescriptionValid(description);
    if (validationResult === 'valid') {
      setDescriptionValidated('success');
      setDescHelperText('');
    } else if (description != '' || (description == '' && inputFieldBlur)) {
      setDescriptionValidated('error');
      setDescHelperText(
        intl.formatMessage(HELPER_TEXT[isDescriptionValid(description)], {
          max: MAX_SERVICE_ACCOUNT_DESC_LENGTH,
        })
      );
    }
  }, [description, intl]);

  const onBlurHandler = () => setInputFieldBlur(true);
  const onClose = () => navigate(mergeToBasename(''));

  const handleSubmit: FormProps['onSubmit'] = (ev) => {
    ev.preventDefault();
    if (nameValidated === 'success' || descriptionValidated === 'success') {
      onSubmit(name, description);
    }
  };

  return (
    <Modal
      id="modalCreateServiceAccountStep1"
      variant={ModalVariant.medium}
      title={intl.formatMessage(messages.title)}
      isOpen={true}
      onClose={onClose}
      ouiaId="modal-create-service-account"
      appendTo={appendTo}
    >
      <Form
        onSubmit={handleSubmit}
        id={FORM_ID}
        disabled={
          nameValidated != 'success' || descriptionValidated != 'success'
        }
      >
        <ModalHeader title={intl.formatMessage(messages.title)} />
        <ModalBody>
          <FormGroup
            isRequired
            label={intl.formatMessage(messages.nameLabel)}
            fieldId="name-field"
            labelHelp={
              <Popover
                headerContent={intl.formatMessage(messages.nameLabel)}
                bodyContent={intl.formatMessage(messages.namePopoverBody)}
              >
                <Button
                  aria-label={intl.formatMessage(messages.nameAriaLabel)}
                  aria-describedby="name-field"
                  className="pf-c-form__group-label-help"
                  type="button"
                  onClick={(e) => e.preventDefault()}
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
              isRequired
              type="text"
              id="text-input-name"
              name="text-input-name"
              value={name}
              onChange={(_event, val) => setName(val)}
              onBlur={onBlurHandler}
              validated={nameValidated}
              autoFocus={true}
              ouiaId="createmodal-text-input-name"
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={nameValidated}>
                  {nameHelperText}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
          <FormGroup
            isRequired
            label={intl.formatMessage(messages.descriptionLabel)}
            fieldId="short-description-field"
          >
            <TextInput
              isRequired
              type="text"
              id="text-input-description"
              name="text-input-description"
              value={description}
              onChange={(_event, val) => setDescription(val)}
              onBlur={onBlurHandler}
              validated={descriptionValidated}
              ouiaId="text-input-description"
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={descriptionValidated}>
                  {descHelperText}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            ouiaId="createmodal-create-button"
            variant={ButtonVariant.primary}
            type="submit"
            form={FORM_ID}
            ref={submitButton}
            isLoading={isCreating}
            isDisabled={
              nameValidated !== 'success' || descriptionValidated !== 'success'
            }
          >
            {intl.formatMessage(messages.createButton)}
          </Button>
          <Button
            ouiaId="createmodal-cancel-button"
            variant={ButtonVariant.link}
            onClick={onClose}
          >
            {intl.formatMessage(messages.cancelButton)}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};
