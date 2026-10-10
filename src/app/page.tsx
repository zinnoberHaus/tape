import type { Metadata } from "next";
import {
  Asterisk,
  ArrowUpRight,
  ArrowRight,
  AudioLines,
  ChartNoAxesCombined,
  Check,
  FileText,
  Layers,
  MessageSquareText,
  Newspaper,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Bell,
  Plus,
  GitBranch,
  Wallet,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/header";
import WorkspacePreview, { Exposure } from "@/components/marketing/preview";
import { siteUrl, siteTitle, siteDescription } from "@/lib/site";
import "./marketing.css";
export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  alternates: { canonical: siteUrl },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Tape",
    title: siteTitle,
    description: siteDescription,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Tape — Read the market. Connect the dots.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image.png"],
  },
};
const faqs = [
  [
    "What is Tape?",
    "Tape is an AI-powered investment research workspace that connects stock ideas, news, smart-money activity, options flow, technical charts and portfolio analysis. It is designed around one research process: find an idea, understand the evidence and consider how it fits what you own.",
  ],
  [
    "Does Tape use live market data?",
    "The current release uses an illustrative dataset. Prices, news, congressional disclosures, insider trades, fund holdings, charts and Tape Scores are examples, not live market information. Account creation, saved personal workspaces and the AI analyst are connected to real services.",
  ],
  [
    "What can I explore without creating an account?",
    "The public demo lets you explore the research screens, filter opportunities, open ticker deep-dives, inspect smart-money activity and try sample portfolio scenarios. Create an account to save your watchlist, tracked setups, followed investors, holdings and alert rules, and to use Ask Tape.",
  ],
  [
    "How does the AI investment research assistant work?",
    "Ask Tape answers questions using the sample research context and your saved holdings. You can ask about a thesis, its risks, a screening idea or an alert rule. Chat answers are labeled as sample-data analysis. Signed-in accounts have a limit of 30 AI requests per day. AI can make mistakes, so check the underlying evidence.",
  ],
  [
    "Can I import my portfolio or connect a brokerage?",
    "You can paste positions or import a CSV with ticker, shares and average cost. The current dataset supports selected stock and ETF symbols shown in the import flow. Tape uses sample prices for portfolio analysis. It does not connect to a brokerage, hold funds or execute trades.",
  ],
  [
    "What does a Tape Score mean?",
    "The sample Tape Score summarizes a setup in the demo so you can compare ideas alongside their direction, horizon, supporting evidence and risks. It is not a probability of profit, a verified forecast or a historical performance result.",
  ],
  [
    "Will saved alerts send me notifications?",
    "You can build, name, save and toggle alert rules in your workspace. Scheduled monitoring and notification delivery are not connected in this release. The alert builder lets you organize what you want to watch.",
  ],
  [
    "Is Tape free to try?",
    "The public demo is open, and the current release has no subscription billing or credit-card checkout. You can create an account to explore saved research and the daily AI allowance. Any future paid plans would be communicated separately.",
  ],
];
const tools = [
  {
    icon: AudioLines,
    title: "AI morning briefing",
    text: "Start with the themes connecting the sample market. Read the brief or listen with browser audio, then open the ideas behind it.",
    href: "/demo#home",
  },
  {
    icon: SlidersHorizontal,
    title: "Stock & options screening",
    text: "Filter opportunities by direction, horizon and signals. Signed-in users can turn a plain-language screening idea into filters with AI.",
    href: "/demo#opps",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Charts with context",
    text: "Change time ranges and technical overlays. Place insider, fund and options events beside the sample price history of a stock.",
    href: "/demo#ticker/VST",
  },
  {
    icon: Newspaper,
    title: "News, sentiment & earnings",
    text: "Read the stories, inspect linked tickers and see upcoming catalysts in the sample calendar. Connect the headline to the investment question.",
    href: "/demo#news",
  },
  {
    icon: Layers,
    title: "Smart-money research",
    text: "Explore Congress disclosures, corporate insider activity, institutional holdings and options prints in a single research flow.",
    href: "/demo#smart",
  },
  {
    icon: Bell,
    title: "Watchlists & alert rules",
    text: "Keep the ideas you want to revisit. Save tracked setups and build alert conditions in your own account; notification delivery is not yet connected.",
    href: "/demo#alerts",
  },
];
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Tape",
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Tape",
      url: siteUrl,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      name: siteTitle,
      url: siteUrl,
      description: siteDescription,
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#software` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Tape",
      url: siteUrl,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web browser",
      description:
        "An AI investment research workspace with an illustrative market dataset, personal watchlists, smart-money research, charts, portfolio analysis and saved alert rules.",
      featureList: [
        "AI sample-data analysis",
        "Stock research workspace",
        "Congress and insider activity examples",
        "Options-flow research",
        "Portfolio X-ray",
        "Saved watchlists and alert rules",
      ],
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};
export default function Home() {
  return (
    <div className="marketing">
      <a href="#main-content" className="mk-skip">
        Skip to content
      </a>
      <MarketingHeader />
      <main id="main-content">
        <section className="mk-hero mk-shell" aria-labelledby="hero-heading">
          <div className="mk-hero-top">
            <p className="mk-eyebrow">
              <span className="mk-pulse-dot" />
              AI-powered investment research
            </p>
            <a href="#workspace" className="mk-hero-availability">
              Take a look inside <ArrowRight size={14} />
            </a>
          </div>
          <div className="mk-hero-grid">
            <h1 id="hero-heading">
              Read the market.
              <br />
              Connect the dots.
            </h1>
            <div className="mk-hero-copy">
              <p>
                News. Smart money. Options. Your portfolio. See how they fit
                together in one research workspace—and understand the idea
                behind your next move.
              </p>
              <div className="mk-actions">
                <a className="mk-button" href="/demo">
                  Explore the workspace <ArrowUpRight size={18} />
                </a>
                <a className="mk-button mk-button-outline" href="/auth/sign-up">
                  Create your account
                </a>
              </div>
              <p className="mk-fine">
                <Check size={14} />
                Open demo. No account needed.
              </p>
            </div>
          </div>
          <div id="workspace" className="mk-preview-anchor">
            <WorkspacePreview />
          </div>
          <div
            className="mk-capabilities"
            aria-label="Connected research tools"
          >
            <span>One workspace for</span>
            <a href="#smart-money">Smart money</a>
            <a href="#research">Options flow</a>
            <a href="#research">News & catalysts</a>
            <a href="#analyst">AI research</a>
            <a href="#portfolio">Portfolio risk</a>
          </div>
        </section>
        <section
          id="how-it-works"
          className="mk-workflow mk-shell"
          aria-labelledby="workflow-heading"
        >
          <div className="mk-section-heading">
            <p className="mk-eyebrow">A more connected way to research</p>
            <h2 id="workflow-heading">An idea is just the beginning.</h2>
            <p>
              The useful part is understanding what supports it, what challenges
              it, and what it means for you. Tape keeps that entire process in
              view.
            </p>
          </div>
          <ol className="mk-steps">
            <li>
              <span>01</span>
              <h3>Find what deserves a look.</h3>
              <p>
                Start with the briefing or screen for an opportunity. Filter by
                signal, direction and time horizon to make your research more
                focused.
              </p>
              <a href="/demo#opps">
                Find an idea <ArrowRight size={16} />
              </a>
            </li>
            <li>
              <span>02</span>
              <h3>Follow the evidence.</h3>
              <p>
                Open the ticker. Compare the news, disclosures, options activity
                and technical picture. Read the case for the idea alongside the
                risk.
              </p>
              <a href="/demo#ticker/VST">
                Explore a ticker <ArrowRight size={16} />
              </a>
            </li>
            <li>
              <span>03</span>
              <h3>Make it your research.</h3>
              <p>
                Look through your portfolio exposure, ask follow-up questions
                and save a setup. Keep a watchlist and alert rules for the next
                time you return.
              </p>
              <a href="/demo#portfolio">
                Look at portfolio risk <ArrowRight size={16} />
              </a>
            </li>
          </ol>
        </section>
        <section
          id="smart-money"
          className="mk-feature-band"
          aria-labelledby="money-heading"
        >
          <div className="mk-shell mk-feature-grid">
            <div className="mk-feature-copy">
              <span className="mk-feature-icon">
                <GitBranch size={25} />
              </span>
              <p className="mk-eyebrow">Congress, insiders, funds & options</p>
              <h2 id="money-heading">
                Follow the money.
                <br />
                Question the signal.
              </h2>
              <p>
                A reported purchase is a starting point for research. Tape puts
                different kinds of activity beside one another so you can ask a
                better question: does the evidence tell a consistent story?
              </p>
              <ul className="mk-check-list">
                <li>
                  <Check />
                  Explore congressional trades and corporate insider activity.
                </li>
                <li>
                  <Check />
                  Compare institutional holdings and 13F position changes.
                </li>
                <li>
                  <Check />
                  Inspect unusual options prints in the context of the stock.
                </li>
              </ul>
              <p className="mk-caveat">
                Disclosures and options activity need context. A reported
                position or an unusually large trade alone does not reveal an
                investor’s full strategy.
              </p>
              <a href="/demo#smart" className="mk-text-button">
                Explore smart-money research <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="mk-evidence">
              <div className="mk-evidence-heading">
                <span className="mk-ticker-badge">V</span>
                <div>
                  <h3>
                    VST <span>Vistra Corp.</span>
                  </h3>
                  <p>A connected research trail</p>
                </div>
                <span className="mk-sample-tag">Sample</span>
              </div>
              <div className="mk-evidence-row">
                <span className="mk-source-icon">
                  <FileText size={18} />
                </span>
                <div>
                  <span>Corporate insiders</span>
                  <h4>Two directors buy $4.1M.</h4>
                  <p>Start with the people closest to the business.</p>
                </div>
                <span className="mk-positive-chip">Buying</span>
              </div>
              <div className="mk-evidence-row">
                <span className="mk-source-icon blue">
                  <Layers size={18} />
                </span>
                <div>
                  <span>Institutional funds</span>
                  <h4>A position worth following.</h4>
                  <p>Compare the change with the fund’s other holdings.</p>
                </div>
                <span className="mk-positive-chip blue">13F</span>
              </div>
              <div className="mk-evidence-row">
                <span className="mk-source-icon purple">
                  <ChartNoAxesCombined size={18} />
                </span>
                <div>
                  <span>Options activity</span>
                  <h4>A $2.31M call sweep.</h4>
                  <p>Inspect the expiry, strike and broader setup.</p>
                </div>
                <span className="mk-positive-chip purple">Calls</span>
              </div>
              <div className="mk-evidence-conclusion">
                <span className="mk-star">
                  <Asterisk size={23} />
                </span>
                <p>
                  <b>Now connect the dots.</b>
                  <br />
                  What supports the power-demand thesis—and what would break it?
                </p>
              </div>
              <p className="mk-preview-note">
                Illustrative activity from the Tape demo. Not current
                disclosures.
              </p>
            </div>
          </div>
        </section>
        <section
          id="analyst"
          className="mk-shell mk-feature-grid mk-ai-section"
          aria-labelledby="analyst-heading"
        >
          <div className="mk-conversation">
            <div className="mk-conversation-title">
              <span className="mk-star">
                <Asterisk size={23} />
              </span>
              <b>Ask Tape</b>
              <span>Research in context</span>
            </div>
            <div className="mk-message-user">
              What could break the VST thesis?
            </div>
            <div className="mk-message-answer">
              <span className="mk-ai-avatar">T</span>
              <div>
                <p className="mk-eyebrow">Example analysis of sample data</p>
                <p>
                  The power-demand story has support. The risk is what the
                  current valuation already assumes.
                </p>
                <ul>
                  <li>
                    <b>Margins:</b> higher gas costs could squeeze
                    profitability.
                  </li>
                  <li>
                    <b>Expectations:</b> a guidance miss could challenge the
                    valuation.
                  </li>
                  <li>
                    <b>Timing:</b> delayed contracts could test the thesis.
                  </li>
                </ul>
                <a href="/demo#ticker/VST">
                  View the sample setup <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
            <div className="mk-followup">
              <MessageSquareText size={17} />
              <span>Ask the question behind the headline.</span>
            </div>
          </div>
          <div className="mk-feature-copy">
            <span className="mk-feature-icon">
              <MessageSquareText size={25} />
            </span>
            <p className="mk-eyebrow">Your AI research assistant</p>
            <h2 id="analyst-heading">
              A good thesis starts
              <br />
              with better questions.
            </h2>
            <p>
              Ask Tape to explain an opportunity, challenge the bullish case or
              help shape a screening idea. The conversation uses your research
              context, so the next question can go deeper.
            </p>
            <div className="mk-question-list">
              <span>“What are the risks I’m missing?”</span>
              <span>“Find bullish utilities with insider buying.”</span>
              <span>“How does this fit what I already own?”</span>
            </div>
            <p className="mk-caveat">
              Ask Tape uses the sample dataset and your saved holdings.
              Responses can be wrong; review the evidence. Available after
              sign-in, with 30 requests per day.
            </p>
            <a href="/auth/sign-up" className="mk-text-button">
              Start your own research conversation <ArrowUpRight size={17} />
            </a>
          </div>
        </section>
        <section
          id="portfolio"
          className="mk-portfolio-band"
          aria-labelledby="portfolio-heading"
        >
          <div className="mk-shell mk-feature-grid">
            <div className="mk-feature-copy">
              <span className="mk-feature-icon">
                <ScanLine size={25} />
              </span>
              <p className="mk-eyebrow">Portfolio X-ray</p>
              <h2 id="portfolio-heading">
                Your next idea belongs
                <br />
                in the bigger picture.
              </h2>
              <p>
                One ticker is only part of the story. Bring your positions into
                Tape to explore sector concentration, ETF overlap and
                illustrative market-shock scenarios.
              </p>
              <ul className="mk-check-list">
                <li>
                  <Check />
                  Paste holdings or import a CSV with shares and average cost.
                </li>
                <li>
                  <Check />
                  See where individual stocks and funds share exposure.
                </li>
                <li>
                  <Check />
                  Explore how a scenario changes the sample portfolio.
                </li>
              </ul>
              <p className="mk-caveat">
                Selected demo symbols and sample prices are supported. No
                brokerage connection or trade execution.
              </p>
              <a href="/demo#portfolio" className="mk-text-button">
                Explore Portfolio X-ray <ArrowUpRight size={17} />
              </a>
            </div>
            <Exposure />
          </div>
        </section>
        <section
          id="research"
          className="mk-shell mk-toolkit"
          aria-labelledby="toolkit-heading"
        >
          <div className="mk-section-heading mk-heading-split">
            <div>
              <p className="mk-eyebrow">Inside your research workspace</p>
              <h2 id="toolkit-heading">
                The tools connect.
                <br />
                The picture gets clearer.
              </h2>
            </div>
            <p>
              Move from a headline to a chart, from a disclosure to a thesis,
              and from a stock idea to your portfolio. Each view gives the next
              one context.
            </p>
          </div>
          <div className="mk-tool-grid">
            {tools.map(({ icon: Icon, title, text, href }) => (
              <a className="mk-tool" key={title} href={href}>
                <Icon size={23} />
                <h3>{title}</h3>
                <p>{text}</p>
                <span>
                  Explore in the demo <ArrowUpRight size={16} />
                </span>
              </a>
            ))}
          </div>
        </section>
        <section
          className="mk-shell mk-availability"
          aria-labelledby="availability-heading"
        >
          <div>
            <ShieldCheck size={24} />
            <h2 id="availability-heading">Know what you’re exploring.</h2>
            <p>
              Tape is an early research workspace. Try the workflow, inspect the
              tools and make it your own.
            </p>
          </div>
          <div>
            <h3>Working today</h3>
            <p>
              Personal accounts, saved watchlists and holdings, tracked setups,
              AI questions, portfolio imports and saved alert rules.
            </p>
          </div>
          <div>
            <h3>Illustrative for now</h3>
            <p>
              Market prices, news, disclosures, charts and scores use sample
              data. Live feeds, scheduled notifications and verified backtests
              are not connected.
            </p>
          </div>
        </section>
        <section
          id="questions"
          className="mk-shell mk-faq"
          aria-labelledby="faq-heading"
        >
          <div className="mk-faq-intro">
            <p className="mk-eyebrow">A few useful answers</p>
            <h2 id="faq-heading">
              Before you
              <br />
              read the tape.
            </h2>
            <p>
              How the workspace works, what the data means, and where to start.
            </p>
            <a href="/demo" className="mk-text-button">
              Take a look around <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="mk-faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus size={19} aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="mk-final">
          <div className="mk-shell">
            <div>
              <p>A little more context. A better place to start.</p>
              <h2>
                Make your next move
                <br />a researched one.
              </h2>
            </div>
            <div>
              <a href="/demo" className="mk-button mk-button-dark">
                Explore Tape <ArrowUpRight size={20} />
              </a>
              <a href="/auth/sign-up">
                Or create your personal workspace <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="mk-footer mk-shell">
        <div className="mk-footer-top">
          <div>
            <a href="/" className="mk-brand">
              <span>T</span>Tape
            </a>
            <p>
              The connected workspace
              <br />
              for a more informed investor.
            </p>
          </div>
          <nav aria-label="Product links">
            <h2>Explore</h2>
            <a href="/demo#home">Morning brief</a>
            <a href="/demo#opps">Opportunities</a>
            <a href="/demo#smart">Smart money</a>
            <a href="/demo#portfolio">Portfolio X-ray</a>
          </nav>
          <nav aria-label="Workspace links">
            <h2>Your workspace</h2>
            <a href="/auth/sign-up">Create an account</a>
            <a href="/auth/sign-in">Sign in</a>
            <a href="#questions">Questions & answers</a>
            <a href="/demo">Try the demo</a>
          </nav>
          <div className="mk-footer-note">
            <Wallet size={20} />
            <p>Research only. You stay in control.</p>
            <span>
              Tape does not connect to your brokerage, execute trades or hold
              your money.
            </span>
          </div>
        </div>
        <div className="mk-footer-bottom">
          <span>© {new Date().getFullYear()} Tape</span>
          <p>
            For research and education. Illustrative market data, not investment
            advice or a promise of returns.
          </p>
          <a href="#main-content">Back to top ↑</a>
        </div>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
