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