import api from "../api/api"

export const LoginService = async (user) => {
    try {
        const response = await api.post(`auth/login`, user)
        return response;
    } catch (error) {
        console.error(error);
    }
}
