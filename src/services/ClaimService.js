import api from "../api/api";
export const readAllClaims=async()=>{
    try{

        const response = await api.get(`claims`)

        return response
    }
    catch(err){
        console.log(err);
    }
}

export const readMyClaims = async()=>{
    try {
        const respone = await api.get(`claims/my`)
        return respone.data.content;
    } catch (error) {
        console.log(error);
        
    }
}

export const createClaim = async (payload) => {
    try {
        const response = await api.post(`claims`, payload);
        return response;
    } catch (err) {
        console.error("Error creating claim:", err);
        throw err;
    }
};

export const agentReviewClaim = async (claimId, payload) => {
    try {
        const response = await api.put(`claims/${claimId}/review`, payload);
        return response;
    } catch (err) {
        console.error("Error submitting agent review:", err);
        throw err;
    }
};

export const adminDecisionClaim = async (claimId, payload) => {
    try {
        const response = await api.put(`claims/${claimId}/decision`, payload);
        return response;
    } catch (err) {
        console.error("Error submitting admin decision:", err);
        throw err;
    }
};