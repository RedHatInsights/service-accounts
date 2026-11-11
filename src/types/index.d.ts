/* eslint-disable no-var */
import ChromeApi from '@redhat-cloud-services/frontend-components/ChromeApi';

declare global {
  var insights: ChromeApi;
}

export type ServiceAccount = {
  id: string;
  clientId: string;
  type?: 'service_access_token';
  serviceAccessTokenId?: string;
  expiresAt?: number;
  createdAt: number;
  createdBy: string;
  name: string;
  description: string;
};

export type NewServiceAccount = {
  secret: string;
  error?: string;
  error_description?: string;
} & ServiceAccount;
