// Mock for @redhat-cloud-services/frontend-components/Main
import React from 'react';

export const Main: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <main className="pf-v6-c-page__main-section">{children}</main>;
};

export default Main;
