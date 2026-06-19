import api from "../api/api";

export const readAllProducts=async()=>{
    try{
        const response = await api.get(`products`)
        return response
    }
    catch(err){
        console.log(err);
    }
}

export const createProduct = async (payload) => {
    try {
        const response = await api.post("products", payload);
        return response;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const updateProduct = async (id, payload) => {
    try {
        const response = await api.put(`products/${id}`, payload);
        return response;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const deactivateProduct = async (id) => {
    try {
        const response = await api.put(`products/${id}/deactivate`);
        return response;
    } catch (err) {
        console.log(err);
        throw err;
    }
};