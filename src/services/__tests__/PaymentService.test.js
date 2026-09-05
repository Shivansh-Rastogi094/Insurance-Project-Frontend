import { describe, it, expect } from 'vitest';
import {
  readAllPayments,
  readMyPayments,
  getPaymentById,
  getPaymentsByPolicy,
  createPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../PaymentService';
import { mockPayments, mockRazorpayOrder } from '../../test/mocks/data';

describe('PaymentService', () => {
  describe('readAllPayments', () => {
    it('fetches paginated payments', async () => {
      const response = await readAllPayments(0, 10);
      expect(response.data.content).toEqual(mockPayments);
    });
  });

  describe('readMyPayments', () => {
    it('fetches and unwraps data.content', async () => {
      const result = await readMyPayments();
      expect(result).toEqual(mockPayments);
    });
  });

  describe('getPaymentById', () => {
    it('fetches a single payment', async () => {
      const response = await getPaymentById(301);
      expect(response.data.id).toBe(301);
      expect(response.data.paymentStatus).toBe('COMPLETED');
    });
  });

  describe('getPaymentsByPolicy', () => {
    it('fetches payments for a specific policy', async () => {
      const response = await getPaymentsByPolicy(101);
      expect(response.data).toEqual(mockPayments);
    });
  });

  describe('createPayment', () => {
    it('creates a payment with correct payload', async () => {
      const payload = {
        policyId: 101,
        amount: 12000,
        paymentMode: 'RAZORPAY',
        transactionReference: 'TXN-NEW',
        paymentStatus: 'COMPLETED',
      };
      const response = await createPayment(payload);
      expect(response.data.paymentStatus).toBe('COMPLETED');
      expect(response.data.policyId).toBe(101);
    });
  });

  describe('createRazorpayOrder', () => {
    it('creates Razorpay order for a policy', async () => {
      const result = await createRazorpayOrder(101);
      expect(result).toEqual(mockRazorpayOrder);
      expect(result.orderId).toBe('order_test_123');
    });
  });

  describe('verifyRazorpayPayment', () => {
    it('verifies Razorpay payment with all params', async () => {
      const payload = {
        policyId: 101,
        razorpayOrderId: 'order_test_123',
        razorpayPaymentId: 'pay_test_456',
        razorpaySignature: 'sig_test_789',
        paymentMode: 'RAZORPAY',
      };
      const result = await verifyRazorpayPayment(payload);
      expect(result.paymentStatus).toBe('COMPLETED');
    });
  });
});
