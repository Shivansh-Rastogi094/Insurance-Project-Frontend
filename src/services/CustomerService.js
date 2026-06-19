import api from "../api/api";

export const getCustomerProfile = async () => {
  try {
    const response = await api.get("customers/profile");
    return response;
  } catch (err) {
    console.error("Error in getCustomerProfile:", err);
    throw err;
  }
};

export const createCustomerProfile = async (payload) => {
  try {
    const response = await api.post("customers", payload);
    return response;
  } catch (err) {
    console.error("Error in createCustomerProfile:", err);
    throw err;
  }
};

export const readAllCustomers = async () => {
  try {
    const response = await api.get("customers");
    return response;
  } catch (err) {
    console.error("Error in readAllCustomers:", err);
    throw err;
  }
};
