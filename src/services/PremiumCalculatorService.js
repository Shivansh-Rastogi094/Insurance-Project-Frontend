import api from "../api/api";

/**
 * POST /api/calculator/premium
 * @param {Object} payload { coverageAmount, durationYears, premiumType, productType, age }
 */
export const calculateAutomaticPremium = async (payload) => {
    try {
        const response = await api.post("calculator/premium", payload);
        return response.data;
    } catch (error) {
        console.error("Error in calculateAutomaticPremium:", error);
        throw error;
    }
};

/**
 * GET /api/calculator/premium
 */
export const getAutomaticPremiumQuote = async (coverageAmount, durationYears = 1, premiumType = "ANNUAL", productType = "LIFE", age = 30) => {
    try {
        const response = await api.get("calculator/premium", {
            params: { coverageAmount, durationYears, premiumType, productType, age }
        });
        return response.data;
    } catch (error) {
        console.error("Error in getAutomaticPremiumQuote:", error);
        throw error;
    }
};
