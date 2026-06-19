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
