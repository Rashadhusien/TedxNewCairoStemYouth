import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

const sql = neon(process.env.DATABASE_URL);

async function createAuditLogsTable() {
  try {
    console.log('Creating audit_category enum...');
    await sql`DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_category') THEN
        CREATE TYPE audit_category AS ENUM ('admin', 'order', 'payment', 'ticket', 'promo_code', 'email', 'auth');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_status') THEN
        CREATE TYPE audit_status AS ENUM ('success', 'failure', 'info');
      END IF;
    END
    $$;`;

    console.log('Creating audit_logs table...');
    await sql`CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "actor_user_id" uuid,
      "actor_email" varchar(255),
      "actor_name" varchar(255),
      "category" "audit_category" NOT NULL,
      "action" varchar(100) NOT NULL,
      "entity_type" varchar(50) NOT NULL,
      "entity_id" varchar(100),
      "summary" text NOT NULL,
      "metadata" jsonb,
      "status" "audit_status" DEFAULT 'success' NOT NULL,
      "ip_address" varchar(45),
      "created_at" timestamp DEFAULT now() NOT NULL
    );`;

    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");`;
    await sql`CREATE INDEX IF NOT EXISTS "audit_logs_category_created_at_idx" ON "audit_logs" USING btree ("category","created_at");`;
    await sql`CREATE INDEX IF NOT EXISTS "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_user_id");`;

    console.log('Adding foreign key...');
    await sql`ALTER TABLE "audit_logs"
      ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk"
      FOREIGN KEY ("actor_user_id") REFERENCES "users"("id")
      ON DELETE no action ON UPDATE no action;`;

    console.log('✓ audit_logs table created successfully!');
  } catch (error) {
    console.error('Error creating audit_logs table:', error);
    process.exit(1);
  }
}

createAuditLogsTable();