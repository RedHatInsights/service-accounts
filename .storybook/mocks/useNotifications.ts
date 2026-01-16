// Mock for @redhat-cloud-services/frontend-components-notifications/hooks/useNotifications
export const useAddNotification = () => {
  return (notification: { variant: string; title: string }) => {
    console.log('[Notification]', notification.variant, notification.title);
  };
};

export default useAddNotification;
