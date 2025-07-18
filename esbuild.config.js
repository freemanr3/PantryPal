import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['server/src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outdir: 'dist/server',
  format: 'esm',
  banner: {
    js: `
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
      import { fileURLToPath } from 'url';
      import { dirname } from 'path';
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
    `
  },
  external: [
    '@aws-sdk/*',
    'aws-crt',
    'pg-native',
    'sqlite3',
    'pg-query-stream',
    'oracledb',
    'better-sqlite3',
    'tedious',
    'mysql2',
    'mysql'
  ]
}); 