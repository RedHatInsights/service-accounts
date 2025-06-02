import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000 * 3,
    },
  },
});

const AppEntry = () => (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

export default AppEntry;
