import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { createServiceAccount } from '../../shared/createServiceAccount';
import { ServiceAccountNameSecretModal } from '../../shared/ServiceAccountNameSecretModal';
import { CreateModal, CreateModalProps } from './CreateModal';

const CreateServiceAccountPage = () => {
  const { appAction } = useChrome();

  useEffect(() => {
    appAction('create-service-account-page');
  }, []);

  const queryClient = useQueryClient();
  const { auth, getEnvironmentDetails } = useChrome();

  const mutation = useMutation({
    mutationFn: createServiceAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-accounts'] });
    },
  });
  const onSubmit: CreateModalProps['onSubmit'] = async (name, description) => {
    const env = getEnvironmentDetails();
    const token = await auth.getToken();
    mutation.mutate({
      name,
      description,
      token: token as string,
      sso: env?.sso as string,
    });
  };

  return mutation.data === undefined ? (
    <CreateModal isCreating={mutation.isLoading} onSubmit={onSubmit} />
  ) : (
    <ServiceAccountNameSecretModal serviceAccount={mutation.data} />
  );
};

export default CreateServiceAccountPage;
