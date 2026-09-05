import { describe, it, expect } from 'vitest';
import {
  readAllUsers,
  getUserById,
  createAgentAccount,
  activateUser,
  deactivateUser,
} from '../UserService';
import { mockUsersList } from '../../test/mocks/data';

describe('UserService', () => {
  describe('readAllUsers', () => {
    it('fetches paginated users', async () => {
      const response = await readAllUsers(0, 10);
      expect(response.data.content).toEqual(mockUsersList);
      expect(response.data.totalElements).toBe(mockUsersList.length);
    });
  });

  describe('getUserById', () => {
    it('fetches a single user', async () => {
      const response = await getUserById(1);
      expect(response.data.id).toBe(1);
      expect(response.data.fullName).toBe('Admin User');
    });

    it('returns 404 for non-existent user', async () => {
      await expect(getUserById(999)).rejects.toThrow();
    });
  });

  describe('createAgentAccount', () => {
    it('creates a new agent account', async () => {
      const payload = {
        fullName: 'New Agent',
        email: 'newagent@insurance.com',
        password: 'Agent@12345',
        phoneNumber: '9876543299',
        role: 'AGENT',
      };
      const response = await createAgentAccount(payload);
      expect(response.data.id).toBe(20);
      expect(response.data.role).toBe('AGENT');
      expect(response.data.fullName).toBe('New Agent');
    });
  });

  describe('activateUser', () => {
    it('activates a user with remarks', async () => {
      const response = await activateUser(4, { remarks: 'Reactivated after review' });
      expect(response.data.id).toBe(4);
      expect(response.data.active).toBe(true);
    });
  });

  describe('deactivateUser', () => {
    it('deactivates a user with remarks', async () => {
      const response = await deactivateUser(2, { remarks: 'Policy violation' });
      expect(response.data.id).toBe(2);
      expect(response.data.active).toBe(false);
    });
  });
});
