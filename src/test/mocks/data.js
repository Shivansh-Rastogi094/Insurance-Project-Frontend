/**
 * Shared test fixtures — mock data for all test suites.
 */

// ────── JWT Token (non-expired, exp set to year 2099) ──────
// Header: {"alg":"HS384"}, Payload: {"sub":"admin@insurance.com","iat":1700000000,"exp":4102444800}
export const MOCK_VALID_TOKEN =
  'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBpbnN1cmFuY2UuY29tIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjQxMDI0NDQ4MDB9.FAKE_SIGNATURE_FOR_TESTING';

// Header: {"alg":"HS384"}, Payload: {"sub":"expired@insurance.com","iat":1700000000,"exp":1700000001}
export const MOCK_EXPIRED_TOKEN =
  'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJleHBpcmVkQGluc3VyYW5jZS5jb20iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMX0.FAKE_EXPIRED_SIGNATURE';

// ────── Users ──────
export const mockAdminUser = {
  id: 1,
  fullName: 'Admin User',
  email: 'admin@insurance.com',
  role: 'ADMIN',
  token: MOCK_VALID_TOKEN,
  phoneNumber: '9876543210',
  active: true,
};

export const mockAgentUser = {
  id: 2,
  fullName: 'Agent Smith',
  email: 'agent@insurance.com',
  role: 'AGENT',
  token: MOCK_VALID_TOKEN,
  phoneNumber: '9876543211',
  active: true,
};

export const mockSuperAgentUser = {
  id: 5,
  fullName: 'Super Agent',
  email: 'superagent@insurance.com',
  role: 'SUPER_AGENT',
  token: MOCK_VALID_TOKEN,
  phoneNumber: '9876543214',
  active: true,
};

export const mockCustomerUser = {
  id: 3,
  fullName: 'John Customer',
  email: 'customer@insurance.com',
  role: 'CUSTOMER',
  token: MOCK_VALID_TOKEN,
  phoneNumber: '9876543212',
  active: true,
};

// ────── Products ──────
export const mockProducts = [
  {
    id: 1,
    productName: 'Life Insurance',
    productType: 'LIFE',
    description: 'Comprehensive life coverage',
    active: true,
  },
  {
    id: 2,
    productName: 'Health Insurance',
    productType: 'HEALTH',
    description: 'Complete health protection',
    active: true,
  },
  {
    id: 3,
    productName: 'Motor Insurance',
    productType: 'MOTOR',
    description: 'Vehicle coverage plan',
    active: false,
  },
];

// ────── Plans ──────
export const mockPlans = [
  {
    id: 1,
    productId: 1,
    planName: 'Gold Life Plan',
    coverageAmount: 500000,
    premiumAmount: 12000,
    premiumType: 'ANNUAL',
    duration: 10,
    termsAndConditions: 'Standard T&C apply',
    active: true,
  },
  {
    id: 2,
    productId: 1,
    planName: 'Silver Life Plan',
    coverageAmount: 300000,
    premiumAmount: 8000,
    premiumType: 'ANNUAL',
    duration: 5,
    termsAndConditions: 'Basic T&C apply',
    active: true,
  },
  {
    id: 3,
    productId: 2,
    planName: 'Premium Health Plan',
    coverageAmount: 1000000,
    premiumAmount: 2500,
    premiumType: 'MONTHLY',
    duration: 1,
    termsAndConditions: 'Health T&C apply',
    active: true,
  },
];

// ────── Policies ──────
export const mockPolicies = [
  {
    id: 101,
    policyNumber: 'POL-2024-001',
    planId: 1,
    planName: 'Gold Life Plan',
    productName: 'Life Insurance',
    customerId: 3,
    customerName: 'John Customer',
    startDate: '2024-01-01',
    endDate: '2034-01-01',
    premiumAmount: 12000,
    premiumType: 'ANNUAL',
    coverageAmount: 500000,
    status: 'ACTIVE',
  },
  {
    id: 102,
    policyNumber: 'POL-2024-002',
    planId: 3,
    planName: 'Premium Health Plan',
    productName: 'Health Insurance',
    customerId: 3,
    customerName: 'John Customer',
    startDate: '2024-06-01',
    endDate: '2025-06-01',
    premiumAmount: 2500,
    premiumType: 'MONTHLY',
    coverageAmount: 1000000,
    status: 'ACTIVE',
  },
];

// ────── Claims ──────
export const mockClaims = [
  {
    id: 201,
    policyId: 101,
    policyNumber: 'POL-2024-001',
    claimAmount: 50000,
    claimReason: 'Medical emergency',
    incidentDate: '2024-03-15',
    status: 'PENDING',
    createdAt: '2024-03-16',
    customerName: 'John Customer',
  },
  {
    id: 202,
    policyId: 102,
    policyNumber: 'POL-2024-002',
    claimAmount: 25000,
    claimReason: 'Hospital admission',
    incidentDate: '2024-07-20',
    status: 'APPROVED',
    createdAt: '2024-07-21',
    customerName: 'John Customer',
  },
];

// ────── Payments ──────
export const mockPayments = [
  {
    id: 301,
    policyId: 101,
    amount: 12000,
    paymentMode: 'RAZORPAY',
    paymentStatus: 'COMPLETED',
    transactionReference: 'TXN-001',
    paymentDate: '2024-01-01',
  },
  {
    id: 302,
    policyId: 102,
    amount: 2500,
    paymentMode: 'RAZORPAY',
    paymentStatus: 'COMPLETED',
    transactionReference: 'TXN-002',
    paymentDate: '2024-06-01',
  },
];

// ────── Customer Profile ──────
export const mockCustomerProfile = {
  id: 3,
  userId: 3,
  dateOfBirth: '1990-05-15',
  address: '123 Main Street',
  city: 'Hyderabad',
  state: 'Telangana',
  pinCode: '500001',
  nomineeName: 'Jane Customer',
  nomineeRelation: 'SPOUSE',
};

// ────── Customer Queries ──────
export const mockQueries = [
  {
    id: 401,
    fullName: 'John Customer',
    email: 'customer@insurance.com',
    subject: 'Policy renewal query',
    message: 'How do I renew my policy?',
    response: null,
    status: 'OPEN',
    createdAt: '2024-04-01',
  },
  {
    id: 402,
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Claim status',
    message: 'What is the status of my claim?',
    response: 'Your claim is under review.',
    status: 'RESOLVED',
    createdAt: '2024-03-20',
  },
];

// ────── Claim History ──────
export const mockClaimHistory = [
  {
    id: 1,
    claimId: 201,
    action: 'CREATED',
    remarks: 'Claim filed by customer',
    performedBy: 'John Customer',
    timestamp: '2024-03-16T10:00:00',
  },
  {
    id: 2,
    claimId: 201,
    action: 'REVIEWED',
    remarks: 'Recommended for approval',
    performedBy: 'Agent Smith',
    timestamp: '2024-03-17T14:30:00',
  },
];

// ────── Razorpay Mock ──────
export const mockRazorpayOrder = {
  orderId: 'order_test_123',
  amount: 1200000,
  currency: 'INR',
  receipt: 'receipt_101',
};

// ────── Users List (admin view) ──────
export const mockUsersList = [
  mockAdminUser,
  mockAgentUser,
  mockCustomerUser,
  { id: 4, fullName: 'Inactive Agent', email: 'inactive@insurance.com', role: 'AGENT', active: false, phoneNumber: '9876543213' },
];

// ────── Customers List (admin view) ──────
export const mockCustomersList = [
  {
    id: 3,
    fullName: 'John Customer',
    email: 'customer@insurance.com',
    phoneNumber: '9876543212',
    active: true,
    ...mockCustomerProfile,
  },
];

// ────── Premium Calculator ──────
export const mockPremiumQuote = {
  premiumAmount: 15000,
  coverageAmount: 500000,
  premiumType: 'ANNUAL',
  productType: 'LIFE',
  durationYears: 10,
  age: 30,
};
