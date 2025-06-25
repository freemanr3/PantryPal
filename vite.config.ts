import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    root: 'client/src',
    publicDir: '../../public',
    build: {
      outDir: '../../dist/client',
      emptyOutDir: true,
      sourcemap: mode === 'development',
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'aws-amplify'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './client/src'),
        '@components': path.resolve(__dirname, './client/src/components'),
        '@features': path.resolve(__dirname, './client/src/features'),
        '@hooks': path.resolve(__dirname, './client/src/hooks'),
        '@services': path.resolve(__dirname, './client/src/services'),
        '@utils': path.resolve(__dirname, './client/src/utils'),
        '@styles': path.resolve(__dirname, './client/src/styles'),
        '@assets': path.resolve(__dirname, './client/src/assets'),
        '@shared': path.resolve(__dirname, './shared')
      }
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: mode === 'production'
        }
      }
    }
  };
}); 