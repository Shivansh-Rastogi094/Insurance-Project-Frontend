import api from "../api/api";

 const token ="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBpbnN1cmFuY2UuY29tIiwiaWF0IjoxNzgxNTk4NTMzLCJleHAiOjE3ODE2ODQ5MzN9.VfRV1ctkmIMIHyeuAb6cGgWrwTVbnOR0li3jI4GiFy06eUVq0F5Di7nFHEXdd3-q";

export const readAllUsers=async()=>{
    try{

        const response = await api.get(`users`,{
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })

        return response
    }
    catch(err){
        console.log(err);
    }
}