import React, { createContext, useContext } from 'react';

// Context for feature flags - allows Storybook controls to override values
export const FeatureFlagsContext = createContext<Record<string, boolean>>({
  'platform.service-accounts.sorting': true,
  'platform.service-accounts.filtering': true,
});

export const useFlag = (flagName: string): boolean => {
  const flags = useContext(FeatureFlagsContext);
  return flags[flagName] ?? false;
};

export const useFlagsStatus = () => ({
  flagsReady: true,
  flagsError: null,
});

export const useVariant = () => ({
  name: 'disabled',
  enabled: false,
});

export const FlagProvider = ({ children }: { children: React.ReactNode }) => children;

// Provider component for Storybook decorator
export const FeatureFlagsProvider: React.FC<{
  flags: Record<string, boolean>;
  children: React.ReactNode;
}> = ({ flags, children }) => (
  <FeatureFlagsContext.Provider value={flags}>
    {children}
  </FeatureFlagsContext.Provider>
);
