import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',   // our table blueprint
  out: './drizzle',               // where migration files get saved
  dbCredentials: { url: process.env.DATABASE_URL! },
});