import { describe, it, expect } from 'vitest';
import {
  readAllPolicies,
  readMyPolicies,
  getPolicyById,
  purchasePolicy,
  issuePolicy,
  cancelPolicy,
} from '../PolicyService';
import { mockPolicies } from '../../test/mocks/data';

describe('PolicyService', () => {
  describe('readAllPolicies', () => {
    it('fetches paginated policies', async () => {
      const response = await readAllPolicies(0, 10);
      expect(response.data.content).toEqual(mockPolicies);
      expect(response.data.totalElements).toBe(mockPolicies.length);
    });

    it('uses default pagination params', async () => {
      const response = await readAllPolicies();
      expect(response.data.content).toBeDefined();
    });
  });

  describe('readMyPolicies', () => {
    it('fetches and unwraps data.content', async () => {
      const result = await readMyPolicies();
      expect(result).toEqual(mockPolicies);
    });
  });

  describe('getPolicyById', () => {
    it('fetches a single policy', async () => {
      const response = await getPolicyById(101);
      expect(response.data.id).toBe(101);
      expect(response.data.policyNumber).toBe('POL-2024-001');
    });
  });

  describe('purchasePolicy', () => {
    it('sends purchase request and receives new policy', async () => {
      const payload = { planId: 1, startDate: '2024-01-01' };
      const response = await purchasePolicy(payload);
      expect(response.data.policyNumber).toBe('POL-2024-NEW');
      expect(response.data.status).toBe('ACTIVE');
    });
  });

  describe('issuePolicy', () => {
    it('admin issues policy to customer', async () => {
      const payload = { customerId: 3, planId: 1, startDate: '2024-01-01' };
      const response = await issuePolicy(payload);
      expect(response.data.policyNumber).toBe('POL-2024-ISSUED');
      expect(response.data.status).toBe('ACTIVE');
    });
  });

  describe('cancelPolicy', () => {
    it('cancels a policy by id', async () => {
      const response = await cancelPolicy(101);
      expect(response.data.id).toBe(101);
      expect(response.data.status).toBe('CANCELLED');
    });
  });
});
