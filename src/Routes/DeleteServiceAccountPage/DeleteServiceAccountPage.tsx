import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks/useNotifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteServiceAccount } from '../../shared/deleteServiceAccount';
import { fetchServiceAccount } from '../../shared/fetchServiceAccount';
import { mergeToBasename } from '../../shared/utils';
import { DeleteModal, DeleteModalProps } from './DeleteModal';

const DeleteServiceAccountPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { appAction } = useChrome();
  const addNotification = useAddNotification();

  const { auth, getEnvironmentDetails } = useChrome();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    mutationFn: deleteServiceAccount,
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ['service-account', clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['service-accounts'],
      });
      navigate(mergeToBasename(''));

      addNotification({
        variant: 'success',
        title: `${query.data?.name} service account deleted`,
      });
    },
  });

  const onConfirm: DeleteModalProps['onConfirm'] = async () => {
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
      appAction('delete-service-account-page');
    }
  }, [clientId, query.isError]);

  return (
    <DeleteModal
      name={query.data?.name}
      isDeleting={mutation.isLoading}
      onConfirm={onConfirm}
    />
  );
};

export default DeleteServiceAccountPage;
