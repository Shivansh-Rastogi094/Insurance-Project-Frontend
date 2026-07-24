import api from "../api/api";

// POST /api/queries (submit inquiry form)
export const submitQuery = async (payload) => {
    // payload: { fullName, email, subject, message }
    try {
        const response = await api.post("queries", payload);
        return response.data;
    } catch (error) {
        console.error("Error in submitQuery:", error);
        throw error;
    }
};

// GET /api/queries/my?page=0&size=10 (logged in customer queries)
export const readMyQueries = async (page = 0, size = 50) => {
    try {
        const response = await api.get("queries/my", { params: { page, size } });
        return response.data?.content || response.data || [];
    } catch (error) {
        console.error("Error in readMyQueries:", error);
        throw error;
    }
};

// GET /api/queries?page=0&size=10 (admin/agent view all queries)
export const readAllQueries = async (page = 0, size = 50) => {
    try {
        const response = await api.get("queries", { params: { page, size } });
        return response;
    } catch (error) {
        console.error("Error in readAllQueries:", error);
        throw error;
    }
};

// PUT /api/queries/:id/reply (admin/agent reply to query)
export const replyToQuery = async (id, payload) => {
    // payload: { response, status }
    try {
        const response = await api.put(`queries/${id}/reply`, payload);
        return response.data;
    } catch (error) {
        console.error("Error in replyToQuery:", error);
        throw error;
    }
};
