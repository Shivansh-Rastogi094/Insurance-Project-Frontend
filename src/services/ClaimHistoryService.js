import api from "../api/api";

// GET /api/claim-history/:claimId
export const getClaimHistory = async (claimId) => {
    try {
        const response = await api.get(`claim-history/${claimId}`);
        return response;
    } catch (err) {
        console.error("Error in getClaimHistory:", err);
        throw err;
    }
};
