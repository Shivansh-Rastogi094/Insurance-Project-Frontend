/**
 * Live Backend API Connectivity & Health Test
 * Usage: node scripts/test-live-api.mjs
 */

const BASE = 'http://localhost:8080/api';

const endpoints = [
  { name: 'Products Catalog', method: 'GET', url: `${BASE}/products` },
  { name: 'Plans Catalog', method: 'GET', url: `${BASE}/plans` },
  { name: 'Premium Calculator (GET)', method: 'GET', url: `${BASE}/calculator/premium?coverageAmount=500000&durationYears=5&premiumType=ANNUAL&productType=LIFE&age=30` },
  { name: 'Premium Calculator (POST)', method: 'POST', url: `${BASE}/calculator/premium`, body: { coverageAmount: 500000, durationYears: 5, premiumType: 'ANNUAL', productType: 'LIFE', age: 30 } },
  { name: 'Auth - Login Service', method: 'POST', url: `${BASE}/auth/login`, body: { email: 'probe@test.com', password: 'password123' } },
  { name: 'Auth - Register Validation', method: 'POST', url: `${BASE}/auth/register`, body: {} },
  { name: 'Policies (Security Guard)', method: 'GET', url: `${BASE}/policies` },
  { name: 'Claims (Security Guard)', method: 'GET', url: `${BASE}/claims` },
  { name: 'Payments (Security Guard)', method: 'GET', url: `${BASE}/payments` },
  { name: 'Users (Security Guard)', method: 'GET', url: `${BASE}/users` },
  { name: 'Customers (Security Guard)', method: 'GET', url: `${BASE}/customers` },
  { name: 'Customer Queries (Security Guard)', method: 'GET', url: `${BASE}/queries` },
  { name: 'Claim History (Security Guard)', method: 'GET', url: `${BASE}/claim-history/1` },
];

async function checkApi() {
  console.log('Testing live backend endpoints on ' + BASE + '...\n');
  const results = [];

  for (const ep of endpoints) {
    try {
      const options = {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (ep.body) {
        options.body = JSON.stringify(ep.body);
      }
      const res = await fetch(ep.url, options);
      let data = null;
      try {
        data = await res.json();
      } catch {
        // text or empty
      }
      results.push({
        name: ep.name,
        method: ep.method,
        url: ep.url.replace(BASE, '/api'),
        status: res.status,
        statusText: res.statusText,
        active: true,
        dataSummary: data ? (Array.isArray(data) ? `Array[${data.length}]` : (data.content ? `Page[${data.content.length}]` : (data.message || JSON.stringify(data).slice(0, 50)))) : 'Secured (No Token)',
      });
    } catch (err) {
      results.push({
        name: ep.name,
        method: ep.method,
        url: ep.url.replace(BASE, '/api'),
        status: 'CONNECTION_REFUSED',
        active: false,
        error: err.message,
      });
    }
  }

  console.table(results.map(r => ({
    API: r.name,
    Method: r.method,
    Endpoint: r.url,
    'HTTP Status': r.status,
    'Live Backend Status': r.active ? 'ONLINE' : 'OFFLINE',
    'Response Detail': r.dataSummary || r.error
  })));

  console.log(`\nVerified: ${results.filter(r => r.active).length}/${results.length} endpoints are online and actively responding on localhost:8080.`);
}

checkApi();
