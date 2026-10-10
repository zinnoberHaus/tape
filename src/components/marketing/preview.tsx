"use client";
import { useState, useRef } from "react";
import {
  Asterisk,
  ArrowUpRight,
  ChartNoAxesCombined,
  Newspaper,
  AudioLines,
  Search,
  Layers,
  Home,
  Compass,
  Wallet,
  Check,
  ArrowDownRight,
} from "lucide-react";
const views = [
  { id: "brief", label: "Morning brief", icon: Home },
  { id: "ticker", label: "Ticker deep-dive", icon: ChartNoAxesCombined },
  { id: "portfolio", label: "Portfolio X-ray", icon: Wallet },
] as const;
export function PriceChart({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={compact ? "mk-chart compact" : "mk-chart"}
      viewBox="0 0 620 200"
      role="img"
      aria-label="Illustrative VST price trend with sample disclosure markers"
    >
      {[28, 73, 118, 163].map((y, i) => (
        <g key={y}>
          <line
            x1="0"
            x2="575"
            y1={y}
            y2={y}
            stroke="#26313B"
            strokeDasharray="3 5"
          />
          <text x="585" y={y + 4} fill="#8F9BAA" fontSize="10">
            {220 - i * 20}
          </text>
        </g>
      ))}
      <path
        d="M0 170L20 160L35 168L51 145L65 151L82 132L99 148L118 143L132 121L152 136L170 112L191 117L209 92L230 115L250 94L271 98L291 80L311 92L331 60L353 74L375 66L395 81L417 52L440 58L460 38L481 49L500 23L521 34L544 17L565 25"
        fill="none"
        stroke="#1FD18A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {[
        [132, 121, "I"],
        [291, 80, "F"],
        [460, 38, "O"],
      ].map(([x, y, t]) => (
        <g key={t}>
          <line
            x1={x}
            x2={x}
            y1={Number(y) + 8}
            y2="178"
            stroke="#376152"
            strokeDasharray="3 4"
          />
          <circle
            cx={x}
            cy={y}
            r="5"
            fill="#1FD18A"
            stroke="#10171E"
            strokeWidth="3"
          />
          <rect
            x={Number(x) - 10}
            y="178"
            width="20"
            height="18"
            rx="4"
            fill="#1B3B30"
          />
          <text x={x} y="191" textAnchor="middle" fontSize="10" fill="#70E3AF">
            {t}
          </text>
        </g>
      ))}
    </svg>
  );
}
export function Exposure() {
  return (
    <div className="mk-exposure">
      <div className="mk-exposure-top">
        <div>
          <span>Portfolio X-ray</span>
          <h3>Look beneath the ticker.</h3>
        </div>
        <Layers size={22} />
      </div>
      <div className="mk-exposure-body">
        <div
          className="mk-donut"
          role="img"
          aria-label="Illustrative sector mix: technology 42%, utilities 28%, industrials 18%, other 12%"
        >
          <div>
            <strong>
              42<span>%</span>
            </strong>
            <small>Technology</small>
          </div>
        </div>
        <div className="mk-allocation">
          {[
            ["Technology", "42", "#1FD18A"],
            ["Utilities", "28", "#81A8EC"],
            ["Industrials", "18", "#B8A0E0"],
            ["Other", "12", "#546274"],
          ].map(([name, value, color]) => (
            <div key={name}>
              <span>
                <i style={{ background: color }} />
                {name}
              </span>
              <b>{value}%</b>
            </div>
          ))}
        </div>
      </div>
      <div className="mk-overlap">
        <span className="mk-icon-box">
          <Layers size={18} />
        </span>
        <div>
          <b>Different funds. Shared exposure.</b>
          <p>A stock held directly can also appear inside your ETFs.</p>
        </div>
      </div>
      <p className="mk-preview-note">
        Illustrative allocation. Explore your sample holdings in the demo.
      </p>
    </div>
  );
}
export default function WorkspacePreview() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  function select(index: number) {
    setActive(index);
    tabs.current[index]?.focus();
  }
  return (
    <div className="mk-workspace-demo">
      <div
        className="mk-preview-tabs"
        role="tablist"
        aria-label="Explore the research workflow"
      >
        {views.map((view, i) => (
          <button
            key={view.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            id={`tab-${view.id}`}
            role="tab"
            aria-selected={active === i}
            aria-controls="workspace-panel"
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                select((i + 1) % 3);
              }
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                select((i + 2) % 3);
              }
              if (e.key === "Home") {
                e.preventDefault();
                select(0);
              }
              if (e.key === "End") {
                e.preventDefault();
                select(2);
              }
            }}
          >
            <view.icon size={17} />
            <span>{view.label}</span>
          </button>
        ))}
      </div>
      <div className="mk-console">
        <div className="mk-console-bar">
          <span>
            <i />
            <i />
            <i />
          </span>
          <p>Tape workspace</p>
          <span className="mk-sample-tag">Sample data</span>
        </div>
        <div className="mk-console-body">
          <aside className="mk-console-nav" aria-label="Preview sections">
            <span className="mk-brand">
              <span>T</span>Tape
            </span>
            <div className="mk-mini-nav">
              {[
                [Home, "Home"],
                [Compass, "Opportunities"],
                [Layers, "Smart money"],
                [Newspaper, "News"],
                [Wallet, "Portfolio"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Home;
                return (
                  <span
                    key={label as string}
                    className={
                      (
                        active === 2
                          ? label === "Portfolio"
                          : active === 1
                            ? label === "Opportunities"
                            : label === "Home"
                      )
                        ? "selected"
                        : ""
                    }
                  >
                    <I size={15} />
                    {label as string}
                  </span>
                );
              })}
            </div>
            <div className="mk-mini-watch">
              <small>On your radar</small>
              {[
                ["VST", "+2.22%"],
                ["LMT", "+0.84%"],
                ["NVDA", "−1.30%"],
              ].map(([s, v]) => (
                <div key={s}>
                  <b>{s}</b>
                  <span className={s === "NVDA" ? "mk-red" : "mk-green"}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
            <span className="mk-console-bottom">
              <span>JD</span>Your workspace
            </span>
          </aside>
          <div className="mk-console-main">
            <div className="mk-console-search">
              <span>
                <Search size={14} />
                Find a ticker. Follow an idea.
              </span>
              <span>
                Ask Tape{" "}
                <span className="mk-star">
                  <Asterisk size={23} />
                </span>
              </span>
            </div>
            <div
              role="tabpanel"
              id="workspace-panel"
              aria-labelledby={`tab-${views[active].id}`}
              tabIndex={0}
              className="mk-panel"
            >
              {active === 0 ? (
                <>
                  <div className="mk-panel-heading">
                    <div>
                      <p>Your market, connected</p>
                      <h2>A clearer start to your research.</h2>
                    </div>
                    <span className="mk-audio">
                      <AudioLines size={18} />
                      Morning brief
                    </span>
                  </div>
                  <div className="mk-brief-highlight">
                    <span className="mk-star">
                      <Asterisk size={23} />
                    </span>
                    <p>
                      <b>Power demand is the thread.</b> Insider buying, fund
                      activity and options interest are converging in utilities.
                      Here are the signals worth a closer look.
                    </p>
                  </div>
                  <div className="mk-opportunities">
                    {[
                      [
                        "VST",
                        "Vistra",
                        "92",
                        "+2.22%",
                        "bull",
                        "Power demand meets insider conviction.",
                      ],
                      [
                        "LMT",
                        "Lockheed Martin",
                        "88",
                        "+0.84%",
                        "bull",
                        "A defense catalyst with money behind it.",
                      ],
                      [
                        "CVNA",
                        "Carvana",
                        "86",
                        "−4.60%",
                        "bear",
                        "A reminder to research the downside.",
                      ],
                    ].map(([s, n, score, change, direction, copy]) => (
                      <a
                        key={s}
                        href={"/demo#ticker/" + s}
                        className="mk-opportunity"
                      >
                        <div>
                          <span className="mk-ticker-badge">
                            {s.slice(0, 1)}
                          </span>
                          <span>
                            <b>{s}</b>
                            <small>{n}</small>
                          </span>
                          <span
                            className={
                              direction === "bear" ? "mk-red" : "mk-green"
                            }
                          >
                            {change}
                          </span>
                        </div>
                        <p>{copy}</p>
                        <footer>
                          <span>
                            <i className={direction === "bear" ? "red" : ""} />
                            {direction === "bear" ? "Bearish" : "Bullish"} setup
                          </span>
                          <b>
                            {score}
                            <small>/100</small>
                          </b>
                        </footer>
                      </a>
                    ))}
                  </div>
                  <div className="mk-console-chart">
                    <div>
                      <h3>Follow the evidence</h3>
                      <span>VST / illustrative 6-month chart</span>
                    </div>
                    <PriceChart compact />
                    <div className="mk-chart-key">
                      <span>
                        <i>I</i>Insiders
                      </span>
                      <span>
                        <i>F</i>Funds
                      </span>
                      <span>
                        <i>O</i>Options
                      </span>
                    </div>
                  </div>
                </>
              ) : active === 1 ? (
                <>
                  <div className="mk-panel-heading">
                    <div>
                      <p>Ticker deep-dive</p>
                      <h2>
                        VST <span>Vistra Corp.</span>
                      </h2>
                    </div>
                    <a href="/demo#ticker/VST" className="mk-inline-link">
                      Open research <ArrowUpRight size={15} />
                    </a>
                  </div>
                  <div className="mk-ticker-price">
                    <strong>$212.48</strong>
                    <span className="mk-green">+2.22% sample day</span>
                  </div>
                  <PriceChart />
                  <div className="mk-thesis-grid">
                    <div>
                      <span className="mk-green">
                        <Check size={15} />
                        The case for
                      </span>
                      <p>
                        Insider purchases and fund accumulation support the
                        power-demand thesis.
                      </p>
                    </div>
                    <div>
                      <span className="mk-red">
                        <ArrowDownRight size={15} />
                        What could go wrong
                      </span>
                      <p>
                        Higher gas prices and a guidance miss could put margins
                        and valuation under pressure.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mk-panel-heading">
                    <div>
                      <p>Portfolio analysis</p>
                      <h2>Research the risk you own.</h2>
                    </div>
                    <a href="/demo#portfolio" className="mk-inline-link">
                      Open X-ray <ArrowUpRight size={15} />
                    </a>
                  </div>
                  <Exposure />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mk-console-caption">
        <span>
          Interactive preview. Illustrative prices, activity and analysis.
        </span>
        <a href="/demo">
          Explore the full workspace <ArrowUpRight size={15} />
        </a>
      </div>
    </div>
  );
}
