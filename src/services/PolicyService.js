import api from "../api/api";

// GET /api/policies?page=0&size=10  [admin]
export const readAllPolicies = async (page = 0, size = 10) => {
    try {
        const response = await api.get("policies", { params: { page, size } });
        return response;
    } catch (err) {
        console.error("Error in readAllPolicies:", err);
        throw err;
    }
};

// GET /api/policies/my?page=0&size=10
export const readMyPolicies = async (page = 0, size = 10) => {
    try {
        const response = await api.get("policies/my", { params: { page, size } });
        return response.data.content;
    } catch (error) {
        console.error("Error in readMyPolicies:", error);
        throw error;
    }
};

// GET /api/policies/:id
export const getPolicyById = async (id) => {
    try {
        const response = await api.get(`policies/${id}`);
        return response;
    } catch (err) {
        console.error("Error in getPolicyById:", err);
        throw err;
    }
};

// POST /api/policies/purchase  (customer)
export const purchasePolicy = async (payload) => {
    // payload: { planId, startDate }
    try {
        const response = await api.post("policies/purchase", payload);
        return response;
    } catch (err) {
        console.error("Error in purchasePolicy:", err);
        throw err;
    }
};

// POST /api/policies/issue  [admin]
export const issuePolicy = async (payload) => {
    // payload: { customerId, planId, startDate }
    try {
        const response = await api.post("policies/issue", payload);
        return response;
    } catch (err) {
        console.error("Error in issuePolicy:", err);
        throw err;
    }
};

// PUT /api/policies/:id/cancel
export const cancelPolicy = async (id) => {
    try {
        const response = await api.put(`policies/${id}/cancel`);
        return response;
    } catch (err) {
        console.error("Error in cancelPolicy:", err);
        throw err;
    }
};
