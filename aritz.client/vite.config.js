import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

// --- LÓGICA DE CERTIFICADOS ---
// Inicializamos la configuración HTTPS como undefined (modo HTTP simple por defecto)
let httpsConfig = undefined;

try {
    // Intentamos configurar los certificados SOLO si estamos en un entorno capaz (Local/Windows)
    const baseFolder =
        env.APPDATA !== undefined && env.APPDATA !== ''
            ? `${env.APPDATA}/ASP.NET/https`
            : `${env.HOME}/.aspnet/https`;

    const certificateName = "aritz.client";
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    // Si la carpeta no existe, intentamos crearla (esto fallará en Vercel y caerá al catch, lo cual es BUENO)
    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder, { recursive: true });
    }

    // Si los certificados no existen, intentamos generarlos con dotnet (Fallará en Vercel -> catch)
    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
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

    // Si llegamos hasta aquí y los archivos existen, cargamos la configuración HTTPS
    if (fs.existsSync(certFilePath) && fs.existsSync(keyFilePath)) {
        httpsConfig = {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        };
    }
} catch (error) {
    // SI ALGO FALLA (Ej: Vercel no tiene dotnet o permisos), NO HACEMOS NADA.
    // Simplemente dejamos httpsConfig como undefined y seguimos.
    // Esto evita que el build se rompa en producción.
    console.log("Nota: No se cargaron certificados SSL locales (Normal en Vercel/Producción).");
}

// Configuración del Proxy (Solo útil en local, ignorado en Vercel)
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
            // Agregamos proxy para /api por si usas rutas relativas en local
            '^/api': {
                target,
                secure: false
            }
        },
        port: 5173,
        // AQUÍ ESTÁ LA MAGIA:
        // Si httpsConfig tiene datos (Local) -> Usa HTTPS.
        // Si httpsConfig es undefined (Vercel) -> Usa HTTP.
        https: httpsConfig
    }
})