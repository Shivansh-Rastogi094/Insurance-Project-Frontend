import api from "../api/api";

// GET /api/customers/profile  (logged-in customer)
export const getCustomerProfile = async () => {
    try {
        const response = await api.get("customers/profile");
        return response;
    } catch (err) {
        console.error("Error in getCustomerProfile:", err);
        throw err;
    }
};

// GET /api/customers/:id  [admin]
export const getCustomerById = async (id) => {
    try {
        const response = await api.get(`customers/${id}`);
        return response;
    } catch (err) {
        console.error("Error in getCustomerById:", err);
        throw err;
    }
};

// GET /api/customers?page=0&size=10  [admin]
export const readAllCustomers = async (page = 0, size = 10) => {
    try {
        const response = await api.get("customers", { params: { page, size } });
        return response;
    } catch (err) {
        console.error("Error in readAllCustomers:", err);
        throw err;
    }
};

// POST /api/customers  (customer creates own profile)
export const createCustomerProfile = async (payload) => {
    // payload: { dateOfBirth, address, city, state, pinCode, nomineeName, nomineeRelation }
    try {
        const response = await api.post("customers", payload);
        return response;
    } catch (err) {
        console.error("Error in createCustomerProfile:", err);
        throw err;
    }
};

// PUT /api/customers/:id  (customer updates own profile)
export const updateCustomerProfile = async (id, payload) => {
    // payload: { dateOfBirth, address, city, state, pinCode, nomineeName, nomineeRelation }
    try {
        const response = await api.put(`customers/${id}`, payload);
        return response;
    } catch (err) {
        console.error("Error in updateCustomerProfile:", err);
        throw err;
    }
};
