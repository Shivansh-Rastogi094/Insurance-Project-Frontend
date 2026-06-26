import api from "../api/api";
// Touch comment to invalidate Vite dev server cache for AuthService exports

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

// POST /api/auth/forgot-password
export const ForgotPasswordService = async (email) => {
    try {
        const response = await api.post(`auth/forgot-password`, null, {
            params: { email }
        });
        return response;
    } catch (error) {
        console.error("Error in ForgotPasswordService:", error);
        throw error;
    }
};

// POST /api/auth/reset-password
export const ResetPasswordService = async (payload) => {
    // payload: { email, otp, newPassword }
    try {
        const response = await api.post(`auth/reset-password`, null, {
            params: payload
        });
        return response;
    } catch (error) {
        console.error("Error in ResetPasswordService:", error);
        throw error;
    }
};
