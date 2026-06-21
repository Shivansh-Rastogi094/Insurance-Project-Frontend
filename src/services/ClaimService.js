import api from "../api/api";

// GET /api/claims?page=0&size=10  [admin/agent]
export const readAllClaims = async (page = 0, size = 10) => {
    try {
        const response = await api.get(`claims`, { params: { page, size } });
        return response;
    } catch (err) {
        console.error("Error in readAllClaims:", err);
        throw err;
    }
};

// GET /api/claims/my?page=0&size=10
export const readMyClaims = async (page = 0, size = 10) => {
    try {
        const response = await api.get(`claims/my`, { params: { page, size } });
        return response.data.content;
    } catch (error) {
        console.error("Error in readMyClaims:", error);
        throw error;
    }
};

// GET /api/claims/:id
export const getClaimById = async (id) => {
    try {
        const response = await api.get(`claims/${id}`);
        return response;
    } catch (err) {
        console.error("Error in getClaimById:", err);
        throw err;
    }
};

// POST /api/claims  (multipart/form-data)
// payload should be a FormData object with:
//   - "claim" (JSON string): { policyId, claimAmount, claimReason, incidentDate }
//   - "files" (File[]): supporting documents
export const createClaim = async (payload) => {
    try {
        const response = await api.post(`claims`, payload, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response;
    } catch (err) {
        console.error("Error creating claim:", err);
        throw err;
    }
};

// PUT /api/claims/:id/review  [agent]
export const agentReviewClaim = async (claimId, payload) => {
    // payload: { recommendedStatus, remarks }
    try {
        const response = await api.put(`claims/${claimId}/review`, payload);
        return response;
    } catch (err) {
        console.error("Error submitting agent review:", err);
        throw err;
    }
};

// PUT /api/claims/:id/decision  [admin]
export const adminDecisionClaim = async (claimId, payload) => {
    // payload: { finalDecisionStatus, remarks }
    try {
        const response = await api.put(`claims/${claimId}/decision`, payload);
        return response;
    } catch (err) {
        console.error("Error submitting admin decision:", err);
        throw err;
    }
};