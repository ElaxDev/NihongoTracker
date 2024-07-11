import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    plugins: [react()],
    resolve: {
      alias: {
        'tailwind.config.js': path.resolve(__dirname, 'tailwind.config.js'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL as string,
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: ['tailwind.config.js'],
    },
    build: {
      commonjsOptions: {
        include: ['tailwind.config.js', 'node_modules/**'],
      },
    },
  };
});
