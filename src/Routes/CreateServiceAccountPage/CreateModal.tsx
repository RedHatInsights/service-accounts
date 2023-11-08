import {
  Button,
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
import React, { VoidFunctionComponent, useState } from 'react';
import { AppLink } from '../../shared/AppLink';
import { appendTo } from '../../shared/utils';

const FORM_ID = 'service-account-form';
const MAX_SERVICE_ACCOUNT_NAME_LENGTH = 32;
const HELPER_TEXT = {
  'empty-name':
    'Must start with a letter and end with a letter or number. Valid characters include lowercase letters from a to z, numbers from 0 to 9, and hyphens ( - ).',
  'invalid-format':
    'Must start with a letter and end with a letter or number. Valid characters include lowercase letters from a to z, numbers from 0 to 9, and hyphens ( - ).',
  'invalid-length': `Cannot exceed ${MAX_SERVICE_ACCOUNT_NAME_LENGTH} characters.`,
};

export type CreateModalProps = {
  isCreating: boolean;
  onSubmit: (name: string) => void;
};

export const CreateModal: VoidFunctionComponent<CreateModalProps> = ({
  isCreating,
  onSubmit,
}) => {
  const [validate, setValidate] = useState(false);
  const [name, setName] = useState('');

  const validity = (() => {
    //validate required field
    if (name === undefined || name.trim() === '') {
      return 'empty-name' as const;
    } else if (!/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(name.trim())) {
      return 'invalid-format' as const;
    }
    //validate max length
    else if (name.length > MAX_SERVICE_ACCOUNT_NAME_LENGTH) {
      return 'invalid-length' as const;
    }
    return 'valid' as const;
  })();

  const validated = validate && validity !== 'valid' ? 'error' : undefined;

  const doValidate = () => {
    setValidate(true);
  };

  const handleSubmit: FormProps['onSubmit'] = (ev) => {
    ev.preventDefault();
    setValidate(true);
    if (validity === 'valid') {
      onSubmit(name);
    }
  };

  return (
    <Modal
      id="modalCreateServiceAccountStep1"
      variant={ModalVariant.medium}
      title={'Create a service account'}
      isOpen={true}
      ouiaId={'modal-create-service-account'}
      appendTo={appendTo}
      showClose={false}
      actions={[
        <Button
          key="create"
          variant="primary"
          type={'submit'}
          form={FORM_ID}
          isLoading={isCreating}
          isDisabled={isCreating}
        >
          Create
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
      <Form onSubmit={handleSubmit} id={FORM_ID} disabled={!validity}>
        <FormGroup
          label={'Short description'}
          isRequired
          fieldId="short-description-field"
          labelIcon={
            <Popover
              headerContent={<div>Short description</div>}
              bodyContent={
                <div>
                  Please provide simple and short description of service account
                  you are creating
                </div>
              }
            >
              <button
                aria-label="short description of service account"
                aria-describedby="short-description-field"
                className="pf-c-form__group-label-help"
                type={'button'}
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
            id="text-input-short-description"
            name="text-input-short-description"
            value={name}
            onChange={(_event, val) => setName(val)}
            onBlur={doValidate}
            validated={validated}
            autoFocus={true}
            ouiaId={'text-input'}
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem>
                {validity !== 'valid'
                  ? HELPER_TEXT[validity]
                  : HELPER_TEXT['invalid-format']}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
      </Form>
    </Modal>
  );
};
