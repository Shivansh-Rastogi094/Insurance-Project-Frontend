import { describe, it, expect } from 'vitest';
import {
  submitQuery,
  readMyQueries,
  readAllQueries,
  replyToQuery,
} from '../CustomerQueryService';
import { mockQueries } from '../../test/mocks/data';

describe('CustomerQueryService', () => {
  describe('submitQuery', () => {
    it('submits a customer inquiry', async () => {
      const payload = {
        fullName: 'Test User',
        email: 'test@test.com',
        subject: 'Test Query',
        message: 'I need help with my policy.',
      };
      const result = await submitQuery(payload);
      expect(result.id).toBe(500);
      expect(result.status).toBe('OPEN');
      expect(result.subject).toBe('Test Query');
    });
  });

  describe('readMyQueries', () => {
    it('fetches logged-in customer queries', async () => {
      const result = await readMyQueries();
      expect(result).toEqual(mockQueries);
      expect(result).toHaveLength(2);
    });
  });

  describe('readAllQueries', () => {
    it('fetches all queries (admin/agent view)', async () => {
      const response = await readAllQueries();
      expect(response.data.content).toEqual(mockQueries);
    });
  });

  describe('replyToQuery', () => {
    it('submits a reply to a customer query', async () => {
      const payload = {
        response: 'Your query has been resolved.',
        status: 'RESOLVED',
      };
      const result = await replyToQuery(401, payload);
      expect(result.id).toBe(401);
      expect(result.status).toBe('RESOLVED');
    });
  });
});
