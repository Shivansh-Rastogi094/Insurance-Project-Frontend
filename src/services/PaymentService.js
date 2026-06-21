import api from "../api/api";

// GET /api/payments?page=0&size=10  [admin]
export const readAllPayments = async (page = 0, size = 10) => {
    try {
        const response = await api.get(`payments`, { params: { page, size } });
        return response;
    } catch (err) {
        console.error("Error in readAllPayments:", err);
        throw err;
    }
};

// GET /api/payments/my?page=0&size=10
export const readMyPayements = async (page = 0, size = 10) => {
    try {
        const response = await api.get(`payments/my`, { params: { page, size } });
        return response.data.content;
    } catch (error) {
        console.error("Error in readMyPayements:", error);
        throw error;
    }
};

// GET /api/payments/:id  [admin]
export const getPaymentById = async (id) => {
    try {
        const response = await api.get(`payments/${id}`);
        return response;
    } catch (err) {
        console.error("Error in getPaymentById:", err);
        throw err;
    }
};

// GET /api/payments/policy/:policyId
export const getPaymentsByPolicy = async (policyId) => {
    try {
        const response = await api.get(`payments/policy/${policyId}`);
        return response;
    } catch (err) {
        console.error("Error in getPaymentsByPolicy:", err);
        throw err;
    }
};

// POST /api/payments
export const createPayment = async (payload) => {
    // payload: { policyId, amount, paymentMode, transactionReference, paymentStatus }
    try {
        const response = await api.post("payments", payload);
        return response;
    } catch (error) {
        console.error("Error in createPayment:", error);
        throw error;
    }
};