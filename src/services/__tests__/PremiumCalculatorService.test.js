import { describe, it, expect } from 'vitest';
import { calculateAutomaticPremium, getAutomaticPremiumQuote } from '../PremiumCalculatorService';

describe('PremiumCalculatorService', () => {
  it('calculateAutomaticPremium sends POST payload and returns quote', async () => {
    const payload = {
      coverageAmount: 500000,
      durationYears: 10,
      premiumType: 'ANNUAL',
      productType: 'LIFE',
      age: 30,
    };

    const data = await calculateAutomaticPremium(payload);
    expect(data).toBeDefined();
    expect(data.premiumAmount).toBe(15000);
    expect(data.coverageAmount).toBe(500000);
  });

  it('calculateAutomaticPremium handles error on API failure', async () => {
    const { server } = await import('../../test/mocks/server');
    const { http, HttpResponse } = await import('msw');

    server.use(
      http.post('http://localhost:8080/api/calculator/premium', () => {
        return HttpResponse.json({ message: 'Calculation error' }, { status: 500 });
      })
    );

    await expect(calculateAutomaticPremium({})).rejects.toThrow();
  });

  it('getAutomaticPremiumQuote sends GET with query params and returns quote', async () => {
    const data = await getAutomaticPremiumQuote(500000, 10, 'ANNUAL', 'LIFE', 30);
    expect(data).toBeDefined();
    expect(data.coverageAmount).toBe(500000);
    expect(data.premiumAmount).toBe(15000);
  });

  it('getAutomaticPremiumQuote uses default arguments when omitted', async () => {
    const data = await getAutomaticPremiumQuote(200000);
    expect(data).toBeDefined();
    expect(data.premiumAmount).toBe(15000);
  });

  it('getAutomaticPremiumQuote handles error on API failure', async () => {
    const { server } = await import('../../test/mocks/server');
    const { http, HttpResponse } = await import('msw');

    server.use(
      http.get('http://localhost:8080/api/calculator/premium', () => {
        return HttpResponse.json({ message: 'Bad request' }, { status: 400 });
      })
    );

    await expect(getAutomaticPremiumQuote(100)).rejects.toThrow();
  });
});
