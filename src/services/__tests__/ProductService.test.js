import { describe, it, expect } from 'vitest';
import {
  readAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deactivateProduct,
} from '../ProductService';
import { mockProducts } from '../../test/mocks/data';

describe('ProductService', () => {
  describe('readAllProducts', () => {
    it('fetches paginated products', async () => {
      const response = await readAllProducts(0, 10);
      expect(response.data.content).toEqual(mockProducts);
      expect(response.data.totalElements).toBe(mockProducts.length);
    });
  });

  describe('getProductById', () => {
    it('fetches a single product', async () => {
      const response = await getProductById(1);
      expect(response.data.id).toBe(1);
      expect(response.data.productName).toBe('Life Insurance');
    });

    it('returns 404 for non-existent product', async () => {
      await expect(getProductById(999)).rejects.toThrow();
    });
  });

  describe('createProduct', () => {
    it('creates a new product', async () => {
      const payload = {
        productName: 'Travel Insurance',
        productType: 'TRAVEL',
        description: 'Travel coverage',
        active: true,
      };
      const response = await createProduct(payload);
      expect(response.data.id).toBe(10);
      expect(response.data.productName).toBe('Travel Insurance');
    });
  });

  describe('updateProduct', () => {
    it('updates an existing product', async () => {
      const payload = {
        productName: 'Updated Life Insurance',
        productType: 'LIFE',
        description: 'Updated description',
        active: true,
      };
      const response = await updateProduct(1, payload);
      expect(response.data.id).toBe(1);
      expect(response.data.productName).toBe('Updated Life Insurance');
    });
  });

  describe('deactivateProduct', () => {
    it('deactivates a product', async () => {
      const response = await deactivateProduct(1);
      expect(response.data.message).toContain('deactivated');
    });
  });
});
