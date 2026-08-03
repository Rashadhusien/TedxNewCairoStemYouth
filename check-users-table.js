import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

const sql = neon(process.env.DATABASE_URL);

async function checkUsersTable() {
  try {
    console.log('Checking users table structure...\n');

    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;

    console.log('Current columns in users table:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });

    // Check if has_seen_welcome exists
    const hasWelcomeColumn = columns.some(col => col.column_name === 'has_seen_welcome');
    console.log(`\n✓ has_seen_welcome column exists: ${hasWelcomeColumn}`);

    // Count users
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`\n✓ Total users in table: ${userCount[0].count}`);

    // Check if users have welcome status
    if (hasWelcomeColumn) {
      const usersSeenWelcome = await sql`SELECT COUNT(*) as count FROM users WHERE has_seen_welcome = true`;
      console.log(`✓ Users who have seen welcome: ${usersSeenWelcome[0].count}`);
    }

  } catch (error) {
    console.error('Error checking table:', error);
    process.exit(1);
  }
}

checkUsersTable();