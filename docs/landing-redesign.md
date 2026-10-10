# Landing redesign — 2026-10-10

## Research and direction

The initial page gave visitors little product depth: one sample chart, three setup cards and three short feature descriptions. This revision answers what Tape connects, how an investor uses it, and what is available today.

Primary sources reviewed:

- [Koyfin features](https://www.koyfin.com/features/): connects specific tools with concrete investor workflows and shows the interface. Apply that specificity to Tape's implemented tools, without borrowing its claims or customer proof.
- [Fiscal.ai](https://fiscal.ai/): its research flow emphasizes understanding company context. Tape will explain how an idea becomes a thesis rather than present a list of disconnected feeds.
- [Quiver](https://www.quiverquant.com/splash/): dedicated explanations make Congress, insider and institutional datasets understandable. Tape will explain those source categories and the limits of interpreting them.
- [Google SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide): useful original content, descriptive titles, logical headings, crawlable links and canonical URLs.
- [Google mobile-first indexing](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing): preserve primary content and metadata on mobile; adapt layout instead of removing substantive content.

## Design plan

Palette: ink `#0A0D12`, panel `#10171E`, slate `#9EAAB8`, white `#EDF3F6`, Tape green `#1FD18A`, risk coral `#FF9690`. Retain the app's financial identity. Use existing Geist for large, tightly set display type and readable body copy; Geist Mono only for financial values.

Layout: a broad two-column introduction flows into a full-width interactive research console. Below it, vary the composition with a source timeline, AI conversation, portfolio exposure view, compact tool directory, FAQs and a solid green closing invitation. Keep prose left-aligned with short measure.

```
brand / section navigation / account
large headline       concrete proposition + actions
[ brief | ticker | portfolio ]
[       interactive research console       ]
research workflow / source relationships
smart-money narrative  | source timeline
AI conversation        | question-led narrative
portfolio narrative    | exposure diagram
full tool directory / product availability
FAQ / green final invitation / useful footer
```

Critique: a grid of identical cards and an isolated rising-price chart would repeat the rejected page. The revised design instead makes one connected, explorable research console the hero and uses different information structures for different tools. No decorative gradients, invented testimonials, performance promises, or fake customer metrics.

## Content and SEO scope

Explain briefing, Congress/insiders/13F, options, technicals, news/earnings, AI questions, portfolio analysis and saved alert rules. Link directly to working demo screens. Distinguish current sample data from real account persistence and AI. Add server-rendered landing content, metadata, canonical URL, social image, honest WebSite/WebPage/SoftwareApplication structured data, sitemap and robots. Keep account and sample-workspace pages out of search via noindex metadata.

Mobile: navigation that can be opened and closed, readable type and controls, reflowing previews, no horizontal page overflow, full content parity, reduced-motion support and visible focus. Verify multiple small-phone, tablet and desktop sizes, keyboard interaction, server HTML, crawl endpoints and the live deployment.

## Verification

Local production build on 2026-10-10:

- Typecheck, production build and all 3 existing unit tests passed.
- 4 browser tests passed: landing content/metadata, mobile interactions, existing research screens/imports and authentication entry/protection.
- Checked 320, 375, 390, 640, 768, 1024 and 1440px layouts in all three preview states, with no page overflow.
- Tested mobile menu close-on-navigation, Escape/focus return, keyboard tab switching, FAQ expansion, CTA navigation and section-link targets.
- Axe WCAG A/AA checks reported no violations on desktop and mobile. Screenshots of desktop/mobile hero, research examples, portfolio visualization and the social image were reviewed.
- Server HTML contains the product explanation and FAQs. Verified one H1, title/description, canonical, robots metadata, JSON-LD, generated social PNG, sitemap, robots.txt and noindex for account entry pages.
- Lighthouse 12.8.2 mobile simulation against the local production build: performance **97**, accessibility **100**, best practices **100**, SEO **100**. FCP 1.1s, LCP 2.5s, total blocking time 50ms, CLS 0. These are a single lab run, not field Core Web Vitals or a ranking guarantee. The initial audit found a logo name mismatch and unnecessary shared styles; both were corrected before this run.

Artifacts remain local under `artifacts/`; no synthetic financial performance or customer proof was added.

## Deployment and recovery

This release changes the public landing page, metadata and crawl endpoints. Auth UI and research-workspace styles load with their respective routes. No database, auth policy, billing or infrastructure migration is needed. Roll back to the prior deployment `dpl_AvFjPPbuZKiwDhsvzdE3Wm2ia1Xq` / application commit `5e17d22` if necessary; this restores the previous landing and metadata without affecting saved workspaces.

The canonical origin is centralized in `src/lib/site.ts`. Only the public landing page is listed in the sitemap and indexable; account routes and the illustrative demo inherit noindex. API paths are disallowed in robots.txt. Search Console ownership, sitemap submission and actual search indexing have not been verified or claimed.
