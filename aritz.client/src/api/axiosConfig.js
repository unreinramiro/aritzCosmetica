import axios from 'axios';

// Crea una instancia de Axios con una configuración base
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7273/api/'// Ruta base de tu backend
});

export default axiosInstance;