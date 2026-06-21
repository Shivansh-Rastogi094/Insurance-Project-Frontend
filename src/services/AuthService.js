import api from "../api/api";

// POST /api/auth/login
export const LoginService = async (user) => {
    try {
        const response = await api.post(`auth/login`, user);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// POST /api/auth/register
export const RegisterService = async (payload) => {
    try {
        const response = await api.post(`auth/register`, payload);
        return response;
    } catch (error) {
        console.error("Error in RegisterService:", error);
        throw error;
    }
};

// POST /api/auth/verify-otp
export const VerifyOtpService = async (payload) => {
    // payload: { email, otp }
    try {
        const response = await api.post(`auth/verify-otp`, payload);
        return response;
    } catch (error) {
        console.error("Error in VerifyOtpService:", error);
        throw error;
    }
};

// POST /api/auth/resend-otp
export const ResendOtpService = async (email) => {
    try {
        const response = await api.post(`auth/resend-otp`, { email });
        return response;
    } catch (error) {
        console.error("Error in ResendOtpService:", error);
        throw error;
    }
};

// POST /api/auth/verify-mobile-otp
export const VerifyMobileOtpService = async (payload) => {
    // payload: { email, otp }
    try {
        const response = await api.post(`auth/verify-mobile-otp`, payload);
        return response;
    } catch (error) {
        console.error("Error in VerifyMobileOtpService:", error);
        throw error;
    }
};
