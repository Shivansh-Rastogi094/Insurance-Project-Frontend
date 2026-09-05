import { describe, it, expect } from 'vitest';
import {
  LoginService,
  RegisterService,
  VerifyOtpService,
  ResendOtpService,
  VerifyMobileOtpService,
  ForgotPasswordService,
  ResetPasswordService,
  LogoutService,
} from '../AuthService';
import { mockAdminUser, mockCustomerUser } from '../../test/mocks/data';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('AuthService', () => {
  describe('LoginService', () => {
    it('sends POST to auth/login and returns admin user', async () => {
      const response = await LoginService({
        email: 'admin@insurance.com',
        password: 'Admin@12345',
      });

      expect(response.data).toEqual(mockAdminUser);
    });

    it('sends POST to auth/login and returns customer user', async () => {
      const response = await LoginService({
        email: 'customer@insurance.com',
        password: 'Customer@12345',
      });

      expect(response.data).toEqual(mockCustomerUser);
    });

    it('throws on invalid credentials', async () => {
      await expect(
        LoginService({ email: 'wrong@email.com', password: 'wrong' })
      ).rejects.toThrow();
    });
  });

  describe('RegisterService', () => {
    it('sends POST to auth/register with payload', async () => {
      const payload = {
        fullName: 'New User',
        email: 'newuser@test.com',
        password: 'NewUser@123',
        phoneNumber: '9876543210',
        role: 'CUSTOMER',
      };

      const response = await RegisterService(payload);
      expect(response.data.email).toBe('newuser@test.com');
      expect(response.data.message).toContain('Registration successful');
    });
  });

  describe('VerifyOtpService', () => {
    it('sends correct OTP payload', async () => {
      const response = await VerifyOtpService({ email: 'test@test.com', otp: '123456' });
      expect(response.data.message).toContain('verified');
    });

    it('throws on invalid OTP', async () => {
      await expect(
        VerifyOtpService({ email: 'test@test.com', otp: '000000' })
      ).rejects.toThrow();
    });
  });

  describe('ResendOtpService', () => {
    it('sends email as query param', async () => {
      const response = await ResendOtpService('test@test.com');
      expect(response.data.message).toContain('resent');
    });
  });

  describe('VerifyMobileOtpService', () => {
    it('sends correct payload', async () => {
      const response = await VerifyMobileOtpService({ email: 'test@test.com', otp: '123456' });
      expect(response.data.message).toContain('verified');
    });
  });

  describe('ForgotPasswordService', () => {
    it('sends email as query param', async () => {
      const response = await ForgotPasswordService('test@test.com');
      expect(response.data.message).toContain('OTP sent');
    });
  });

  describe('ResetPasswordService', () => {
    it('sends all params correctly', async () => {
      const response = await ResetPasswordService({
        email: 'test@test.com',
        otp: '123456',
        newPassword: 'NewPass@123',
      });
      expect(response.data.message).toContain('reset successfully');
    });
  });

  describe('LogoutService', () => {
    it('sends POST to auth/logout to blacklist token', async () => {
      const response = await LogoutService();
      expect(response.data.message).toContain('logged out');
    });

    it('handles logout failure gracefully', async () => {
      server.use(
        http.post('http://localhost:8080/api/auth/logout', () => {
          return HttpResponse.json({ message: 'Revocation error' }, { status: 500 });
        })
      );
      await expect(LogoutService()).rejects.toThrow();
    });
  });


  describe('Error handling', () => {
    it('throws and logs on server error', async () => {
      server.use(
        http.post('http://localhost:8080/api/auth/login', () => {
          return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        })
      );

      await expect(
        LoginService({ email: 'test@test.com', password: 'test' })
      ).rejects.toThrow();
    });
  });
});
