import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormHelperText,
  FormProps,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
  Popover,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import React, { VoidFunctionComponent, useRef, useState } from 'react';
import { appendTo, mergeToBasename } from '../../shared/utils';
import { useNavigate } from 'react-router-dom';

const FORM_ID = 'service-account-form';
const MAX_SERVICE_ACCOUNT_NAME_LENGTH = 32;
const MAX_SERVICE_ACCOUNT_DESC_LENGTH = 255;
const HELPER_TEXT: { [key: string]: string } = {
  'empty-name': 'Required',
  'empty-desc': 'Required',
  'invalid-format':
    'Must start with a letter and end with a letter or number. Valid characters include lowercase letters from a to z, numbers from 0 to 9, and hyphens ( - ).',
  'invalid-length': `Cannot exceed ${MAX_SERVICE_ACCOUNT_NAME_LENGTH} characters.`,
  'invalid-desc-length': `Cannot exceed ${MAX_SERVICE_ACCOUNT_DESC_LENGTH} characters.`,
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
      setNameHelperText(HELPER_TEXT['empty-name']);
    } else if (name !== '' || (name === '' && inputFieldBlur)) {
      setNameValidated('error');
      setNameHelperText(HELPER_TEXT[isNameValid(name)]);
    }
  }, [name, inputFieldBlur]);

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
      setDescHelperText(HELPER_TEXT[isDescriptionValid(description)]);
    }
  }, [description]);

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
      title="Create a service account"
      isOpen={true}
      onClose={onClose}
      ouiaId="modal-create-service-account"
      appendTo={appendTo}
      actions={[
        <Button
          ouiaId="createmodal-create-button"
          key="create"
          variant={ButtonVariant.primary}
          type="submit"
          form={FORM_ID}
          ref={submitButton}
          isLoading={isCreating}
          isDisabled={
            nameValidated !== 'success' || descriptionValidated !== 'success'
          }
        >
          Create
        </Button>,
        <Button
          ouiaId="createmodal-cancel-button"
          key="cancel"
          variant={ButtonVariant.link}
          onClick={onClose}
        >
          Cancel
        </Button>,
      ]}
    >
      <Form
        onSubmit={handleSubmit}
        id={FORM_ID}
        disabled={
          nameValidated != 'success' || descriptionValidated != 'success'
        }
      >
        <FormGroup
          isRequired
          label="Service account name"
          fieldId="name-field"
          labelIcon={
            <Popover
              headerContent="Service account name"
              bodyContent="Please provide a simple and short name of the service account you are creating"
            >
              <button
                aria-label="name of service account"
                aria-describedby="name-field"
                className="pf-c-form__group-label-help"
                type="button"
                onClick={(e) => e.preventDefault()}
              >
                <HelpIcon />
              </button>
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
          label="Short description"
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
      </Form>
    </Modal>
  );
};
