import api from "../api/api";

// GET /api/plans?page=0&size=10
export const readAllPlans = async (page = 0, size = 10) => {
    try {
        const response = await api.get(`plans`, { params: { page, size } });
        return response;
    } catch (err) {
        console.error("Error in readAllPlans:", err);
        throw err;
    }
};

// GET /api/plans/:id
export const getPlanById = async (id) => {
    try {
        const response = await api.get(`plans/${id}`);
        return response;
    } catch (err) {
        console.error("Error in getPlanById:", err);
        throw err;
    }
};

// POST /api/plans  [admin]
export const createPlan = async (payload) => {
    // payload: { productId, planName, coverageAmount, premiumAmount, premiumType, duration, termsAndConditions, active }
    try {
        const response = await api.post("plans", payload);
        return response;
    } catch (err) {
        console.error("Error in createPlan:", err);
        throw err;
    }
};

// PUT /api/plans/:id  [admin]
export const updatePlan = async (id, payload) => {
    // payload: { productId, planName, coverageAmount, premiumAmount, premiumType, duration, termsAndConditions, active }
    try {
        const response = await api.put(`plans/${id}`, payload);
        return response;
    } catch (err) {
        console.error("Error in updatePlan:", err);
        throw err;
    }
};

// PUT /api/plans/:id/deactivate  [admin]
export const deactivatePlan = async (id) => {
    try {
        const response = await api.put(`plans/${id}/deactivate`);
        return response;
    } catch (err) {
        console.error("Error in deactivatePlan:", err);
        throw err;
    }
};
