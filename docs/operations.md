# Tape operations

## Ownership and services

GitHub repository: `zinnoberHaus/tape`. Vercel project `tape` in the existing `my-team-ae70891f` team. Dedicated Vercel Marketplace Neon resource: `tape-db` (Free plan), region `iad1`. No existing product databases are reused.

Authentication is managed by Neon. Users, passwords, sessions, recovery and account controls use the managed Better Auth service. Open Tape's Vercel Storage resource, then Neon Auth → Users to administer accounts. Do not manually copy passwords or promote the first public signup automatically.

## Deploy

1. Run unit checks, typecheck and a production build.
2. Apply the idempotent additive migration with `npm run db:migrate`, targeting the intended database environment. It creates workspace and quota tables and links their UUID owner columns to managed identities with cascading deletion. Any orphaned prototype rows are removed before adding the foreign keys.
3. Confirm all environments have `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and `NEON_AUTH_COOKIE_SECRET`. Marketplace provisioning may briefly use the placeholder `provisioning`; wait for a real HTTPS URL and pull again before building.
4. `vercel deploy --prod --scope my-team-ae70891f`.
5. Verify the public landing/demo, protected workspace redirect, real signup/login and saved workspace against the live alias. Verify unauthenticated API access is denied.

The app never accepts a user ID from clients for workspace ownership. The Postgres credential is server-only. AI requests require a session, a same-origin request, a size-limited payload and an atomic daily quota. Source data for the AI prompt is assembled on the server.

## Recovery and backups

Keep the deployment URL and source commit for each release. Use `vercel rollback <known-good-deployment-url> --scope my-team-ae70891f` to restore the previous app artifact. Do not undo a schema migration by dropping user tables. The initial schema is additive and compatible with previous deployments.

Before future destructive schema changes, export using `pg_dump` with `DATABASE_URL_UNPOOLED` into a private backup destination, or create a Neon branch/snapshot. Never commit a backup. Restore to an isolated branch and validate row counts/ownership before changing the app's database target. Neon restore retention is plan-specific; do not assume indefinite backups on Free. Backup/restore and rollback are documented procedures, not claimed disaster-recovery exercises.

Rotate the cookie secret by updating the Vercel environment and redeploying; active cookie caches will need renewal. Configure a dedicated SMTP sender and production email verification policy in Neon before onboarding customers at scale. Shared SMTP has limits and unverified email addresses should not establish privileged access.

## Data limitations and costs

Neon was provisioned on Free. Hosting uses the team's existing Vercel plan. AI consumes the team's Gateway credits at the chosen model's current rate; the app caps each user at 30 requests/day. Upgrade storage or buy licensed feeds only under a separately agreed budget.

Reference docs checked 2026-10-10: [Neon Next.js integration](https://neon.com/docs/auth/quick-start/nextjs-api-only), [Neon auth production checklist](https://neon.com/docs/auth/production-checklist), [Vercel OIDC authentication](https://vercel.com/docs/ai-gateway/authentication-and-byok/oidc).

## Administrator access

Register your own account, then use Neon Auth → Users → Make admin for that specific account. Sign in again and open `/admin`. The app lists/searches users and supports disabling/enabling accounts and revoking sessions through Neon's managed admin APIs. Regular accounts are rejected by the backend. There is no automatic first-user privilege escalation. The first administrator email is intentionally not guessed.

Account self-deletion requires the current password. It reauthenticates through Neon, signs out, then removes that same user's identity record. Foreign keys cascade the deletion to workspace and quota records. The managed service does not expose the upstream `delete-user` endpoint in this project, so Tape owns this narrowly scoped endpoint.
