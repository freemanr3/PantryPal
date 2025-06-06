import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh in development
      fastRefresh: true,
      // Exclude test files from transformation
      exclude: /\.test\.(tsx?|jsx?)$/,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/shared": path.resolve(__dirname, "./shared"),
    },
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 5179,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    },
    watch: {
      usePolling: true
    },
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@radix-ui/react-tabs',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-toast',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-label',
      '@radix-ui/react-progress',
      '@radix-ui/react-scroll-area',
      'embla-carousel-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'wouter',
      '@tanstack/react-query',
      'lucide-react',
      'framer-motion'
    ],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
      platform: 'browser',
      supported: {
        'top-level-await': true
      }
    }
  },
  build: {
    // Disable source maps in production for smaller bundles
    sourcemap: process.env.NODE_ENV === 'development',
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Enable minification
    minify: 'esbuild',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: (id) => {
          // AWS Amplify chunks
          if (id.includes('aws-amplify')) {
            return 'aws-amplify';
          }
          // Radix UI components
          if (id.includes('@radix-ui/')) {
            return 'radix';
          }
          // React ecosystem
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react';
          }
          // UI utilities
          if (id.includes('lucide-react') || id.includes('framer-motion')) {
            return 'ui-libs';
          }
          // Core vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            if (id.includes('wouter')) {
              return 'router';
            }
            return 'vendor';
          }
        },
        // Optimize file naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'chunk'
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType ?? '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        entryFileNames: `assets/[name]-[hash].js`,
      },
      // Enable tree shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize for production
    assetsInlineLimit: 4096, // 4kb
  },
  // Environment variables optimization
  define: {
    // Remove console logs in production
    'console.log': process.env.NODE_ENV === 'production' ? '(() => {})' : 'console.log',
    'console.warn': process.env.NODE_ENV === 'production' ? '(() => {})' : 'console.warn',
    'console.error': process.env.NODE_ENV === 'production' ? 'console.error' : 'console.error',
  },
  // Enable esbuild optimization
  esbuild: {
    // Remove console and debugger statements in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Minify identifiers
    minifyIdentifiers: process.env.NODE_ENV === 'production',
    // Minify syntax
    minifySyntax: process.env.NODE_ENV === 'production',
    // Minify whitespace
    minifyWhitespace: process.env.NODE_ENV === 'production',
  },
}) 