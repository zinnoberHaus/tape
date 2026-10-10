# Tape

[Open Tape](https://tape-five-zeta.vercel.app) · [Try the demo](https://tape-five-zeta.vercel.app/demo)

Investment research workspace implemented from the supplied **Tape App v2** design. Next.js 16, React 19, Neon managed authentication and Postgres, deployed on Vercel.

The design dataset is **illustrative**: prices, disclosures, news, charts, scores and options estimates are sample content, not live market information. No trades or brokerage connections. Account and workspace persistence use real services.

## Run locally

```sh
npm ci
vercel link --project tape --scope my-team-ae70891f
vercel env pull .env.local
# Set NEON_AUTH_COOKIE_SECRET to a random secret of at least 32 characters.
npm run db:migrate
npm run dev
```

Open http://localhost:43817. Do not commit `.env*` or `.vercel/`.

## Features

- Landing page, public demo, signup/login, password recovery, onboarding and account settings.
- Full v2 research workspace: briefing, opportunities, ticker charts and event lanes, Congress/insider/13F tracking, options flow, news and earnings, portfolio scenarios and alert builder.
- Personal watchlists, tracked setups, followed investors, holdings and alert rules saved to Postgres. Each server request derives ownership from a verified session.
- CSV/text holdings import for the sample dataset's symbols. No screenshot extraction.
- Ask Tape through Vercel AI Gateway, grounded in the sample dataset. Login required, maximum 30 requests per user per UTC day.
- Audio sample briefing through browser speech synthesis.

See the [landing-page research and verification](docs/landing-redesign.md) for the marketing design, SEO configuration and mobile checks.

## Source structure

`src/design/tape.html` is the adapted supplied design. `npm run compile:design` generates `src/components/tape-view.jsx` and hover styles at build preparation time; both generated files are committed. There is no browser template evaluator or external design-runtime dependency. `tape-model.js` retains the design's calculations and example dataset. `tape-app.jsx` adds real persistence and imports.

## Checks

```sh
npm run compile:design
npm test
npm run typecheck
npm run build
# Start the dev server first; integration tests create and delete disposable accounts.
node --env-file=.env.local node_modules/@playwright/test/cli.js test
```

The account integration test uses the configured auth backend and one small AI request. It never uses customer credentials. See [operations](docs/operations.md) and [verification](docs/verification.md).

## Current boundaries

Live market/news/disclosure subscriptions, live alert delivery and historical backtesting are not connected. Saved rules do not claim to send notifications. AI responses analyze illustrative information. Neon shared SMTP is suitable for this initial app/demo; configure a dedicated sender for a public customer launch. No subscription billing is enabled.
