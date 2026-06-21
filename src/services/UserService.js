import api from "../api/api";

// GET /api/users?page=0&size=10
export const readAllUsers = async (page = 0, size = 10) => {
    try {
        const response = await api.get(`users`, { params: { page, size } });
        return response;
    } catch (err) {
        console.error("Error in readAllUsers:", err);
        throw err;
    }
};

// GET /api/users/:id
export const getUserById = async (id) => {
    try {
        const response = await api.get(`users/${id}`);
        return response;
    } catch (err) {
        console.error("Error in getUserById:", err);
        throw err;
    }
};

// POST /api/users/agent  [admin]
export const createAgentAccount = async (payload) => {
    // payload: { fullName, email, password, phoneNumber, role: "AGENT" }
    try {
        const response = await api.post(`users/agent`, payload);
        return response;
    } catch (err) {
        console.error("Error in createAgentAccount:", err);
        throw err;
    }
};

// PUT /api/users/:id/activate  [admin]
export const activateUser = async (id, payload) => {
    // payload: { remarks }
    try {
        const response = await api.put(`users/${id}/activate`, payload);
        return response;
    } catch (err) {
        console.error("Error in activateUser:", err);
        throw err;
    }
};

// PUT /api/users/:id/deactivate  [admin]
export const deactivateUser = async (id, payload) => {
    // payload: { remarks }
    try {
        const response = await api.put(`users/${id}/deactivate`, payload);
        return response;
    } catch (err) {
        console.error("Error in deactivateUser:", err);
        throw err;
    }
};