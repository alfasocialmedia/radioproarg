import axios from "axios";

// Al estar en un esquema Multi-Tenant, las llamadas API a veces enviarán el subdominio
// Actualmente podemos detectarlo dinámicamente si fuera producción, 
// o enviar un Header X-Tenant-Id duro para testing

export const api = axios.create({
    baseURL: "http://localhost:4000/api/v1", // Cambiar en Prod
});

// Interceptor para inyectar automáticamente el Tenant (Emisora) 
// a modo de pruebas, forzaremos "emisora-demo" si no estamos bajo un dominio real.
api.interceptors.request.use((config) => {
    // 1. Inyectar Tenant (Emisora)
    let tenantId = 'demo';
    if (typeof window !== 'undefined') {
        // Priorizamos tenant_id (set por el portal o por SuperAdmin al gestionar)
        // sobre radioId (set por el admin panel persistente)
        tenantId = localStorage.getItem('tenant_id') || localStorage.getItem('radioId') || 'demo';
    }
    config.headers['X-Tenant-Id'] = tenantId;

    // 2. Inyectar Token de Autenticación
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // 3. Log de depuración
    // console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} | Tenant: ${tenantId}`);

    return config;
});

// Interceptor para manejar respuestas (Ej: Token expirado)
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
