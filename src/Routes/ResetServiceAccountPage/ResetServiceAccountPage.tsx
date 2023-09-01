import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchServiceAccount } from '../../shared/fetchServiceAccount';
import { resetServiceAccount } from '../../shared/resetServiceAccount';
import { ServiceAccountNameSecretModal } from '../../shared/ServiceAccountNameSecretModal';
import { mergeToBasename } from '../../shared/utils';
import { ResetModal, ResetModalProps } from './ResetModal';

const ResetServiceAccountPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { appAction } = useChrome();
  const navigate = useNavigate();
  const { auth, getEnvironmentDetails } = useChrome();

  const query = useQuery({
    queryKey: ['service-account', clientId],
    queryFn: async () => {
      const env = getEnvironmentDetails();
      const token = await auth.getToken();
      return fetchServiceAccount({
        clientId: clientId!,
        token: token as string,
        sso: env?.sso as string,
      });
    },
    enabled: Boolean(clientId),
  });

  const mutation = useMutation({
    mutationFn: resetServiceAccount,
  });

  const onConfirm: ResetModalProps['onConfirm'] = async () => {
    const env = getEnvironmentDetails();
    const token = await auth.getToken();
    mutation.mutate({
      clientId: clientId!,
      token: token as string,
      sso: env?.sso as string,
    });
  };

  useEffect(() => {
    if (!clientId || query.isError) {
      navigate(mergeToBasename(''));
    } else {
      appAction('reset-service-account-page');
    }
  }, [clientId, query.isError]);

  return mutation.data === undefined ? (
    <ResetModal
      name={query.data?.name}
      isResetting={mutation.isLoading}
      onConfirm={onConfirm}
    />
  ) : (
    <ServiceAccountNameSecretModal serviceAccount={mutation.data} />
  );
};

export default ResetServiceAccountPage;
