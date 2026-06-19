import api from "../api/api";

export const readAllPlans = async () => {
  try {
    const response = await api.get(`plans`);
    return response;
  } catch (err) {
    console.error("Error in readAllPlans:", err);
    throw err;
  }
};

export const createPlan = async (payload) => {
  try {
    const response = await api.post("plans", payload);
    return response;
  } catch (err) {
    console.error("Error in createPlan:", err);
    throw err;
  }
};

export const updatePlan = async (id, payload) => {
  try {
    const response = await api.put(`plans/${id}`, payload);
    return response;
  } catch (err) {
    console.error("Error in updatePlan:", err);
    throw err;
  }
};

export const deactivatePlan = async (id) => {
  try {
    const response = await api.put(`plans/${id}/deactivate`);
    return response;
  } catch (err) {
    console.error("Error in deactivatePlan:", err);
    throw err;
  }
};
