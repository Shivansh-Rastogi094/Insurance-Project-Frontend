import { describe, it, expect } from 'vitest';
import {
  readAllClaims,
  readMyClaims,
  getClaimById,
  createClaim,
  agentReviewClaim,
  adminDecisionClaim,
  readClaimHistory,
} from '../ClaimService';
import { mockClaims, mockClaimHistory } from '../../test/mocks/data';

describe('ClaimService', () => {
  describe('readAllClaims', () => {
    it('fetches paginated claims', async () => {
      const response = await readAllClaims(0, 10);
      expect(response.data.content).toEqual(mockClaims);
    });
  });

  describe('readMyClaims', () => {
    it('fetches and unwraps data.content for customer claims', async () => {
      const result = await readMyClaims();
      expect(result).toEqual(mockClaims);
    });
  });

  describe('getClaimById', () => {
    it('fetches a single claim', async () => {
      const response = await getClaimById(201);
      expect(response.data.id).toBe(201);
      expect(response.data.claimReason).toBe('Medical emergency');
    });
  });

  describe('createClaim', () => {
    it('sends FormData and creates a claim', async () => {
      const formData = new FormData();
      formData.append('claim', JSON.stringify({
        policyId: 101,
        claimAmount: 50000,
        claimReason: 'Test claim',
        incidentDate: '2024-06-01',
      }));

      const response = await createClaim(formData);
      expect(response.data.status).toBe('PENDING');
    });
  });

  describe('agentReviewClaim', () => {
    it('submits agent review for a claim', async () => {
      const payload = { recommendedStatus: 'APPROVED', remarks: 'Looks good' };
      const response = await agentReviewClaim(201, payload);
      expect(response.data.status).toBe('APPROVED');
    });
  });

  describe('adminDecisionClaim', () => {
    it('submits admin decision for a claim', async () => {
      const payload = { finalDecisionStatus: 'REJECTED', remarks: 'Insufficient evidence' };
      const response = await adminDecisionClaim(201, payload);
      expect(response.data.status).toBe('REJECTED');
    });
  });

  describe('readClaimHistory', () => {
    it('fetches claim history timeline', async () => {
      const response = await readClaimHistory(201);
      expect(response.data).toEqual(mockClaimHistory);
      expect(response.data).toHaveLength(2);
    });
  });
});
