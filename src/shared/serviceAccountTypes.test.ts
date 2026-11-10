import {
  SERVICE_ACCOUNT_TYPES,
  SERVICE_ACCOUNT_TYPE_OPTIONS,
  TYPE_QUERY_PARAM,
  isValidServiceAccountType,
} from './serviceAccountTypes';

describe('serviceAccountTypes', () => {
  it('exports the provisional query-parameter name', () => {
    expect(TYPE_QUERY_PARAM).toBe('type');
  });

  it('maps service_account to "Service account"', () => {
    expect(SERVICE_ACCOUNT_TYPES.service_account).toBe('Service account');
  });

  it('maps service_access_token to "Service Access Token"', () => {
    expect(SERVICE_ACCOUNT_TYPES.service_access_token).toBe(
      'Service Access Token'
    );
  });

  describe('isValidServiceAccountType', () => {
    it('returns true for valid types', () => {
      expect(isValidServiceAccountType('service_account')).toBe(true);
      expect(isValidServiceAccountType('service_access_token')).toBe(true);
    });

    it('returns false for invalid types', () => {
      expect(isValidServiceAccountType('')).toBe(false);
      expect(isValidServiceAccountType('unknown')).toBe(false);
      expect(isValidServiceAccountType('SERVICE_ACCOUNT')).toBe(false);
    });
  });

  describe('SERVICE_ACCOUNT_TYPE_OPTIONS', () => {
    it('has two options matching the enum entries', () => {
      expect(SERVICE_ACCOUNT_TYPE_OPTIONS).toHaveLength(2);
      expect(SERVICE_ACCOUNT_TYPE_OPTIONS).toEqual(
        expect.arrayContaining([
          { label: 'Service account', value: 'service_account' },
          { label: 'Service Access Token', value: 'service_access_token' },
        ])
      );
    });
  });
});
