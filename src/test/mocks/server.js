import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create MSW server for Node.js (Vitest) environment
export const server = setupServer(...handlers);
