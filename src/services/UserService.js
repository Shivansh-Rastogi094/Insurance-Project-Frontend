import api from "../api/api";

export const readAllUsers=async()=>{
    try{
        const response = await api.get(`users`)
        return response
    }
    catch(err){
        console.log(err);
    }
}