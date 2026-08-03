import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

const sql = neon(process.env.DATABASE_URL);

async function addWelcomeColumn() {
  try {
    console.log('Adding has_seen_welcome column to users table...');
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_seen_welcome" boolean DEFAULT false NOT NULL`;
    console.log('✓ Column added successfully!');
  } catch (error) {
    console.error('Error adding column:', error);
    process.exit(1);
  }
}

addWelcomeColumn();