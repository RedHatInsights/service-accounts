// Mock for @redhat-cloud-services/frontend-components/PageHeader
import React from 'react';

export const PageHeader: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <header className="pf-v6-c-page__main-section pf-m-light">
      {children}
    </header>
  );
};

export const PageHeaderTitle: React.FC<{ 
  title: string; 
  ouiaId?: string;
  children?: React.ReactNode;
}> = ({ title, ouiaId }) => {
  return (
    <h1 className="pf-v6-c-title pf-m-2xl" data-ouia-component-id={ouiaId}>
      {title}
    </h1>
  );
};

export default PageHeader;
