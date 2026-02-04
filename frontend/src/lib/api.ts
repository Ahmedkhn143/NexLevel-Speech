import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get('refreshToken');
                if (refreshToken) {
                    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    Cookies.set('accessToken', data.accessToken, { expires: 1 });
                    Cookies.set('refreshToken', data.refreshToken, { expires: 7 });

                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                }
            } catch {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    signup: (data: { email: string; password: string; name?: string }) =>
        api.post('/auth/signup', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    googleAuth: (token: string) => api.post('/auth/google', { token }),
    getProfile: () => api.get('/auth/me'),
};

// User API
export const userApi = {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data: { name?: string }) => api.patch('/user/profile', data),
    getCredits: () => api.get('/user/credits'),
    getSubscription: () => api.get('/user/subscription'),
};

// Voice API
export const voiceApi = {
    cloneVoice: (formData: FormData) =>
        api.post('/voice/clone', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    getVoices: () => api.get('/voice/list'),
    getVoice: (id: string) => api.get(`/voice/${id}`),
    deleteVoice: (id: string) => api.delete(`/voice/${id}`),
};

// TTS API
export const ttsApi = {
    generate: (data: { voiceId: string; text: string; language?: string }) =>
        api.post('/tts/generate', data),
    getHistory: (page = 1, limit = 20) =>
        api.get(`/tts/history?page=${page}&limit=${limit}`),
    getGeneration: (id: string) => api.get(`/tts/${id}`),
};

// Payment API
export const paymentApi = {
    getPlans: () => api.get('/payments/plans'),
    createPayment: (data: {
        planId: string;
        billingCycle: 'MONTHLY' | 'YEARLY';
        provider: 'JAZZCASH' | 'EASYPAISA';
        mobileNumber?: string;
    }) => api.post('/payments/create', data),
    getHistory: (page = 1, limit = 20) =>
        api.get(`/payments/history?page=${page}&limit=${limit}`),
};

// Usage API
export const usageApi = {
    getHistory: (page = 1, limit = 50) =>
        api.get(`/usage/history?page=${page}&limit=${limit}`),
    getStats: () => api.get('/usage/stats'),
};
