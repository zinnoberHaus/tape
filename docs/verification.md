# Verification — 2026-10-10

Scope: implement the supplied Tape App v2 design as a deployed web application with user management. The referenced brief asks for a clickable research prototype, with no brokerage linking.

## Evidence

- v2 HTML converted to committed React source, retaining its complete seven-screen workspace and AI drawer. The original v1 export is superseded by v2.
- Landing page, onboarding, signup/login/recovery, account settings, and administrator user management added around the supplied workspace.
- Dedicated Neon database/auth service provisioned through Vercel Marketplace, with real account and workspace persistence.
- Production build succeeds with Next.js 16.4 / React 19.3. All packages pinned with a lockfile.
- Parser/schema tests cover fractional CSV positions, malformed input, duplicate positions, partial watchlists and ownership-field injection.
- Browser tests cover navigation, filtering, ticker search, charts, portfolio imports, responsive rendering and anonymous route protection.
- Account integration tests passed for real signup, onboarding, workspace persistence, isolation across two accounts, origin and ownership rejection, one live AI answer, profile/security screens, signout/login, password-confirmed self-deletion, role enforcement, disabling/re-enabling accounts and session revocation.
- Final local run against the production build: 4 browser tests passed; 3 unit tests passed; typecheck/build passed; production dependency audit reported 0 vulnerabilities. AI chat labels are server-enforced and protected handlers bypass the session cookie cache.

Generated screenshots and test traces are local in `artifacts/`, excluded from source control. Test identities use unique `tape-qa-…@example.invalid` addresses and are removed after testing. No customer account is used.

## Design and scope mapping

| Requirement | Implemented surface |
| --- | --- |
| Single investor brand | Shared Tape identity, v2 dark palette, green/red signal language, Geist typography |
| Home / briefing | `/app#home`, sample audio briefing |
| Ticker deep-dive and technicals | `/app#ticker/VST`, ranges, overlays, source-event lanes, example options payoffs |
| Smart money | `/app#smart`, Congress, insiders, funds / 13F tabs |
| Options flow | Smart money options tab, filters and print detail |
| News, sentiment and earnings | `/app#news`, story detail, linked tickers, catalyst calendar |
| Opportunities / screener | `/app#opps`, presets, directional filters, natural-language screening |
| AI analyst | Ask Tape drawer, server-grounded sample analysis through Vercel AI Gateway |
| Portfolio X-ray | `/app#portfolio`, editable/imported positions, overlap, scenario calculations |
| Alert builder | `/app#alerts`, natural-language rules, saved state and toggles |
| Landing / onboarding | `/`, `/onboarding` |
| User management | Managed auth, `/account`, role-gated `/admin`, Neon owner console |
| Vercel deployment | Dedicated `tape` project; live alias recorded below |

## Limits

Prices, disclosures, news, charts and scores are illustrative. No live financial feeds, scheduled notification delivery, verified historical backtests, or screenshot holdings extraction are claimed. Auth uses Neon shared SMTP; custom SMTP and verified production sender setup remain a customer-launch prerequisite. Password recovery UI is implemented with managed delivery, but no real inbox delivery test was performed. No admin role is granted to an unknown person; the owner can promote their registered account via Neon Auth → Users.

The browser tool was unavailable in this session. Visual and interaction checks use a separate automated Chromium test runner, with screenshots inspected as local images. Another workspace used local port 3100; Tape was moved to the unused 43817 port for final tests. No other workspace code was changed.

## Deployment

Initial production alias: https://tape-five-zeta.vercel.app
Final commit, live-test outcomes and log scan are appended after verification.
