import {neon} from '@neondatabase/serverless';
const sql=neon(process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL);
await sql`CREATE TABLE IF NOT EXISTS tape_workspace(user_id text PRIMARY KEY,data jsonb NOT NULL DEFAULT '{}'::jsonb,updated_at timestamptz NOT NULL DEFAULT now())`;
await sql`CREATE TABLE IF NOT EXISTS tape_ai_usage(user_id text NOT NULL,day date NOT NULL DEFAULT CURRENT_DATE,requests integer NOT NULL DEFAULT 0,PRIMARY KEY(user_id,day))`;
await sql`REVOKE ALL ON tape_workspace,tape_ai_usage FROM PUBLIC`;
console.log('Tape workspace and AI quota tables are ready.');
// Account deletion must also delete private workspace and usage records.
await sql`DELETE FROM tape_workspace WHERE NOT EXISTS (SELECT 1 FROM neon_auth."user" u WHERE u.id::text=tape_workspace.user_id::text)`;
await sql`DELETE FROM tape_ai_usage WHERE NOT EXISTS (SELECT 1 FROM neon_auth."user" u WHERE u.id::text=tape_ai_usage.user_id::text)`;
await sql`ALTER TABLE tape_workspace ALTER COLUMN user_id TYPE uuid USING user_id::uuid`;
await sql`ALTER TABLE tape_ai_usage ALTER COLUMN user_id TYPE uuid USING user_id::uuid`;
await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='tape_workspace_owner_fk') THEN ALTER TABLE tape_workspace ADD CONSTRAINT tape_workspace_owner_fk FOREIGN KEY(user_id) REFERENCES neon_auth."user"(id) ON DELETE CASCADE; END IF; IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='tape_ai_usage_owner_fk') THEN ALTER TABLE tape_ai_usage ADD CONSTRAINT tape_ai_usage_owner_fk FOREIGN KEY(user_id) REFERENCES neon_auth."user"(id) ON DELETE CASCADE; END IF; END $$`;
console.log('Account deletion cascades verified by foreign keys.');
