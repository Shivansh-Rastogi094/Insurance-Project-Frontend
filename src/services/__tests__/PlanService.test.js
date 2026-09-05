import { describe, it, expect } from 'vitest';
import {
  readAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deactivatePlan,
} from '../PlanService';
import { mockPlans } from '../../test/mocks/data';

describe('PlanService', () => {
  describe('readAllPlans', () => {
    it('fetches paginated plans', async () => {
      const response = await readAllPlans(0, 10);
      expect(response.data.content).toEqual(mockPlans);
      expect(response.data.totalElements).toBe(mockPlans.length);
    });
  });

  describe('getPlanById', () => {
    it('fetches a single plan', async () => {
      const response = await getPlanById(1);
      expect(response.data.id).toBe(1);
      expect(response.data.planName).toBe('Gold Life Plan');
    });

    it('returns 404 for non-existent plan', async () => {
      await expect(getPlanById(999)).rejects.toThrow();
    });
  });

  describe('createPlan', () => {
    it('creates a new plan', async () => {
      const payload = {
        productId: 1,
        planName: 'Platinum Plan',
        coverageAmount: 1000000,
        premiumAmount: 25000,
        premiumType: 'ANNUAL',
        duration: 20,
        termsAndConditions: 'Platinum T&C',
        active: true,
      };
      const response = await createPlan(payload);
      expect(response.data.id).toBe(10);
      expect(response.data.planName).toBe('Platinum Plan');
    });
  });

  describe('updatePlan', () => {
    it('updates an existing plan', async () => {
      const payload = {
        productId: 1,
        planName: 'Updated Gold Plan',
        coverageAmount: 600000,
        premiumAmount: 15000,
        premiumType: 'ANNUAL',
        duration: 10,
        termsAndConditions: 'Updated T&C',
        active: true,
      };
      const response = await updatePlan(1, payload);
      expect(response.data.id).toBe(1);
      expect(response.data.planName).toBe('Updated Gold Plan');
    });
  });

  describe('deactivatePlan', () => {
    it('deactivates a plan', async () => {
      const response = await deactivatePlan(1);
      expect(response.data.message).toContain('deactivated');
    });
  });
});
