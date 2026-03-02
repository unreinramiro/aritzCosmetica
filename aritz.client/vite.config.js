import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

// Detectamos si estamos en producción (Vercel sets NODE_ENV=production)
const isDevelopment = env.NODE_ENV === 'development';

// Variables para guardar la configuración de HTTPS
let httpsConfig = undefined;

// SOLO EJECUTAR LA LÓGICA DE CERTIFICADOS SI ESTAMOS EN DESARROLLO (TU PC)
if (isDevelopment) {
    const baseFolder =
        env.APPDATA !== undefined && env.APPDATA !== ''
            ? `${env.APPDATA}/ASP.NET/https`
            : `${env.HOME}/.aspnet/https`;

    const certificateName = "aritz.client";
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder, { recursive: true });
    }

    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
        // Usamos try-catch para evitar que explote si no tienes dotnet instalado (por seguridad)
        try {
            child_process.spawnSync('dotnet', [
                'dev-certs',
                'https',
                '--export-path',
                certFilePath,
                '--format',
                'Pem',
                '--no-password',
            ], { stdio: 'inherit', });
        } catch (e) {
            console.warn("No se pudo generar el certificado dotnet, continuando sin HTTPS local...");
        }
    }

    // Si los archivos existen, configuramos HTTPS
    if (fs.existsSync(certFilePath) && fs.existsSync(keyFilePath)) {
        httpsConfig = {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        };
    }
}

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
            // AGREGADO: Probablemente necesites esto para tus llamadas a la API local
            '^/api': {
                target,
                secure: false
            }
        },
        port: parseInt(env.DEV_SERVER_PORT || '50833'),
        // Aquí pasamos la configuración condicional:
        // Si es Vercel, httpsConfig será undefined (HTTP normal, Vercel pone el HTTPS encima)
        // Si es tu PC, usará los certificados de .NET
        https: httpsConfig
    }
})