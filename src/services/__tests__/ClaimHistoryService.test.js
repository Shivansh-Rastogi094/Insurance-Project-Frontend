import { describe, it, expect } from 'vitest';
import { getClaimHistory } from '../ClaimHistoryService';
import { mockClaimHistory } from '../../test/mocks/data';

describe('ClaimHistoryService', () => {
  it('getClaimHistory returns claim history timeline for a claim', async () => {
    const res = await getClaimHistory(201);
    expect(res.data).toBeDefined();
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toMatchObject({
      claimId: 201,
      action: 'CREATED',
    });
  });

  it('handles error when claim history request fails', async () => {
    const { server } = await import('../../test/mocks/server');
    const { http, HttpResponse } = await import('msw');

    server.use(
      http.get('http://localhost:8080/api/claim-history/:claimId', () => {
        return HttpResponse.json({ message: 'History not found' }, { status: 404 });
      })
    );

    await expect(getClaimHistory(999)).rejects.toThrow();
  });
});
