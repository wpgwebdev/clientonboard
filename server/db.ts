import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from "dotenv";
dotenv.config();
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool with SSL for production (Render, etc.)
const poolConfig: any = { connectionString: process.env.DATABASE_URL };

// Enable SSL for production databases (like Render PostgreSQL)
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('render')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolConfig);
export const db = drizzle({ client: pool, schema });
