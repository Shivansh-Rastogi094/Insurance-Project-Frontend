import api from "../api/api";

export const readAllPayments=async()=>{
    try{
        
        const response = await api.get(`payments`)
        return response
    }
    catch(err){
        console.log(err);
    }
}

export const readMyPayements =async()=>{
    try {
        const response = await api.get(`payments/my`)
        return (response.data.content)
    } catch (error) {
        console.error("Error in readMyPayements:", error);
    }
}

export const createPayment = async (payload) => {
    try {
        const response = await api.post("payments", payload);
        return response;
    } catch (error) {
        console.error("Error in createPayment:", error);
        throw error;
    }
};