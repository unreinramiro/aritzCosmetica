import axios from 'axios';

// Crea una instancia de Axios con una configuración base
const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`
});

export default axiosInstance;