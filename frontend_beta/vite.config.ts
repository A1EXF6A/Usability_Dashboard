import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5000,
        host: true, // Allow access from outside localhost
        allowedHosts: true,
        proxy: {
            '/api': {
                // In Docker, Nginx handles the proxy. For local dev, use Vite proxy
                target: process.env.DOCKER ? 'http://localhost:8080' : 'http://localhost:5062',
                changeOrigin: true,
            },
        },
    },
})