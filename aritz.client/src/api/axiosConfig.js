import axios from 'axios';

// Crea una instancia de Axios con una configuracion base
const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`
});

// Antes de cada request: adjunta el token si existe
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Si el backend responde 401 con sesión guardada (token vencido o inválido), limpia la sesión
axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
        const esAuth = err.config?.url?.includes("auth/");
        if (err.response?.status === 401 && !esAuth && localStorage.getItem("authToken")) {
            ["authToken", "userName", "userId", "isAdmin"].forEach((k) =>
                localStorage.removeItem(k)
            );
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default axiosInstance;