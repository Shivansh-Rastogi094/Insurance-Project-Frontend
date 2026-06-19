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
        const respone = await api.get(`payments/my`)
        return (respone.data.content)
    } catch (error) {
        
    }
}