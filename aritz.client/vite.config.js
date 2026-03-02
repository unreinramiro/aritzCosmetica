import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

// Configuración por defecto (vacía para producción)
let httpsConfig = undefined;

// INTENTAMOS CARGAR CERTIFICADOS SOLO SI ESTAMOS EN LOCAL (DONDE EXISTE DOTNET)
try {
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
        // En Vercel esto fallará porque no hay 'dotnet', así que lo atrapamos
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

    // Si llegamos aquí y existen los archivos, cargamos la config
    if (fs.existsSync(certFilePath) && fs.existsSync(keyFilePath)) {
        httpsConfig = {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        };
    }
} catch (e) {
    // Si falla algo (ej: no hay dotnet en Vercel), ignoramos el error y seguimos sin HTTPS local
    console.warn("Advertencia: No se pudieron cargar certificados SSL locales. (Esto es normal en Vercel/Netlify)");
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
            }
        },
        port: 5173,
        https: httpsConfig // Aquí pasamos la config (undefined en Vercel, real en Local)
    }
})