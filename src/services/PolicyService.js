import api from "../api/api";

export const readAllPolicies = async () => {
    try {
        const response = await api.get("policies");
        return response;
    } catch (err) {
        console.log(err);
    }
};

export const readMyPolicies = async () => {
    try {    
        const response = await api.get("policies/my");
        // console.log(response.data.content);
        return(response.data.content);
    } catch (error) {
        console.log(error);
    }
};
