import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

// Load environment variables
// Note: The team will need to create a .env file with the DATABASE_URL
// For example: DATABASE_URL="postgresql://user:password@host:port/db"

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// For query purposes
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
