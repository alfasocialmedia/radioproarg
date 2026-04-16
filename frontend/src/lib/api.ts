import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:4000/api/v1", 
});

api.interceptors.request.use((config) => {
    let tenantId = 'demo';
    if (typeof window !== 'undefined') {
        tenantId = localStorage.getItem('tenant_id') || localStorage.getItem('radioId') || 'demo';
    }
    config.headers['X-Tenant-Id'] = tenantId;

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || (error.response?.status === 403 && error.response?.data?.code === 'AUTH_REQUIRED')) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_role');
                localStorage.removeItem('tenant_id');
                localStorage.removeItem('radioId');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
