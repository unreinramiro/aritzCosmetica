import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// ESTA ES LA CONFIGURACIÓN MÁS SIMPLE POSIBLE
// Sin certificados, sin dotnet, sin proxies complejos.
// Esto funcionará en Vercel sí o sí.

export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        port: 5173
    }
})