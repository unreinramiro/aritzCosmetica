import axios from 'axios';

// Crea una instancia de Axios con una configuración base
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : 'https://localhost:7273/api'
});

export default axiosInstance;