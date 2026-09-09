import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
    return {
        base: process.env.VITE_BASE_PATH || '/',
    }
})
