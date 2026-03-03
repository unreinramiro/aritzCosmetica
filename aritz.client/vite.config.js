import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

// --- LÓGICA DE CERTIFICADOS ---
let httpsConfig = undefined;

// Intentamos cargar certificados SOLO si estamos en local
try {
    const baseFolder =
        env.APPDATA !== undefined && env.APPDATA !== ''
            ? `${env.APPDATA}/ASP.NET/https`
            : `${env.HOME}/.aspnet/https`;

    const certificateName = "aritz.client";
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    // SOLO intentamos crear certificados si la carpeta base existe (indicador de entorno .NET local)
    // O si estamos seguros de que no es Vercel (Vercel no tiene APPDATA definido igual que Windows)
    if (fs.existsSync(baseFolder)) {
        if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
            // Intentamos generar certificados con dotnet
            console.log("Generando certificados SSL locales...");
            child_process.spawnSync('dotnet', [
                'dev-certs',
                'https',
                '--export-path',
                certFilePath,
                '--format',
                'Pem',
                '--no-password',
            ], { stdio: 'inherit', });
        }
    }

    // Si los archivos existen, cargamos la configuración HTTPS
    if (fs.existsSync(certFilePath) && fs.existsSync(keyFilePath)) {
        httpsConfig = {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        };
        console.log("HTTPS habilitado correctamente.");
    } else {
        console.log("No se encontraron certificados SSL. Iniciando en modo HTTP simple.");
    }
} catch (error) {
    console.error("Error al configurar HTTPS local (Ignorar en Vercel):", error.message);
}

// Configuración del Proxy (Solo útil en local)
const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7273';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '^/weatherforecast': {
                target,
                secure: false
            },
            '^/api': {
                target,
                secure: false
            }
        },
        port: 5173,
        // Si httpsConfig tiene datos -> HTTPS. Si es undefined -> HTTP.
        https: httpsConfig
    }
})