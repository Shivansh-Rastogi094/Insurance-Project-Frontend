import { http, HttpResponse } from 'msw';
import {
  mockAdminUser,
  mockCustomerUser,
  mockAgentUser,
  mockProducts,
  mockPlans,
  mockPolicies,
  mockClaims,
  mockPayments,
  mockCustomerProfile,
  mockQueries,
  mockClaimHistory,
  mockRazorpayOrder,
  mockUsersList,
  mockCustomersList,
  mockPremiumQuote,
} from './data';

const BASE = 'http://localhost:8080/api';

export const handlers = [
  // ══════════ AUTH ══════════
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json();
    if (body.email === 'admin@insurance.com') {
      return HttpResponse.json(mockAdminUser);
    }
    if (body.email === 'agent@insurance.com') {
      return HttpResponse.json(mockAgentUser);
    }
    if (body.email === 'customer@insurance.com') {
      return HttpResponse.json(mockCustomerUser);
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      message: 'Registration successful. Please verify your email.',
      email: body.email,
    });
  }),

  http.post(`${BASE}/auth/verify-otp`, async ({ request }) => {
    const body = await request.json();
    if (body.otp === '123456') {
      return HttpResponse.json({ message: 'OTP verified successfully' });
    }
    return HttpResponse.json({ message: 'Invalid OTP' }, { status: 400 });
  }),

  http.post(`${BASE}/auth/resend-otp`, () => {
    return HttpResponse.json({ message: 'OTP resent successfully' });
  }),

  http.post(`${BASE}/auth/verify-mobile-otp`, async ({ request }) => {
    const body = await request.json();
    if (body.otp === '123456') {
      return HttpResponse.json({ message: 'Mobile OTP verified' });
    }
    return HttpResponse.json({ message: 'Invalid OTP' }, { status: 400 });
  }),

  http.post(`${BASE}/auth/forgot-password`, () => {
    return HttpResponse.json({ message: 'Password reset OTP sent' });
  }),

  http.post(`${BASE}/auth/reset-password`, () => {
    return HttpResponse.json({ message: 'Password reset successfully' });
  }),

  http.post(`${BASE}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Token blacklisted and logged out successfully' });
  }),


  // ══════════ PRODUCTS ══════════
  http.get(`${BASE}/products`, () => {
    return HttpResponse.json({ content: mockProducts, totalElements: mockProducts.length });
  }),

  http.get(`${BASE}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === Number(params.id));
    if (!product) return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    return HttpResponse.json(product);
  }),

  http.post(`${BASE}/products`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 10, ...body }, { status: 201 });
  }),

  http.put(`${BASE}/products/:id`, async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({ id: Number(params.id), ...body });
  }),

  http.put(`${BASE}/products/:id/deactivate`, ({ params }) => {
    return HttpResponse.json({ message: `Product ${params.id} deactivated` });
  }),

  // ══════════ PLANS ══════════
  http.get(`${BASE}/plans`, () => {
    return HttpResponse.json({ content: mockPlans, totalElements: mockPlans.length });
  }),

  http.get(`${BASE}/plans/:id`, ({ params }) => {
    const plan = mockPlans.find((p) => p.id === Number(params.id));
    if (!plan) return HttpResponse.json({ message: 'Plan not found' }, { status: 404 });
    return HttpResponse.json(plan);
  }),

  http.post(`${BASE}/plans`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 10, ...body }, { status: 201 });
  }),

  http.put(`${BASE}/plans/:id`, async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({ id: Number(params.id), ...body });
  }),

  http.put(`${BASE}/plans/:id/deactivate`, ({ params }) => {
    return HttpResponse.json({ message: `Plan ${params.id} deactivated` });
  }),

  // ══════════ POLICIES ══════════
  http.get(`${BASE}/policies`, () => {
    return HttpResponse.json({ content: mockPolicies, totalElements: mockPolicies.length });
  }),

  http.get(`${BASE}/policies/my`, () => {
    return HttpResponse.json({ content: mockPolicies, totalElements: mockPolicies.length });
  }),

  http.get(`${BASE}/policies/:id`, ({ params }) => {
    const policy = mockPolicies.find((p) => p.id === Number(params.id));
    if (!policy) return HttpResponse.json({ message: 'Policy not found' }, { status: 404 });
    return HttpResponse.json(policy);
  }),

  http.post(`${BASE}/policies/purchase`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 200,
      policyNumber: 'POL-2024-NEW',
      ...body,
      status: 'ACTIVE',
    }, { status: 201 });
  }),

  http.post(`${BASE}/policies/issue`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 201,
      policyNumber: 'POL-2024-ISSUED',
      ...body,
      status: 'ACTIVE',
    }, { status: 201 });
  }),

  http.put(`${BASE}/policies/:id/cancel`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      status: 'CANCELLED',
    });
  }),

  // ══════════ CLAIMS ══════════
  http.get(`${BASE}/claims`, () => {
    return HttpResponse.json({ content: mockClaims, totalElements: mockClaims.length });
  }),

  http.get(`${BASE}/claims/my`, () => {
    return HttpResponse.json({ content: mockClaims, totalElements: mockClaims.length });
  }),

  http.get(`${BASE}/claims/:id`, ({ params }) => {
    const claim = mockClaims.find((c) => c.id === Number(params.id));
    if (!claim) return HttpResponse.json({ message: 'Claim not found' }, { status: 404 });
    return HttpResponse.json(claim);
  }),

  http.post(`${BASE}/claims`, () => {
    return HttpResponse.json({
      id: 300,
      status: 'PENDING',
      message: 'Claim submitted successfully',
    }, { status: 201 });
  }),

  http.put(`${BASE}/claims/:id/review`, async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      status: body.recommendedStatus,
    });
  }),

  http.put(`${BASE}/claims/:id/decision`, async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      status: body.finalDecisionStatus,
    });
  }),

  // ══════════ CLAIM HISTORY ══════════
  http.get(`${BASE}/claim-history/:claimId`, () => {
    return HttpResponse.json(mockClaimHistory);
  }),

  // ══════════ PAYMENTS ══════════
  http.get(`${BASE}/payments`, () => {
    return HttpResponse.json({ content: mockPayments, totalElements: mockPayments.length });
  }),

  http.get(`${BASE}/payments/my`, () => {
    return HttpResponse.json({ content: mockPayments, totalElements: mockPayments.length });
  }),

  http.get(`${BASE}/payments/:id`, ({ params }) => {
    const payment = mockPayments.find((p) => p.id === Number(params.id));
    if (!payment) return HttpResponse.json({ message: 'Payment not found' }, { status: 404 });
    return HttpResponse.json(payment);
  }),

  http.get(`${BASE}/payments/policy/:policyId`, () => {
    return HttpResponse.json(mockPayments);
  }),

  http.post(`${BASE}/payments`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 400,
      ...body,
      paymentStatus: 'COMPLETED',
    }, { status: 201 });
  }),

  http.post(`${BASE}/payments/create-razorpay-order/:policyId`, () => {
    return HttpResponse.json(mockRazorpayOrder);
  }),

  http.post(`${BASE}/payments/verify-razorpay-payment`, () => {
    return HttpResponse.json({
      message: 'Payment verified successfully',
      paymentStatus: 'COMPLETED',
    });
  }),

  // ══════════ CUSTOMERS ══════════
  http.get(`${BASE}/customers/profile`, () => {
    return HttpResponse.json(mockCustomerProfile);
  }),

  http.get(`${BASE}/customers/:id`, ({ params }) => {
    const customer = mockCustomersList.find((c) => c.id === Number(params.id));
    if (!customer) return HttpResponse.json({ message: 'Customer not found' }, { status: 404 });
    return HttpResponse.json(customer);
  }),

  http.get(`${BASE}/customers`, () => {
    return HttpResponse.json({ content: mockCustomersList, totalElements: mockCustomersList.length });
  }),

  http.post(`${BASE}/customers`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 10, ...body }, { status: 201 });
  }),

  http.put(`${BASE}/customers/:id`, async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({ id: Number(params.id), ...body });
  }),

  // ══════════ USERS ══════════
  http.get(`${BASE}/users`, () => {
    return HttpResponse.json({ content: mockUsersList, totalElements: mockUsersList.length });
  }),

  http.get(`${BASE}/users/:id`, ({ params }) => {
    const user = mockUsersList.find((u) => u.id === Number(params.id));
    if (!user) return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    return HttpResponse.json(user);
  }),

  http.post(`${BASE}/users/agent`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 20, ...body, role: 'AGENT' }, { status: 201 });
  }),

  http.put(`${BASE}/users/:id/activate`, async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({ id: Number(params.id), active: true, ...body });
  }),

  http.put(`${BASE}/users/:id/deactivate`, async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({ id: Number(params.id), active: false, ...body });
  }),

  // ══════════ CUSTOMER QUERIES ══════════
  http.post(`${BASE}/queries`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 500,
      ...body,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    });
  }),

  http.get(`${BASE}/queries/my`, () => {
    return HttpResponse.json({ content: mockQueries, totalElements: mockQueries.length });
  }),

  http.get(`${BASE}/queries`, () => {
    return HttpResponse.json({ content: mockQueries, totalElements: mockQueries.length });
  }),

  http.put(`${BASE}/queries/:id/reply`, async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      status: 'RESOLVED',
    });
  }),

  // ══════════ PREMIUM CALCULATOR ══════════
  http.post(`${BASE}/calculator/premium`, () => {
    return HttpResponse.json(mockPremiumQuote);
  }),

  http.get(`${BASE}/calculator/premium`, () => {
    return HttpResponse.json(mockPremiumQuote);
  }),
];
