import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
const useLocalProxy = false;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: useLocalProxy ? 'http://127.0.0.1:8787/' : 'https://josh412.xyz/scheduler',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  }
})
