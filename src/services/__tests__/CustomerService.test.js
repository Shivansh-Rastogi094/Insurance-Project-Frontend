import { describe, it, expect } from 'vitest';
import {
  getCustomerProfile,
  getCustomerById,
  readAllCustomers,
  createCustomerProfile,
  updateCustomerProfile,
} from '../CustomerService';
import { mockCustomerProfile, mockCustomersList } from '../../test/mocks/data';

describe('CustomerService', () => {
  describe('getCustomerProfile', () => {
    it('fetches logged-in customer profile', async () => {
      const response = await getCustomerProfile();
      expect(response.data).toEqual(mockCustomerProfile);
      expect(response.data.city).toBe('Hyderabad');
    });
  });

  describe('getCustomerById', () => {
    it('fetches customer by ID', async () => {
      const response = await getCustomerById(3);
      expect(response.data.id).toBe(3);
      expect(response.data.fullName).toBe('John Customer');
    });

    it('returns 404 for non-existent customer', async () => {
      await expect(getCustomerById(999)).rejects.toThrow();
    });
  });

  describe('readAllCustomers', () => {
    it('fetches paginated customers', async () => {
      const response = await readAllCustomers(0, 10);
      expect(response.data.content).toEqual(mockCustomersList);
    });
  });

  describe('createCustomerProfile', () => {
    it('creates a new customer profile', async () => {
      const payload = {
        dateOfBirth: '1995-08-20',
        address: '456 New Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        nomineeName: 'Someone',
        nomineeRelation: 'PARENT',
      };
      const response = await createCustomerProfile(payload);
      expect(response.data.id).toBe(10);
      expect(response.data.city).toBe('Mumbai');
    });
  });

  describe('updateCustomerProfile', () => {
    it('updates an existing customer profile', async () => {
      const payload = {
        dateOfBirth: '1990-05-15',
        address: 'Updated Address',
        city: 'Bangalore',
        state: 'Karnataka',
        pinCode: '560001',
        nomineeName: 'Updated Nominee',
        nomineeRelation: 'SIBLING',
      };
      const response = await updateCustomerProfile(3, payload);
      expect(response.data.id).toBe(3);
      expect(response.data.city).toBe('Bangalore');
    });
  });
});
