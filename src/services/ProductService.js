import api from "../api/api";

// GET /api/products?page=0&size=10
export const readAllProducts = async (page = 0, size = 10) => {
    try {
        const response = await api.get(`products`, { params: { page, size } });
        return response;
    } catch (err) {
        console.error("Error in readAllProducts:", err);
        throw err;
    }
};

// GET /api/products/:id
export const getProductById = async (id) => {
    try {
        const response = await api.get(`products/${id}`);
        return response;
    } catch (err) {
        console.error("Error in getProductById:", err);
        throw err;
    }
};

// POST /api/products  [admin]
export const createProduct = async (payload) => {
    // payload: { productName, productType, description, active }
    try {
        const response = await api.post("products", payload);
        return response;
    } catch (err) {
        console.error("Error in createProduct:", err);
        throw err;
    }
};

// PUT /api/products/:id  [admin]
export const updateProduct = async (id, payload) => {
    // payload: { productName, productType, description, active }
    try {
        const response = await api.put(`products/${id}`, payload);
        return response;
    } catch (err) {
        console.error("Error in updateProduct:", err);
        throw err;
    }
};

// PUT /api/products/:id/deactivate  [admin]
export const deactivateProduct = async (id) => {
    try {
        const response = await api.put(`products/${id}/deactivate`);
        return response;
    } catch (err) {
        console.error("Error in deactivateProduct:", err);
        throw err;
    }
};