import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks/useNotifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFlag } from '@unleash/proxy-client-react';
import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { deleteServiceAccount } from '../../shared/deleteServiceAccount';
import { fetchServiceAccount } from '../../shared/fetchServiceAccount';
import { mergeToBasename } from '../../shared/utils';
import { DeleteModal, DeleteModalProps } from './DeleteModal';

const messages = defineMessages({
  deletedNotification: {
    id: 'serviceAccounts.delete.notification',
    defaultMessage: '{name} service account deleted',
  },
  satDeletedNotification: {
    id: 'serviceAccounts.token.delete.notification',
    defaultMessage: 'Service access token "{name}" has been deleted.',
  },
});

const DeleteServiceAccountPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { appAction } = useChrome();
  const addNotification = useAddNotification();
  const intl = useIntl();

  const { auth, getEnvironmentDetails } = useChrome();

  const navigate = useNavigate();
  const location = useLocation();
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

  const isSat = query.data?.type === 'service_access_token';
  const returnToList = (resetPage = false) => {
    if (!isSat) {
      navigate(mergeToBasename(''));
      return;
    }
    const params = new URLSearchParams(location.search);
    if (resetPage) params.delete('page');
    navigate(mergeToBasename({ pathname: '', search: params.toString() }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const env = getEnvironmentDetails();
      const token = await auth.getToken();
      const response = await deleteServiceAccount({
        clientId: clientId!,
        token: token as string,
        sso: env?.sso as string,
      });
      if (!response.ok) {
        throw new Error(
          `Failed to delete service account (${response.status})`
        );
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ['service-account', clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['service-accounts'],
      });

      addNotification({
        variant: isSat ? 'info' : 'success',
        title: intl.formatMessage(
          isSat
            ? messages.satDeletedNotification
            : messages.deletedNotification,
          { name: query.data?.name }
        ),
      });
      returnToList(isSat);
    },
  });

  const onConfirm: DeleteModalProps['onConfirm'] = () => mutation.mutate();

  useEffect(() => {
    if (!clientId || query.isError || (isSat && !isSatEnabled)) {
      navigate(mergeToBasename(''));
    } else {
      appAction('delete-service-account-page');
    }
  }, [clientId, query.isError, isSat, isSatEnabled]);

  if (!query.data || (isSat && !isSatEnabled)) return null;

  return (
    <DeleteModal
      name={query.data.name}
      isDeleting={mutation.isLoading}
      isError={mutation.isError}
      isSat={isSat}
      onConfirm={onConfirm}
      onClose={() => returnToList()}
    />
  );
};

export default DeleteServiceAccountPage;
