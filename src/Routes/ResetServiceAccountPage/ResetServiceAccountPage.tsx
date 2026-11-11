import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFlag } from '@unleash/proxy-client-react';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchServiceAccount } from '../../shared/fetchServiceAccount';
import {
  UnexpectedServiceAccessTokenResetResponseError,
  resetServiceAccount,
} from '../../shared/resetServiceAccount';
import { ServiceAccountNameSecretModal } from '../../shared/ServiceAccountNameSecretModal';
import { mergeToBasename } from '../../shared/utils';
import { ResetModal, ResetModalProps } from './ResetModal';

const ResetServiceAccountPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { appAction, auth, getEnvironmentDetails } = useChrome();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isSatEnabled = useFlag('platform.service-accounts.sat');

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
    mutationFn: async ({
      expectedSatUsername,
    }: {
      expectedSatUsername?: string;
    }) => {
      const env = getEnvironmentDetails();
      const token = await auth.getToken();
      return resetServiceAccount({
        clientId: clientId!,
        token: token as string,
        sso: env?.sso as string,
        expectedSatUsername,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-accounts'] });
    },
    onError: (error) => {
      if (error instanceof UnexpectedServiceAccessTokenResetResponseError) {
        queryClient.invalidateQueries({ queryKey: ['service-accounts'] });
        queryClient.invalidateQueries({
          queryKey: ['service-account', clientId],
        });
      }
    },
  });

  const isSat =
    query.data?.type === 'service_access_token' ||
    mutation.data?.type === 'service_access_token';
  const satError = mutation.isError
    ? mutation.error instanceof UnexpectedServiceAccessTokenResetResponseError
      ? 'unexpected'
      : 'request'
    : isSat && !query.data?.serviceAccessTokenId
    ? 'missingUsername'
    : undefined;

  const onConfirm: ResetModalProps['onConfirm'] = () => {
    if (isSat && (!isSatEnabled || !query.data?.serviceAccessTokenId)) return;
    mutation.mutate({
      expectedSatUsername: isSat ? query.data?.serviceAccessTokenId : undefined,
    });
  };

  useEffect(() => {
    if (!clientId || query.isError || (isSat && !isSatEnabled)) {
      navigate(mergeToBasename(''));
    } else {
      appAction('reset-service-account-page');
    }
  }, [clientId, query.isError, isSat, isSatEnabled]);

  const closeSat = () => {
    mutation.reset();
    queryClient.invalidateQueries({ queryKey: ['service-account', clientId] });
    navigate(mergeToBasename(''));
  };

  if (isSat && !isSatEnabled) return null;

  if (isSat && mutation.data) {
    return (
      <ServiceAccountNameSecretModal
        serviceAccessToken={{
          username: mutation.data.serviceAccessTokenId!,
          token: mutation.data.secret,
        }}
        onClose={closeSat}
      />
    );
  }

  return mutation.data === undefined ? (
    <ResetModal
      name={query.data?.name}
      isResetting={mutation.isLoading}
      onConfirm={onConfirm}
      isSat={isSat}
      satError={isSat ? satError : undefined}
    />
  ) : (
    <ServiceAccountNameSecretModal serviceAccount={mutation.data} />
  );
};

export default ResetServiceAccountPage;
