import * as dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'path';
import { DataSource } from 'typeorm';
// Load .env when running CLI (helps local dev)
dotenv.config();

// If root .env doesn't provide DB creds (we keep a dev.env in the repo),
// try loading src/config/env/dev.env as a fallback so CLI works without extra setup.
try {
  if (!process.env.POSTGRES_PASSWORD) {
    // Use process.cwd() because __dirname (from import.meta) isn't available yet
    const devEnvPath = path.join(
      process.cwd(),
      'src',
      'config',
      'env',
      'dev.env',
    );
    const exists = fs.existsSync(devEnvPath);
    console.log('Attempting to load dev env at', devEnvPath, 'exists=', exists);
    if (exists) {
      const raw = fs.readFileSync(devEnvPath, { encoding: 'utf8' });
      raw.split(/\r?\n/).forEach((line) => {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (m) {
          const key = m[1];
          let val = m[2] ?? '';
          if (
            (val.startsWith("'") && val.endsWith("'")) ||
            (val.startsWith('"') && val.endsWith('"'))
          ) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) process.env[key] = val;
        }
      });
      console.log(
        'Loaded dev env; POSTGRES_PASSWORD present=',
        !!process.env.POSTGRES_PASSWORD,
      );
    }
  }
} catch (e) {
  console.error('Failed to load dev env fallback', e);
}

const host = process.env.POSTGRES_HOST ?? 'localhost';
const port = Number(process.env.POSTGRES_PORT ?? 5432);
const username = process.env.POSTGRES_USER ?? 'postgres';
const password = process.env.POSTGRES_PASSWORD ?? '';
const database = process.env.POSTGRES_DATABASE ?? 'postgres';
const synchronize = (process.env.POSTGRES_SYNCHRONIZE ?? 'false') === 'true';

// Debug info for CLI runs (developer only)
console.log(
  'TypeORM datasource using host=%s port=%s user=%s passwordType=%s db=%s',
  host,
  port,
  username,
  typeof process.env.POSTGRES_PASSWORD,
  database,
);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password: password || undefined,
  database,
  synchronize,
  logging: false,
  entities: [
    path.join(process.cwd(), 'src', 'databases', 'entities', '*{.ts,.js}'),
  ],
  migrations: [
    path.join(
      process.cwd(),
      'src',
      'databases',
      'migrations',
      '*{.ts,.js,.sql}',
    ),
  ],
});

// Export only the named AppDataSource (TypeORM CLI requires a single DataSource export)
