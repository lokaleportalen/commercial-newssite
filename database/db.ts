import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "dotenv";
import { resolve } from "path";
import * as schema from "./schema/auth-schema";

// Load .env from parent directory
config({ path: resolve(__dirname, "../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') || process.env.DATABASE_URL?.includes('vercel') || process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export const db = drizzle(pool, { schema });
