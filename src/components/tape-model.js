// Shared calculation model; React is injected only in the client component.
export function createTapeModel(Base) { return class TapeModel extends Base {
  constructor(props){super(props);}
  state = { screen: 'home', sym: 'VST', tf: '6M', hov: null, sel: null, hx: null, cmd: '', aiOpen: false, aiIn: '', aiBusy: false, msgs: null, playing: false, playT: 0, tick: 0 };
  tapeRef = ({current:null}); mainRef = ({current:null}); cmdRef = ({current:null}); aiRef = ({current:null});
  _s = {};

  componentDidMount() {
    let x = 0, last = performance.now();
    const step = (t) => {
      const dt = Math.min(64, t - last); last = t;
      const el = this.tapeRef.current;
      if (el && !this.tapePaused) { const w = el.scrollWidth / 2; x -= dt * 0.045 * (this.props.tapeSpeed ?? 1); if (w > 0 && -x >= w) x += w; el.style.transform = 'translateX(' + x.toFixed(1) + 'px)'; }
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
    this.onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key || '').toLowerCase() === 'k') { e.preventDefault(); this.cmdRef.current && this.cmdRef.current.focus(); }
      if (e.key === 'Escape' && this.state.aiOpen) this.setState({ aiOpen: false });
    };
    window.addEventListener('keydown', this.onKey);
    if (this.props.startScreen && this.props.startScreen !== 'home') this.go(this.props.startScreen);
  }
  componentDidUpdate(prev) { if (prev.startScreen !== this.props.startScreen && this.props.startScreen) this.go(this.props.startScreen); }
  componentWillUnmount() { cancelAnimationFrame(this.raf); clearInterval(this.playIv); clearInterval(this.dotIv); window.removeEventListener('keydown', this.onKey); }

  go(k, extra) { this.setState(Object.assign({ screen: k }, extra || {})); const m = this.mainRef.current; if (m) m.scrollTop = 0; }
  openSym(sym) { if (this.D.TK[sym]) this.go('ticker', { sym, hov: null, sel: null, hx: null }); }
  togglePlay() {
    clearInterval(this.playIv);
    if (this.state.playing) return this.setState({ playing: false });
    this.setState({ playing: true });
    this.playIv = setInterval(() => { if (this.state.playT >= 252) { clearInterval(this.playIv); this.setState({ playing: false, playT: 0 }); } else this.setState({ playT: this.state.playT + 1 }); }, 1000);
  }
  onCmdKey(e) {
    if (e.key !== 'Enter') return;
    const v = (this.state.cmd || '').trim(); if (!v) return;
    const up = v.toUpperCase().replace(/^\$/, '');
    this.setState({ cmd: '' });
    if (this.D.TK[up]) return this.openSym(up);
    this.ask(v);
  }
  scrollAi() { setTimeout(() => { const el = this.aiRef.current; if (el) el.scrollTop = el.scrollHeight; }, 60); }

  get D() { return this._D || (this._D = this.build()); }
  build() {
    const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], N = 460, days = [];
    for (const d = new Date(2026, 9, 9); days.length < N; d.setDate(d.getDate() - 1)) if (d.getDay() % 6) days.unshift(new Date(d));
    const T = (n, ex, sec, px, d, wk, p0, a, v, f) => Object.assign({ n, ex, sec, px, d, wk, p0, a, v }, f || {});
    const TK = {
      VST: T('Vistra Corp.', 'NYSE', 'Utilities', 212.48, 2.22, 11.8, 88, [[300,118],[252,141],[180,172],[120,158],[60,176],[20,184]], .034, { mc: 72.1, pe: 27.4, rg: 18, fcf: 3.9, dv: 0.4, si: 2.1, iv: 44, ivr: 34, er: 'Oct 29', em: 7.2 }),
      LMT: T('Lockheed Martin', 'NYSE', 'Aerospace & Defense', 518.20, 0.84, 3.9, 440, [[252,470],[160,430],[90,452],[40,481],[15,497]], .02, { mc: 121.4, pe: 18.9, rg: 6, fcf: 5.2, dv: 2.6, si: 1.0, iv: 25, ivr: 22, er: 'Oct 20', em: 4.1 }),
      CEG: T('Constellation Energy', 'NASDAQ', 'Utilities', 356.10, 1.9, 8.7, 165, [[252,228],[160,276],[100,301],[50,322],[15,331]], .036, { mc: 111.6, pe: 31.2, rg: 11, fcf: 2.8, dv: 0.5, si: 1.6, iv: 39, ivr: 31, er: 'Nov 3', em: 6.6 }),
      NVDA: T('NVIDIA', 'NASDAQ', 'Semiconductors', 191.70, -1.3, -3.4, 112, [[252,132],[170,160],[100,178],[45,201],[12,199]], .04, { mc: 4670, pe: 33.8, rg: 52, fcf: 2.4, dv: 0.02, si: 1.1, iv: 38, ivr: 29, er: 'Nov 18', em: 8.0 }),
      CVNA: T('Carvana', 'NYSE', 'Consumer Discretionary', 298.10, -4.6, -9.8, 180, [[252,248],[170,331],[90,362],[40,347],[12,336]], .048, { mc: 63.9, pe: 64.0, rg: 38, fcf: 1.1, dv: 0, si: 9.8, iv: 71, ivr: 63, er: 'Oct 28', em: 12.5 }),
      ANET: T('Arista Networks', 'NYSE', 'Networking', 156.30, 1.6, 5.2, 88, [[252,104],[150,131],[80,140],[30,149]], .036, { mc: 196.8, pe: 41.5, rg: 27, fcf: 2.6, dv: 0, si: 1.3, iv: 42, ivr: 33, er: 'Nov 4', em: 9.1 }),
      RTX: T('RTX Corp.', 'NYSE', 'Aerospace & Defense', 171.40, 0.5, 2.6, 118, [[252,128],[150,149],[70,158],[25,166]], .022, { mc: 229.5, pe: 26.1, rg: 9, fcf: 3.4, dv: 1.6, si: 0.9, iv: 26, ivr: 24, er: 'Oct 21', em: 4.3 }),
      GD: T('General Dynamics', 'NYSE', 'Aerospace & Defense', 338.90, 0.3, 1.8, 278, [[252,288],[140,301],[60,322],[20,331]], .018, { mc: 91.6, pe: 21.4, rg: 7, fcf: 4.6, dv: 1.8, si: 0.8, iv: 23, ivr: 19, er: 'Oct 28', em: 3.8 }),
      JPM: T('JPMorgan Chase', 'NYSE', 'Banks', 309.50, 0.2, 1.1, 214, [[252,246],[150,268],[70,294],[25,304]], .02, { mc: 851.2, pe: 15.2, rg: 5, fcf: 0, dv: 1.9, si: 0.7, iv: 27, ivr: 41, er: 'Oct 13', em: 3.1 }),
      NRG: T('NRG Energy', 'NYSE', 'Utilities', 164.20, 1.4, 6.1, 82, [[252,104],[150,138],[70,151],[25,158]], .034, { mc: 32.4, pe: 19.8, rg: 14, fcf: 6.1, dv: 1.1, si: 3.2, iv: 37, ivr: 28, er: 'Nov 6', em: 6.0 }),
      PLTR: T('Palantir', 'NASDAQ', 'Software', 183.20, -2.1, -4.0, 38, [[252,79],[150,131],[70,171],[25,192]], .05, { mc: 432.0, pe: 182.0, rg: 41, fcf: 0.9, dv: 0, si: 2.4, iv: 55, ivr: 47, er: 'Nov 2', em: 11.4 }),
      TSLA: T('Tesla', 'NASDAQ', 'Autos', 452.80, 3.1, 6.2, 240, [[252,262],[150,318],[70,401],[25,431]], .05, { mc: 1460, pe: 148.0, rg: 4, fcf: 0.6, dv: 0, si: 2.9, iv: 58, ivr: 52, er: 'Oct 21', em: 9.6 }),
      AMD: T('AMD', 'NASDAQ', 'Semiconductors', 221.40, -1.8, -2.9, 140, [[252,158],[150,176],[70,231],[25,229]], .045, { mc: 359.0, pe: 38.5, rg: 31, fcf: 1.8, dv: 0, si: 2.2, iv: 49, ivr: 38, er: 'Nov 3', em: 8.7 }),
      SPY: T('SPDR S&P 500 ETF', 'NYSE Arca', 'ETF', 713.40, 0.41, 1.1, 548, [[252,612],[150,640],[70,682],[25,701]], .012),
      QQQ: T('Invesco QQQ Trust', 'NASDAQ', 'ETF', 618.30, 0.7, 1.5, 452, [[252,520],[150,551],[70,592],[25,606]], .015),
      SMH: T('VanEck Semiconductor ETF', 'NASDAQ', 'ETF', 341.20, -0.9, -2.2, 232, [[252,262],[150,291],[70,331],[25,346]], .025),
      XLU: T('Utilities Select Sector SPDR', 'NYSE Arca', 'ETF', 91.40, 1.1, 4.3, 68, [[252,76],[150,81],[70,85],[25,88]], .012)
    };
    const C = (id, who, p, st, ch, com, rel, sym, side, amt, lo, t, f) => ({ id, who, p, st, ch, com, rel, sym, side, amt, lo, t, f });
    const CONG = [
      C('c1', 'Sen. Dana Whitcomb', 'R', 'TX', 'Senate', 'Armed Services', true, 'LMT', 'Buy', '$50K–$100K', 75, 28, 7),
      C('c2', 'Rep. Marcus Ellery', 'D', 'CA', 'House', 'Armed Services', true, 'RTX', 'Buy', '$15K–$50K', 32.5, 30, 9),
      C('c3', 'Rep. Joan Pruett', 'R', 'OH', 'House', 'Energy & Commerce', true, 'VST', 'Buy', '$100K–$250K', 175, 29, 6),
      C('c4', 'Rep. Teresa Okafor', 'D', 'NY', 'House', 'Financial Services', false, 'NVDA', 'Sell', '$250K–$500K', 375, 31, 2),
      C('c5', 'Rep. Grant Hollis', 'R', 'FL', 'House', 'Armed Services', true, 'GD', 'Buy', '$50K–$100K', 75, 19, 3),
      C('c6', 'Sen. Priya Natarajan', 'D', 'WA', 'Senate', 'Commerce', true, 'ANET', 'Buy', '$15K–$50K', 32.5, 22, 8),
      C('c7', 'Rep. Cole Danner', 'R', 'GA', 'House', 'Armed Services', true, 'LMT', 'Buy', '$15K–$50K', 32.5, 25, 5),
      C('c8', 'Sen. Alan Ruiz', 'D', 'NV', 'Senate', 'Banking', true, 'JPM', 'Sell', '$15K–$50K', 32.5, 20, 4),
      C('c9', 'Rep. Lisa Brandt', 'D', 'MI', 'House', 'Energy & Commerce', true, 'CEG', 'Buy', '$50K–$100K', 75, 24, 10),
      C('c10', 'Rep. Wade Kimura', 'R', 'AZ', 'House', 'Ways & Means', false, 'TSLA', 'Buy', '$1K–$15K', 8, 33, 12),
      C('c11', 'Rep. Joan Pruett', 'R', 'OH', 'House', 'Energy & Commerce', true, 'VST', 'Buy', '$15K–$50K', 32.5, 120, 95),
      C('c12', 'Sen. Dana Whitcomb', 'R', 'TX', 'Senate', 'Armed Services', true, 'RTX', 'Buy', '$15K–$50K', 32.5, 90, 70)
    ];
    const I = (id, sym, who, role, side, sh, px, ago, plan) => ({ id, sym, who, role, side, sh, px, ago, plan });
    const INS = [
      I('i1', 'VST', 'Juan Morales', 'Director', 'Buy', 12000, 189.40, 3, false), I('i2', 'VST', 'Rebecca Chen', 'Director', 'Buy', 9500, 191.10, 3, false),
      I('i3', 'VST', 'Sam Whitley', 'CFO', 'Sell', 4000, 176.20, 44, true), I('i4', 'CVNA', 'Mark Jenkins', 'COO', 'Sell', 60000, 322.50, 8, false),
      I('i5', 'CVNA', 'Ellen Park', 'Director', 'Sell', 25000, 318.00, 7, false), I('i6', 'LMT', 'Victor Osei', 'Director', 'Buy', 1000, 497.80, 12, false),
      I('i7', 'CEG', 'Hannah Ross', 'EVP, Generation', 'Buy', 2500, 330.40, 16, false), I('i8', 'NVDA', 'Family trust of a director', 'Director', 'Sell', 150000, 199.10, 10, true),
      I('i9', 'ANET', 'Kenji Watanabe', 'SVP, Engineering', 'Sell', 20000, 148.20, 9, true), I('i10', 'NRG', 'Daniel Ortiz', 'Director', 'Buy', 6000, 161.00, 5, false),
      I('i11', 'NRG', 'Maya Lindqvist', 'CEO', 'Buy', 8000, 158.70, 4, false), I('i12', 'PLTR', 'Chief Technology Officer', 'CTO', 'Sell', 300000, 190.40, 6, true)
    ];
    const F = (id, fund, act, sym, val, pct, chg, ago) => ({ id, fund, act, sym, val, pct, chg, ago });
    const FUND = [
      F('f1', 'Larch Capital', 'New', 'VST', 412, 4.1, 'New position', 40), F('f2', 'Northgate Partners', 'Added', 'LMT', 260, 2.8, '+38%', 39),
      F('f3', 'Ridgeway Asset Mgmt', 'Exited', 'NVDA', 1120, 0, 'Sold all', 41), F('f4', 'Halcyon Point', 'New', 'ANET', 180, 3.0, 'New position', 40),
      F('f5', 'Osprey Lane', 'Trimmed', 'CVNA', 95, 1.2, '−42%', 38), F('f6', 'Cinder Hill', 'Added', 'CEG', 330, 5.6, '+61%', 40),
      F('f7', 'Larch Capital', 'Added', 'NRG', 140, 1.4, '+120%', 40), F('f8', 'Halcyon Point', 'Trimmed', 'AMD', 210, 2.2, '−35%', 40),
      F('f9', 'Northgate Partners', 'New', 'GD', 150, 1.6, 'New position', 39)
    ];
    const O = (id, tm, sym, exp, dte, k, cp, side, type, prem, ct, vol, oi, iv, s, read, ago) => ({ id, tm, sym, exp, dte, k, cp, side, type, prem, ct, vol, oi, iv, s, read, ago });
    const FLOW = [
      O('o1', '15:42', 'VST', 'Nov 20', 42, 230, 'C', 'Ask', 'Sweep', 2.31, 1850, 7410, 1820, 44, 'bull', 'Opening bullish · spans Oct 29 earnings', 0),
      O('o2', '15:31', 'NVDA', 'Oct 16', 7, 180, 'P', 'Ask', 'Block', 1.62, 4000, 22300, 31000, 38, 'bear', 'Short-dated hedge into expiration', 0),
      O('o3', '15:12', 'LMT', 'Dec 18', 70, 540, 'C', 'Ask', 'Sweep', 0.98, 1200, 2900, 640, 27, 'bull', 'Opening bullish · before budget markup', 0),
      O('o4', '14:58', 'CVNA', 'Nov 20', 42, 260, 'P', 'Ask', 'Sweep', 1.44, 2100, 6800, 1950, 71, 'bear', 'Opening bearish · after insider selling', 0),
      O('o5', '14:40', 'SPY', 'Oct 16', 7, 705, 'P', 'Bid', 'Block', 3.80, 12000, 84000, 120500, 15, 'neutral', 'Puts sold for income · range-bound view', 0),
      O('o6', '14:22', 'ANET', 'Jan 15', 98, 170, 'C', 'Ask', 'Split', 0.64, 1500, 3300, 2900, 42, 'bull', 'Adding to a bullish position', 0),
      O('o7', '13:55', 'CEG', 'Nov 20', 42, 380, 'C', 'Ask', 'Sweep', 0.72, 900, 2400, 610, 40, 'bull', 'Opening bullish · power theme', 0),
      O('o8', '13:31', 'JPM', 'Oct 16', 7, 310, 'C', 'Mid', 'Block', 0.41, 1000, 5200, 8800, 24, 'neutral', 'Likely a straddle leg into earnings', 0),
      O('o9', '12:48', 'PLTR', 'Oct 23', 14, 190, 'C', 'Bid', 'Sweep', 0.52, 2600, 9100, 14200, 55, 'bear', 'Calls sold · likely closing', 0),
      O('o10', '11:20', 'RTX', 'Dec 18', 70, 180, 'C', 'Ask', 'Sweep', 0.35, 1100, 2200, 480, 26, 'bull', 'Opening bullish · defense basket', 0),
      O('o11', '10:42', 'TSLA', 'Oct 16', 7, 480, 'C', 'Ask', 'Sweep', 2.90, 9800, 61000, 44000, 58, 'bull', 'Short-dated momentum bet', 0),
      O('o12', '10:05', 'XLU', 'Nov 20', 42, 95, 'C', 'Ask', 'Block', 1.10, 10000, 14800, 3100, 19, 'bull', 'Sector bet on utilities', 0),
      O('o13', '09:48', 'NVDA', 'Nov 20', 42, 210, 'C', 'Ask', 'Sweep', 1.90, 3400, 12800, 9600, 41, 'bull', 'Opening bullish · into Nov 18 earnings', 0),
      O('o14', '09:36', 'GD', 'Dec 18', 70, 350, 'C', 'Ask', 'Split', 0.28, 700, 1500, 390, 23, 'bull', 'Opening bullish · defense basket', 0),
      O('o15', '10:12', 'VST', 'Oct 16', 13, 200, 'C', 'Ask', 'Sweep', 0.86, 2400, 6100, 2000, 39, 'bull', 'Opening bullish', 6),
      O('o16', '14:05', 'VST', 'Sep 18', 20, 170, 'P', 'Ask', 'Block', 0.60, 3000, 4200, 2600, 46, 'bear', 'Hedge before a gas-price spike', 38)
    ];
    const NEWS = [
      { id: 'n1', syms: ['VST', 'CEG', 'NRG', 'XLU'], h: 'Grid operators raise 2027 data-center load forecasts again', src: 23, s: 'pos', ago: 2 },
      { id: 'n2', syms: ['LMT', 'RTX', 'GD'], h: 'Senate Armed Services schedules budget markup for Wednesday', src: 11, s: 'pos', ago: 1 },
      { id: 'n3', syms: ['NVDA', 'AMD', 'SMH'], h: 'Chip export rule revisions slip to November', src: 31, s: 'neg', ago: 1 },
      { id: 'n4', syms: ['CVNA'], h: 'Short-seller report questions Carvana’s loan sales', src: 14, s: 'neg', ago: 4 },
      { id: 'n5', syms: [], h: 'Payrolls miss forecasts; wage growth cools to 3.4%', src: 48, s: 'neu', ago: 0 },
      { id: 'n6', syms: ['VST'], h: 'Vistra in advanced talks on a second nuclear power deal, sources say', src: 9, s: 'pos', ago: 15 },
      { id: 'n7', syms: ['VST', 'NRG'], h: 'Texas grid sets a new September demand record', src: 12, s: 'pos', ago: 22 },
      { id: 'n8', syms: ['VST'], h: 'Gas price spike squeezes merchant power margins', src: 7, s: 'neg', ago: 70 },
      { id: 'n9', syms: ['JPM'], h: 'Banks brace for slower trading revenue in Q3', src: 16, s: 'neg', ago: 3 }
    ];
    const E = (sym, ago, q, st, note) => ({ sym, ago, q, st, note });
    const EARN = [
      E('VST', 44, 'Q2', 'bull', 'EPS beat by 9% · raised 2026 EBITDA guidance · stock +6.1% next day'), E('VST', 108, 'Q1', 'neutral', 'EPS in line · guidance reaffirmed'),
      E('VST', 171, 'Q4', 'bull', 'EPS beat by 4% · new $1.5B buyback'), E('VST', 236, 'Q3', 'bear', 'Revenue miss · stock −5.2% next day'),
      E('LMT', 57, 'Q2', 'neutral', 'In line · F-35 deliveries resumed'), E('CEG', 47, 'Q2', 'bull', 'Beat · data-center contract pipeline doubled'),
      E('NVDA', 31, 'Q2', 'bull', 'Beat · guidance above consensus'), E('CVNA', 50, 'Q2', 'bull', 'Record units · margin expansion'),
      E('JPM', 63, 'Q2', 'bull', 'Beat on trading revenue'), E('ANET', 47, 'Q2', 'bull', 'Beat · raised AI networking target')
    ];
    const TAPE = [
      ['I', 'VST', '2 directors bought $4.1M', 'bull', 'SEC Form 4 · Oct 6'], ['C', 'LMT', 'Sen. Whitcomb (R-TX) bought $50K–$100K', 'bull', 'Senate disclosure · Sep 30'], ['O', 'VST', '$2.31M Nov $230 call sweep', 'bull', 'OPRA · Fri 3:42 PM'],
      ['I', 'CVNA', 'COO sold $19.4M, not pre-planned', 'bear', 'SEC Form 4 · Sep 29'], ['O', 'CVNA', '$1.44M Nov $260 put sweep', 'bear', 'OPRA · Fri 2:58 PM'], ['C', 'NVDA', 'Rep. Okafor (D-NY) sold $250K–$500K', 'bear', 'House disclosure · Oct 7'],
      ['F', 'CEG', 'Cinder Hill grew its stake 61%', 'bull', '13F · Q2'], ['I', 'NRG', 'CEO + director bought $2.2M', 'bull', 'SEC Form 4 · Oct 5'], ['M', 'FED', 'December cut odds 71% (+9)', 'neutral', 'Kalshi + Polymarket'],
      ['C', 'GD', 'Rep. Hollis (R-FL) bought $50K–$100K', 'bull', 'House disclosure · Oct 6'], ['O', 'TSLA', '$2.9M Oct 16 $480 call sweep', 'bull', 'OPRA · Fri 10:42 AM'], ['N', 'NVDA', 'Export rule revisions slip to November', 'bear', '31 sources']
    ];
    const S = (sym, dir, score, hz, cat, catD, thesis, target, stop, plays, risks) => ({ sym, dir, score, hz, cat, catD, thesis, target, stop, plays, risks });
    const SU = [
      S('VST', 'bull', 92, 'Weeks', 'Earnings', 'Oct 29', 'Two directors bought $4.1M, an Energy & Commerce member bought, a top fund opened a $412M stake, and call buyers swept $3.2M of upside — all into Oct 29 earnings.', 236, 199, [{ t: 'cs', exp: 'Nov 20', dte: 42, k1: 215, k2: 240 }, { t: 'shares' }, { t: 'csp', exp: 'Nov 20', dte: 42, k: 200 }], ['A gas-price spike would squeeze margins, as it did in August.', 'At 27× forward earnings, a guidance miss on Oct 29 could hit hard.', 'Congress and fund data lag — part of the move may be priced in.']),
      S('LMT', 'bull', 88, 'Weeks', 'Budget markup', 'Oct 14', 'Two Armed Services members bought before Wednesday’s budget markup, a top-quartile fund lifted its stake 38%, and $980K of December calls traded at the ask.', 548, 497, [{ t: 'cs', exp: 'Dec 18', dte: 70, k1: 520, k2: 560 }, { t: 'shares' }, { t: 'csp', exp: 'Nov 20', dte: 42, k: 495 }], ['A smaller procurement line on Wednesday would undercut the thesis.', 'Earnings Oct 20 add a second event; F-35 margins are the swing factor.']),
      S('CVNA', 'bear', 86, 'Weeks', 'Earnings', 'Oct 28', 'Executives sold $27M outside pre-planned programs, a short-seller report questioned loan sales, and put buyers paid $1.44M for November downside.', 255, 322, [{ t: 'ps', exp: 'Nov 20', dte: 42, k1: 290, k2: 250 }, { t: 'pp', exp: 'Nov 20', dte: 42, k: 280 }, { t: 'shares' }], ['Short squeezes are violent — short interest is 9.8% of float.', 'A strong unit-growth print on Oct 28 could overwhelm the negative signals.']),
      S('CEG', 'bull', 81, 'Months', 'Earnings', 'Nov 3', 'The power trade’s second leg: an Energy & Commerce member bought, an executive bought $826K, and a top fund grew its stake 61%.', 392, 331, [{ t: 'cs', exp: 'Dec 18', dte: 70, k1: 360, k2: 400 }, { t: 'shares' }, { t: 'csp', exp: 'Nov 20', dte: 42, k: 330 }], ['Nuclear contract timing is lumpy; a delay would test patience.', 'Utilities sell off when rate-cut odds fall.']),
      S('NRG', 'bull', 77, 'Weeks', 'Earnings', 'Nov 6', 'The CEO and a director bought $2.2M within two days — a textbook cluster buy — while a top fund more than doubled its position.', 181, 154, [{ t: 'shares' }, { t: 'cs', exp: 'Dec 18', dte: 70, k1: 165, k2: 185 }, { t: 'csp', exp: 'Nov 20', dte: 42, k: 155 }], ['Retail power margins swing with the weather.', 'Smaller company: moves are bigger in both directions.']),
      S('GD', 'bull', 71, 'Weeks', 'Budget markup', 'Oct 14', 'An Armed Services member bought and a top fund opened a new position — and options are cheap, with IV rank at 19.', 362, 324, [{ t: 'lc', exp: 'Dec 18', dte: 70, k: 350 }, { t: 'shares' }, { t: 'cs', exp: 'Dec 18', dte: 70, k1: 340, k2: 370 }], ['Business-jet delivery timing can swing a quarter.', 'Budget headlines can reverse quickly.']),
      S('RTX', 'bull', 69, 'Weeks', 'Budget markup', 'Oct 14', 'Part of the defense basket: Armed Services buying this year and fresh opening call sweeps ahead of the markup.', 184, 163, [{ t: 'cs', exp: 'Dec 18', dte: 70, k1: 175, k2: 190 }, { t: 'shares' }], ['Engine recall costs remain an overhang.', 'Thinner signal than LMT — fewer independent sources.']),
      S('ANET', 'bull', 66, 'Months', 'Earnings', 'Nov 4', 'A Senate Commerce member bought and a top fund opened a $180M position. The only insider sale was pre-planned.', 172, 145, [{ t: 'shares' }, { t: 'cs', exp: 'Jan 15', dte: 98, k1: 160, k2: 185 }], ['Two cloud customers drive most revenue.', 'At 41× forward earnings there is little room for a miss.']),
      S('JPM', 'vol', 62, 'Days', 'Earnings', 'Oct 13', 'Options price a ±3.1% move for Tuesday’s earnings. JPM has actually moved ±3.9% on average over its last eight reports — the event looks underpriced.', null, null, [{ t: 'straddle', exp: 'Oct 16', dte: 7, k: 310 }], ['If the move comes in under the breakeven, the straddle loses.', 'Time decay is fast with seven days left.']),
      S('PLTR', 'bear', 58, 'Weeks', 'Earnings', 'Nov 2', 'Calls are being sold, not bought; the CTO keeps selling under a 10b5-1 plan; momentum is fading below the 20-day average.', 165, 195, [{ t: 'ps', exp: 'Nov 20', dte: 42, k1: 180, k2: 160 }, { t: 'shares' }], ['Retail enthusiasm can override weak signals for a long time.', 'A big contract headline would squeeze bears.']),
      S('TSLA', 'bull', 55, 'Days', 'Options expiration', 'Oct 16', 'Short-dated call sweeps into Friday’s expiration. Momentum only — no insider, Congress or fund support.', 480, 438, [{ t: 'shares' }, { t: 'lc', exp: 'Oct 16', dte: 7, k: 480 }], ['Short-dated options lose value fast if the move stalls.', 'Momentum-only setups have the lowest hit rate in Tape’s history.']),
      S('NVDA', 'mixed', 48, 'Weeks', 'Earnings', 'Nov 18', 'Split signals: a House member sold and a large fund exited, while call buyers bet $1.9M on Nov 18 earnings. No edge until they line up.', null, null, [{ t: 'wait' }], ['Waiting has a cost if the November report is strong.'])
    ];
    const HOLD = [['NVDA', 120, 118.40], ['VST', 100, 151.20], ['CEG', 40, 262.00], ['LMT', 25, 468.10], ['QQQ', 60, 512.30], ['SMH', 50, 248.90], ['JPM', 70, 242.75], ['CVNA', 30, 265.40]];
    const STORIES = [
      { id: 'n1', h: 'Grid operators raise 2027 data-center load forecasts again', what: 'More power demand than expected — the bull case for VST, CEG and NRG just got a bigger number.', lvl: 3, syms: ['VST', 'CEG', 'NRG'], hist: 'Last 4 forecast raises: VST +3.1% avg over 5 days', src: 23, ago: '2d ago', s: 'pos' },
      { id: 'n4', h: 'Short-seller report questions Carvana’s loan sales', what: 'Lands on top of $27M of executive selling and bearish put flow. This is the warning on a stock you own.', lvl: 3, syms: ['CVNA'], hist: 'Short reports + insider selling: −12% avg over 30 days', src: 14, ago: '4d ago', s: 'neg' },
      { id: 'n2', h: 'Senate Armed Services schedules budget markup for Wednesday', what: 'A procurement bump flows straight to LMT, RTX and GD. Two committee members already bought.', lvl: 2, syms: ['LMT', 'RTX', 'GD'], hist: 'Defense names +1.8% avg in the week after a markup', src: 11, ago: '1d ago', s: 'pos' },
      { id: 'n3', h: 'Chip export rule revisions slip to November', what: 'Removes a near-term catalyst for NVDA — your largest exposure — and keeps uncertainty alive.', lvl: 2, syms: ['NVDA', 'AMD'], hist: 'Prior delays: semis −1.2% avg over 5 days', src: 31, ago: '1d ago', s: 'neg' },
      { id: 'n5', h: 'Payrolls miss; wage growth cools to 3.4%', what: 'Lifts December cut odds to 71%. Utilities and small caps usually benefit when rates are expected to fall.', lvl: 2, syms: ['XLU', 'SPY'], hist: 'Soft payrolls: utilities +0.9% avg next week', src: 48, ago: 'Fri', s: 'pos' },
      { id: 'n9', h: 'Banks brace for slower trading revenue in Q3', what: 'Sets a low bar for JPM on Tuesday. Options price a smaller move than JPM usually delivers.', lvl: 1, syms: ['JPM'], hist: 'JPM earnings moves: ±3.9% avg, last 8 reports', src: 16, ago: '3d ago', s: 'neg' },
      { id: 'n6', h: 'Vistra in advanced talks on a second nuclear power deal, sources say', what: 'A signed deal would lock in premium prices for years. Not confirmed yet.', lvl: 1, syms: ['VST'], hist: 'First deal announcement: VST +9.4% in a day', src: 9, ago: '3w ago', s: 'pos' }
    ];
    return { M, N, days, TK, CONG, INS, FUND, FLOW, NEWS, EARN, TAPE, SU, HOLD, STORIES, LOOK: { QQQ: 0.095, SMH: 0.21 } };
  }

  rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; }
  series(sym) {
    if (this._s[sym]) return this._s[sym];
    const D = this.D, t = D.TK[sym], N = D.N, r = this.rng(this.hash(sym) + 7);
    const anc = [[N - 1, t.p0]].concat(t.a || [], [[5, t.px / (1 + t.wk / 100)], [1, t.px / (1 + t.d / 100)], [0, t.px]]).map(([ago, p]) => [N - 1 - ago, Math.log(p)]).sort((a, b) => a[0] - b[0]);
    const out = new Array(N);
    for (let k = 0; k < anc.length - 1; k++) {
      const [i0, l0] = anc[k], [i1, l1] = anc[k + 1], n = i1 - i0; if (n <= 0) continue;
      const w = [0]; for (let j = 1; j <= n; j++) w.push(w[j - 1] + (r() - 0.5) * 2 * t.v);
      for (let j = 0; j <= n; j++) out[i0 + j] = Math.exp(l0 + (l1 - l0) * j / n + (w[j] - w[n] * j / n));
    }
    return (this._s[sym] = out);
  }
  walk(key, n, dir) { const r = this.rng(this.hash(key)); const a = [0]; for (let i = 1; i < n; i++) a.push(a[i - 1] + (r() - 0.5)); const k = (dir >= 0 ? 1 : -1) * (Math.abs(a[n - 1]) + 2.5) / (n - 1); return a.map((v, i) => v + k * i); }
  fd(ago) { const d = this.D.days[this.D.N - 1 - ago]; return d ? this.D.M[d.getMonth()] + ' ' + d.getDate() : ''; }
  lag(r) { const D = this.D; return Math.round((D.days[D.N - 1 - r.f] - D.days[D.N - 1 - r.t]) / 864e5); }
  daysTo(md) { const mi = { Oct: 9, Nov: 10, Dec: 11, Jan: 0 }, p = (md || '').split(' '); if (mi[p[0]] == null) return null; return Math.round((new Date(p[0] === 'Jan' ? 2027 : 2026, mi[p[0]], +p[1]) - new Date(2026, 9, 10)) / 864e5); }
  pct(x, dp) { return (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(dp == null ? 1 : dp) + '%'; }
  upc(x) { return x >= 0 ? '#1FD18A' : '#FF5D5D'; }
  usd(m) { return m >= 1000 ? '$' + (m / 1000).toFixed(2) + 'B' : m >= 1 ? '$' + m.toFixed(m >= 100 ? 0 : 1) + 'M' : '$' + Math.round(m * 1000) + 'K'; }
  money(x) { return (x < 0 ? '−' : '') + '$' + Math.round(Math.abs(x)).toLocaleString('en-US'); }
  m2(x) { return '$' + x.toFixed(2); }
  spark(a, w, h) { const mn = Math.min.apply(null, a), mx = Math.max.apply(null, a), r = mx - mn || 1; return a.map((v, i) => (i ? 'L' : 'M') + (i / (a.length - 1) * w).toFixed(1) + ',' + (h - 1 - (v - mn) / r * (h - 2)).toFixed(1)).join(''); }
  since(sym, ago) { const s = this.series(sym); return (s[s.length - 1] / s[s.length - 1 - ago] - 1) * 100; }
  chip(code, st) { const m = { bull: ['rgba(31,209,138,.14)', '#3FE0A0'], bear: ['rgba(255,93,93,.14)', '#FF7A7A'], vol: ['rgba(245,181,68,.14)', '#F5B544'] }[st] || ['#1B222D', '#C3CBD6']; return { code, bg: m[0], fg: m[1] }; }
  dirS(dir) { return { bull: { c: '#1FD18A', lab: 'BULLISH', bg: 'rgba(31,209,138,.14)', fg: '#3FE0A0' }, bear: { c: '#FF5D5D', lab: 'BEARISH', bg: 'rgba(255,93,93,.14)', fg: '#FF7A7A' }, vol: { c: '#F5B544', lab: 'VOLATILITY', bg: 'rgba(245,181,68,.14)', fg: '#F5B544' }, mixed: { c: '#7D8796', lab: 'NO EDGE', bg: '#1B222D', fg: '#C3CBD6' } }[dir]; }

  signals(sym) {
    const D = this.D, out = [];
    D.CONG.filter(r => r.sym === sym).forEach(r => out.push({ id: r.id, code: 'C', ago: r.f, from: r.t, st: r.side === 'Buy' ? 'bull' : 'bear', title: r.who + ' (' + r.p + '-' + r.st + ') ' + (r.side === 'Buy' ? 'bought ' : 'sold ') + r.amt, detail: 'Traded ' + this.fd(r.t) + ', disclosed ' + this.fd(r.f) + ' — ' + this.lag(r) + ' days later · ' + r.com + (r.rel ? ' (committee overlap)' : ''), src: r.ch === 'Senate' ? 'Senate disclosure' : 'House disclosure' }));
    D.INS.filter(r => r.sym === sym).forEach(r => out.push({ id: r.id, code: 'I', ago: r.ago, st: r.plan ? 'neutral' : r.side === 'Buy' ? 'bull' : 'bear', title: r.who + ', ' + r.role + ', ' + (r.side === 'Buy' ? 'bought ' : 'sold ') + r.sh.toLocaleString('en-US') + ' sh at $' + r.px.toFixed(2), detail: this.usd(r.sh * r.px / 1e6) + (r.plan ? ' · pre-scheduled 10b5-1 sale, low signal' : ' · open-market ' + (r.side === 'Buy' ? 'purchase with own money' : 'sale, not pre-planned')), src: 'SEC Form 4' }));
    D.FUND.filter(r => r.sym === sym).forEach(r => out.push({ id: r.id, code: 'F', ago: r.ago, st: r.act === 'New' || r.act === 'Added' ? 'bull' : 'bear', title: r.fund + ': ' + (r.act === 'New' ? 'new position' : r.act === 'Exited' ? 'exited position' : r.act.toLowerCase() + ' ' + r.chg), detail: this.usd(r.val) + (r.pct ? ' · ' + r.pct + '% of the fund' : '') + ' · Q2 13F', src: 'SEC 13F' }));
    D.FLOW.filter(r => r.sym === sym).forEach(r => out.push({ id: r.id, code: 'O', ago: r.ago, st: r.s, title: '$' + r.prem.toFixed(2) + 'M ' + r.type.toLowerCase() + ' · ' + r.exp + ' $' + r.k + (r.cp === 'C' ? ' calls' : ' puts'), detail: r.read + ' · ' + (r.vol / r.oi).toFixed(1) + '× open interest', src: 'OPRA' }));
    D.NEWS.filter(r => r.syms.indexOf(sym) >= 0).forEach(r => out.push({ id: r.id, code: 'N', ago: r.ago, st: r.s === 'pos' ? 'bull' : r.s === 'neg' ? 'bear' : 'neutral', title: r.h, detail: r.src + ' articles merged into one story', src: 'Newswires' }));
    D.EARN.filter(r => r.sym === sym).forEach(r => out.push({ id: sym + r.q + r.ago, code: 'E', ago: r.ago, st: r.st, title: r.q + ' earnings', detail: r.note, src: '8-K + call transcript' }));
    return out.map(x => Object.assign(x, { since: this.since(sym, x.ago), date: this.fd(x.ago) })).sort((a, b) => a.ago - b.ago);
  }
  conf(sym) {
    const sg = this.signals(sym).filter(x => x.code !== 'E' && (x.ago <= 63 || x.code === 'F'));
    const by = {}; sg.forEach(x => { const b = by[x.code] || (by[x.code] = { bull: 0, bear: 0, n: 0 }); b.n++; if (x.st === 'bull') b.bull++; if (x.st === 'bear') b.bear++; });
    const s = this.series(sym), L = s.length, px = s[L - 1], sma = n => s.slice(L - n).reduce((a, b) => a + b, 0) / n;
    const a50 = px > sma(50), a200 = px > sma(200);
    const names = { C: 'Congress', I: 'Insiders', F: 'Funds (13F)', O: 'Options flow', N: 'News' };
    const rows = ['I', 'C', 'F', 'O', 'N'].filter(k => by[k]).map(k => { const b = by[k]; return { k, name: names[k], n: b.n, st: b.bull > b.bear ? 'bull' : b.bear > b.bull ? 'bear' : 'neutral' }; });
    rows.push({ k: 'T', name: 'Technicals', n: 1, st: a50 && a200 ? 'bull' : !a50 && !a200 ? 'bear' : 'neutral', note: (a50 ? 'Above' : 'Below') + ' 50-day · ' + (a200 ? 'above' : 'below') + ' 200-day' });
    return { rows, sg, bulls: rows.filter(r => r.st === 'bull').length, bears: rows.filter(r => r.st === 'bear').length };
  }

  cdf(x) { const z = Math.abs(x) / Math.SQRT2, t = 1 / (1 + 0.3275911 * z), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z); return 0.5 * (1 + (x >= 0 ? y : -y)); }
  bs(S, K, T, iv, cp) { const r = 0.04, v = iv / 100, sq = v * Math.sqrt(T), d1 = (Math.log(S / K) + (r + v * v / 2) * T) / sq, d2 = d1 - sq, df = Math.exp(-r * T); return cp === 'C' ? S * this.cdf(d1) - K * df * this.cdf(d2) : K * df * this.cdf(-d2) - S * this.cdf(-d1); }
  pAbove(S, X, T, iv) { const v = iv / 100, sq = v * Math.sqrt(T); return this.cdf((Math.log(S / X) + (0.04 - v * v / 2) * T) / sq); }
  calcPlay(su, p) {
    const t = this.D.TK[su.sym], S = t.px, iv = t.iv || 30, T = (p.dte || 30) / 365, m = x => this.money(x), m2 = x => this.m2(x);
    const C = k => this.bs(S, k, T, iv, 'C'), P = k => this.bs(S, k, T, iv, 'P'), pr = x => Math.round(x * 100) + '% chance of profit';
    const o = { kind: 'options', t: p.t };
    if (p.t === 'shares' && su.dir === 'bull') {
      const risk = S - su.stop, rew = su.target - S;
      Object.assign(o, { kind: 'shares', tab: 'Shares', name: 'Buy shares', legs: ['Buy 100 shares at ' + m2(S)], line: 'Risk ' + m(risk * 100) + ' to make ' + m(rew * 100) + ' · ' + (rew / risk).toFixed(1) + ' : 1', facts: [['Cost, 100 shares', m(S * 100)], ['Target', m2(su.target) + ' (' + this.pct((su.target / S - 1) * 100) + ')'], ['Stop', m2(su.stop) + ' (' + this.pct((su.stop / S - 1) * 100) + ')'], ['Risk at stop', m(risk * 100)], ['Reward at target', m(rew * 100)], ['Reward : risk', (rew / risk).toFixed(1) + ' : 1']], f: x => (x - S) * 100, bes: [], popTxt: (rew / risk).toFixed(1) + ' : 1 reward/risk' });
    } else if (p.t === 'shares') {
      Object.assign(o, { kind: 'none', tab: su.dir === 'bear' ? 'Shares' : 'Shares', name: 'Trim or avoid the shares', legs: ['If you own ' + su.sym + ', consider reducing before ' + su.catD + '.'], line: 'Signals point lower into ' + su.cat.toLowerCase() + ' on ' + su.catD + '.', facts: [], f: null, popTxt: '' });
    } else if (p.t === 'cs') {
      const db = C(p.k1) - C(p.k2), mg = (p.k2 - p.k1 - db) * 100, be = p.k1 + db, pop = this.pAbove(S, be, T, iv);
      Object.assign(o, { tab: 'Call spread', name: 'Call spread · ' + p.exp + ' $' + p.k1 + '/$' + p.k2, legs: ['Buy 1 ' + p.exp + ' $' + p.k1 + ' call', 'Sell 1 ' + p.exp + ' $' + p.k2 + ' call'], line: 'Pay ' + m(db * 100) + ' → make up to ' + m(mg) + ' · ' + (mg / (db * 100)).toFixed(1) + ' : 1', facts: [['You pay', m(db * 100)], ['Max loss', m(db * 100)], ['Max gain', m(mg)], ['Breakeven', m2(be) + ' (' + this.pct((be / S - 1) * 100) + ')'], ['Chance of profit', Math.round(pop * 100) + '%'], ['Expires', p.exp + ' · ' + p.dte + ' days']], f: x => (Math.max(0, x - p.k1) - Math.max(0, x - p.k2) - db) * 100, bes: [be], popTxt: pr(pop) });
    } else if (p.t === 'ps') {
      const db = P(p.k1) - P(p.k2), mg = (p.k1 - p.k2 - db) * 100, be = p.k1 - db, pop = 1 - this.pAbove(S, be, T, iv);
      Object.assign(o, { tab: 'Put spread', name: 'Put spread · ' + p.exp + ' $' + p.k1 + '/$' + p.k2, legs: ['Buy 1 ' + p.exp + ' $' + p.k1 + ' put', 'Sell 1 ' + p.exp + ' $' + p.k2 + ' put'], line: 'Pay ' + m(db * 100) + ' → make up to ' + m(mg) + ' if it falls · ' + (mg / (db * 100)).toFixed(1) + ' : 1', facts: [['You pay', m(db * 100)], ['Max loss', m(db * 100)], ['Max gain', m(mg)], ['Breakeven', m2(be) + ' (' + this.pct((be / S - 1) * 100) + ')'], ['Chance of profit', Math.round(pop * 100) + '%'], ['Expires', p.exp + ' · ' + p.dte + ' days']], f: x => (Math.max(0, p.k1 - x) - Math.max(0, p.k2 - x) - db) * 100, bes: [be], popTxt: pr(pop) });
    } else if (p.t === 'csp') {
      const cr = P(p.k), be = p.k - cr, pop = this.pAbove(S, be, T, iv);
      Object.assign(o, { tab: 'Sell a put', name: 'Sell a put · ' + p.exp + ' $' + p.k, legs: ['Sell 1 ' + p.exp + ' $' + p.k + ' put', 'Keep ' + m(p.k * 100) + ' cash in case you’re assigned'], line: 'Collect ' + m(cr * 100) + ' now · own it at ' + m2(be) + ' if it dips', facts: [['You collect', m(cr * 100)], ['Cash set aside', m(p.k * 100)], ['Yield', (cr / p.k * 100).toFixed(1) + '% in ' + p.dte + ' days'], ['Breakeven', m2(be) + ' (' + this.pct((be / S - 1) * 100) + ')'], ['Chance of profit', Math.round(pop * 100) + '%'], ['Expires', p.exp + ' · ' + p.dte + ' days']], f: x => (cr - Math.max(0, p.k - x)) * 100, bes: [be], popTxt: pr(pop) });
    } else if (p.t === 'lc') {
      const c = C(p.k), be = p.k + c, pop = this.pAbove(S, be, T, iv);
      Object.assign(o, { tab: 'Buy a call', name: 'Buy a call · ' + p.exp + ' $' + p.k, legs: ['Buy 1 ' + p.exp + ' $' + p.k + ' call'], line: 'Pay ' + m(c * 100) + ' → uncapped upside above ' + m2(be), facts: [['You pay', m(c * 100)], ['Max loss', m(c * 100)], ['Max gain', 'Uncapped'], ['Breakeven', m2(be) + ' (' + this.pct((be / S - 1) * 100) + ')'], ['Chance of profit', Math.round(pop * 100) + '%'], ['Expires', p.exp + ' · ' + p.dte + ' days']], f: x => (Math.max(0, x - p.k) - c) * 100, bes: [be], popTxt: pr(pop) });
    } else if (p.t === 'straddle') {
      const c = C(p.k) + P(p.k), u = p.k + c, dn = p.k - c, pop = this.pAbove(S, u, T, iv) + (1 - this.pAbove(S, dn, T, iv));
      Object.assign(o, { tab: 'Straddle', name: 'Straddle · ' + p.exp + ' $' + p.k, legs: ['Buy 1 ' + p.exp + ' $' + p.k + ' call', 'Buy 1 ' + p.exp + ' $' + p.k + ' put'], line: 'Pay ' + m(c * 100) + ' → profit on a move bigger than ±' + (c / S * 100).toFixed(1) + '%', facts: [['You pay', m(c * 100)], ['Max loss', m(c * 100)], ['Max gain', 'Uncapped'], ['Breakevens', m2(dn) + ' / ' + m2(u)], ['Chance of profit', Math.round(pop * 100) + '%'], ['Expires', p.exp + ' · ' + p.dte + ' days']], f: x => (Math.abs(x - p.k) - c) * 100, bes: [dn, u], popTxt: pr(pop) });
    } else if (p.t === 'pp') {
      const c = P(p.k);
      Object.assign(o, { tab: 'Protect', name: 'Protective put · ' + p.exp + ' $' + p.k, legs: ['Keep your 100 shares', 'Buy 1 ' + p.exp + ' $' + p.k + ' put'], line: 'Insure 100 shares below ' + m2(p.k) + ' for ' + m(c * 100) + ' (' + (c / S * 100).toFixed(1) + '% of value)', facts: [['Insurance cost', m(c * 100)], ['Protected below', m2(p.k)], ['Worst case', m((S - p.k + c) * 100) + ' loss'], ['Cost as % of value', (c / S * 100).toFixed(1) + '%'], ['Upside kept', 'All of it, minus cost'], ['Expires', p.exp + ' · ' + p.dte + ' days']], f: x => (Math.max(x, p.k) - S - c) * 100, bes: [S + c], popTxt: 'Caps your loss at ' + m((S - p.k + c) * 100) });
    } else {
      Object.assign(o, { kind: 'none', tab: 'Wait', name: 'No clear edge — wait', legs: ['Signals conflict. Tape will alert you the moment they line up.'], line: 'Signals conflict. Tape alerts you when they line up.', facts: [], f: null, popTxt: 'No trade' });
    }
    return o;
  }
  setups() {
    if (this._su) return this._su;
    const D = this.D, names = { C: 'Congress', I: 'Insiders', F: 'Funds', O: 'Options flow', N: 'News' };
    this._su = D.SU.map(su => {
      const t = D.TK[su.sym], cf = this.conf(su.sym), counts = {};
      cf.sg.forEach(x => { counts[x.code] = (counts[x.code] || 0) + 1; });
      const chips = ['I', 'C', 'F', 'O', 'N'].filter(k => counts[k]).map(k => { const r = cf.rows.find(x => x.k === k); return Object.assign(this.chip(k, r ? r.st : 'neutral'), { label: names[k] + ' · ' + counts[k] }); });
      const plays = su.plays.map(p => this.calcPlay(su, p)), days = this.daysTo(su.catD);
      return Object.assign({}, su, { t, cf, chips, plays, best: plays[0], days, catTxt: su.cat + ' · ' + su.catD + ' (' + days + ' days)' });
    }).sort((a, b) => b.score - a.score);
    return this._su;
  }
  opCard(o) {
    const ds = this.dirS(o.dir);
    return { sym: o.sym, name: o.t.n, px: '$' + o.t.px.toFixed(2), chg: this.pct(o.t.d, 2), chgC: this.upc(o.t.d), score: String(o.score), ringC: ds.c, ringP: o.score + '%', dirLab: ds.lab, dirBg: ds.bg, dirFg: ds.fg, hz: o.hz, thesis: o.thesis, chips: o.chips, playName: o.best.name, playLine: o.best.line, pop: o.best.popTxt, cat: o.catTxt, onClick: () => this.openSym(o.sym) };
  }
  pf() {
    if (this._pf) return this._pf;
    const D = this.D, N = D.N;
    const rows = (this.state.holdings || D.HOLD).map(([sym, sh, cost]) => { const t = D.TK[sym], S = this.series(sym), L = S.length - 1; return { sym, sh, cost, t, px: t.px, val: sh * t.px, day: sh * (t.px - S[L - 1]), dayPct: (t.px / S[L - 1] - 1) * 100, wk: sh * (t.px - S[L - 5]), tot: sh * (t.px - cost), totPct: (t.px / cost - 1) * 100 }; });
    const total = rows.reduce((a, r) => a + r.val, 0), wk = rows.reduce((a, r) => a + r.wk, 0), day = rows.reduce((a, r) => a + r.day, 0), basis = rows.reduce((a, r) => a + r.sh * r.cost, 0);
    const ser = []; for (let i = 21; i >= 0; i--) ser.push((this.state.holdings || D.HOLD).reduce((a, [sym, sh]) => a + sh * this.series(sym)[N - 1 - i], 0));
    const nv = rows.reduce((a, r) => a + (r.sym === 'NVDA' ? r.val : (D.LOOK[r.sym] || 0) * r.val), 0);
    this._pf = { rows, total, wk, day, basis, ser, wkPct: wk / (total - wk) * 100, nvdaLook: nv / total * 100 };
    return this._pf;
  }
  storyVals(st) {
    const D = this.D, P = this.pf(), held = {}; P.rows.forEach(r => { held[r.sym] = r.val; });
    const ex = st.syms.reduce((a, sym) => a + (held[sym] || 0), 0), ops = this.setups();
    const su = ops.find(o => st.syms.indexOf(o.sym) >= 0 && o.dir !== 'mixed');
    const ic = st.lvl === 3 ? '#FF7A7A' : st.lvl === 2 ? '#F5B544' : '#A3ADBB';
    return { h: st.h, what: st.what, imp: st.lvl === 3 ? 'High impact' : st.lvl === 2 ? 'Medium' : 'Low', impC: ic, bars: [1, 2, 3].map(i => ({ bg: i <= st.lvl ? ic : '#1E2631' })), syms: st.syms.map(sym => ({ sym, chg: this.pct(D.TK[sym].d), c: this.upc(D.TK[sym].d), onClick: () => this.openSym(sym) })), hist: st.hist, meta: st.src + ' sources · ' + st.ago, hasExp: ex > 0, exp: 'You hold ' + this.money(ex), setup: su ? { label: 'See the ' + su.sym + ' setup (' + su.score + ')', on: () => this.openSym(su.sym) } : null, s: st.s };
  }

  aiContext() {
    const D = this.D, src = [], L = [];
    const add = t => { src.push(t); return '[' + src.length + ']'; };
    L.push('TICKERS (price, day, week): ' + Object.keys(D.TK).map(k => k + ' ' + D.TK[k].n + ' $' + D.TK[k].px + ' ' + this.pct(D.TK[k].d, 2) + ' ' + this.pct(D.TK[k].wk) + ' wk').join('; '));
    L.push('TAPE SETUPS (score 0-100 = how strongly independent signals agree): ' + this.setups().map(o => o.sym + ' ' + o.score + ' ' + o.dir + ', horizon ' + o.hz + ', catalyst ' + o.catTxt + '. Thesis: ' + o.thesis + ' Best play: ' + o.best.name + ' — ' + o.best.line + (o.best.popTxt ? ' (' + o.best.popTxt + ')' : '') + '. Risks: ' + o.risks.join(' ')).join(' || '));
    D.CONG.forEach(r => L.push('CONGRESS ' + add(r.ch + ' disclosure — ' + r.who + ', ' + this.fd(r.f)) + ': ' + r.who + ' (' + r.p + '-' + r.st + ', ' + r.com + ') ' + (r.side === 'Buy' ? 'bought ' : 'sold ') + r.sym + ' ' + r.amt + ', traded ' + this.fd(r.t) + ', disclosed ' + this.fd(r.f) + ', ' + this.pct(this.since(r.sym, r.f)) + ' since disclosure.'));
    D.INS.forEach(r => L.push('INSIDER ' + add('SEC Form 4 — ' + r.sym + ' ' + r.who + ', ' + this.fd(r.ago)) + ': ' + r.sym + ' ' + r.who + ' (' + r.role + ') ' + (r.side === 'Buy' ? 'bought ' : 'sold ') + r.sh + ' sh at $' + r.px + (r.plan ? ' under a 10b5-1 plan' : ' on the open market') + ', ' + this.fd(r.ago) + '.'));
    D.FUND.forEach(r => L.push('13F ' + add('SEC 13F — ' + r.fund + ', Q2') + ': ' + r.fund + ' ' + r.act + ' ' + r.sym + ' ' + this.usd(r.val) + ' (' + r.chg + ').'));
    D.FLOW.filter(r => r.ago === 0).forEach(r => L.push('FLOW ' + add('OPRA — ' + r.sym + ' ' + r.exp + ' $' + r.k + r.cp + ', Oct 9') + ': ' + r.sym + ' ' + r.exp + ' $' + r.k + (r.cp === 'C' ? ' calls ' : ' puts ') + r.type + ' $' + r.prem + 'M at the ' + r.side + ', vol/OI ' + (r.vol / r.oi).toFixed(1) + '. ' + r.read + '.'));
    D.STORIES.forEach(s => L.push('NEWS ' + add('Newswires — ' + s.h) + ': ' + s.h + '. ' + s.what + ' ' + s.hist + '.'));
    L.push('ODDS ' + add('Kalshi + Polymarket, Oct 10') + ': Fed cuts in December 71% (+9 this week); September CPI ≥0.3% m/m 38%; government shutdown before Nov 21 18%; US recession in 2027 24%.');
    const P = this.pf();
    L.push('USER PORTFOLIO (imported, value ' + this.money(P.total) + '): ' + P.rows.map(r => r.sym + ' ' + r.sh + ' sh, cost $' + r.cost + ', now ' + this.money(r.val) + ' (' + this.pct(r.totPct) + ')').join('; ') + '. Look-through NVDA exposure ' + P.nvdaLook.toFixed(1) + '%.');
    this._src = src;
    return L.join('\n');
  }
  toBlocks(text) {
    return String(text || '').replace(/\*\*/g, '').replace(/^#+\s*/gm, '').split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => {
      const li = /^[-•*]\s+/.test(l), body = l.replace(/^[-•*]\s+/, '');
      return { isP: !li, isLi: li, segs: body.split(/(\[\d+\])/g).filter(Boolean).map(p => /^\[\d+\]$/.test(p) ? { cite: true, t: p.slice(1, -1) } : { txt: true, t: p }) };
    });
  }
  seedMsgs() {
    const o = this.setups(), v = o[0];
    return [
      { role: 'user', text: 'Where’s the best risk/reward this week?' },
      { role: 'ai', seed: true, text: 'VST has the strongest setup (92). Best play: ' + v.best.name + ' — ' + v.best.line + '.', src: [['1', 'SEC Form 4 — Vistra directors Morales and Chen, Oct 6'], ['2', 'House disclosure — Rep. Joan Pruett, Oct 1'], ['3', 'OPRA — VST Nov 20 $230 call sweep, Oct 9'], ['4', 'Vistra Q2 10-Q and earnings call, Aug 7']] }
    ];
  }
  async ask(q) {
    q = (q || '').trim(); if (!q || this.state.aiBusy) return;
    const msgs = (this.state.msgs || this.seedMsgs()).concat([{ role: 'user', text: q }]);
    this.setState({ msgs, aiBusy: true, aiOpen: true, aiIn: '' });
    clearInterval(this.dotIv); this.dotIv = setInterval(() => this.setState(s => ({ tick: (s.tick + 1) % 4 })), 350);
    this.scrollAi();
    let text;
    try {
      const sys = 'You are Tape, the AI analyst inside an investing app built around one goal: helping users find and size good opportunities. Today is Saturday, October 10, 2026; markets last traded Friday, October 9. Answer ONLY from DATA (sample data for a prototype). Be direct and money-focused: what is happening, why it matters for returns, how someone could act (shares or a specific options structure from DATA), and the main risk. Under 140 words. Plain text: short paragraphs or lines starting with "- ". No headings, no bold, no tables. Cite facts inline as [n] using the bracket numbers in DATA. Frame ideas as research, not personal advice. If DATA does not cover the question, say so in one sentence and suggest what Tape does cover.\n\nDATA:\n' + this.aiContext();
      text = await this.complete({ system: sys, max_tokens: 700, messages: msgs.slice(-7).filter((m, i, a) => !(i === 0 && m.role !== 'user')).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })) });
    } catch (e) { text = e.message || 'The analyst is unavailable. Try again in a moment.'; }
    clearInterval(this.dotIv);
    this.setState(s => ({ msgs: s.msgs.concat([{ role: 'ai', text }]), aiBusy: false }));
    this.scrollAi();
  }

  shellVals() {
    const s = this.state, D = this.D;
    const ic = { home: 'M3 10.5 12 3l9 7.5M5 9v11h14V9', opps: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 12h.01', smart: 'M3 21h18M5 10v8M9.5 10v8M14.5 10v8M19 10v8M12 3 3 8h18z', news: 'M4 5h12v14H6a2 2 0 0 1-2-2zM16 9h4v8a2 2 0 0 1-2 2h-2M8 9h4M8 13h4M8 17h2', portfolio: 'M21 12a9 9 0 1 1-9-9v9zM15 3.5a9 9 0 0 1 5.5 5.5H15z', alerts: 'M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9zM10 20a2 2 0 0 0 4 0' };
    const defs = [['home', 'Home'], ['opps', 'Opportunities', '12', true], ['smart', 'Smart money'], ['news', 'News'], ['portfolio', 'Portfolio'], ['alerts', 'Alerts', '3']];
    const cur = s.screen === 'ticker' ? 'opps' : s.screen;
    const nav = defs.map(([k, label, badge, hot]) => ({ label, icon: ic[k], badge: badge || '', badgeBg: hot ? 'rgba(31,209,138,.16)' : '#1B222D', badgeFg: hot ? '#3FE0A0' : '#C3CBD6', onClick: () => this.go(k), bg: cur === k ? '#151E1B' : 'transparent', fg: cur === k ? '#1FD18A' : '#A3ADBB', fw: cur === k ? 600 : 500 }));
    const watch = Object.keys(s.watched || {VST:1,LMT:1,CEG:1,NVDA:1,CVNA:1,ANET:1}).filter(k => s.watched ? s.watched[k] : true).map(sym => { const t = D.TK[sym], fresh = this.signals(sym).find(x => x.ago <= 5 && x.st !== 'neutral'); return { sym, chg: this.pct(t.d, 2), color: this.upc(t.d), bg: s.screen === 'ticker' && s.sym === sym ? '#151B24' : 'transparent', onClick: () => this.openSym(sym), spark: this.spark(this.series(sym).slice(-30), 46, 16), dot: fresh ? (fresh.st === 'bull' ? '#1FD18A' : '#FF5D5D') : '' }; });
    const tape = D.TAPE.map(([code, sym, text, st]) => { const t = D.TK[sym], c = this.chip(code, st === 'neutral' ? 'x' : st); return { code, sym, text, cb: c.bg, cf: c.fg, chg: t ? this.pct(t.d) : '', cc: t ? this.upc(t.d) : '#A3ADBB', onClick: () => this.openSym(sym) }; });
    const is = {}; ['home', 'opps', 'ticker', 'smart', 'news', 'portfolio', 'alerts'].forEach(k => { is[k] = s.screen === k; });
    const msgs = (s.msgs || this.seedMsgs()).map((m, i) => {
      if (m.role === 'user') return { isUser: true, text: m.text };
      if (m.seed) {
        const v = this.setups()[0], rows = this.setups().filter(o => o.dir !== 'mixed').slice(0, 3).map(o => ({ sym: o.sym, score: String(o.score), c: this.dirS(o.dir).c, play: o.best.name, pop: o.best.popTxt.indexOf('%') > 0 ? o.best.popTxt.split('%')[0] + '%' : '—', onClick: () => { this.setState({ aiOpen: false }); this.openSym(o.sym); } }));
        const blocks = this.toBlocks('VST has the strongest setup Tape tracks right now — a 92. Two directors bought $4.1M of stock [1], an Energy & Commerce member bought [2], and call buyers swept $2.3M of November upside [3].').concat([{ isTable: true, rows }], this.toBlocks('For defined risk: the ' + v.best.name.replace('Call spread · ', '') + ' call spread. ' + v.best.line + ' — about a ' + v.best.popTxt + '. The risk is Oct 29 earnings: at 27× forward earnings, a guidance miss would hurt [4].'));
        return { isAi: true, blocks, hasSrc: true, src: m.src.map(([n, t]) => ({ n, t })), hasFollow: i === (s.msgs || [0, 0]).length - 1, follow: ['How do I protect my CVNA shares?', 'Compare VST with CEG', 'What would break the VST setup?'].map(t => ({ t, onClick: () => this.ask(t) })) };
      }
      const blocks = this.toBlocks(m.text), used = {};
      blocks.forEach(b => b.segs.forEach(sg => { if (sg.cite) used[sg.t] = 1; }));
      const src = Object.keys(used).sort((a, b) => a - b).map(n => ({ n, t: (this._src || [])[n - 1] || 'Tape data' }));
      return { isAi: true, blocks, hasSrc: src.length > 0, src, hasFollow: false, follow: [] };
    });
    const ctx = s.screen === 'ticker' ? 'Looking at ' + s.sym + ' · cites filings, flow and news' : 'Cites filings, flow and news · knows your portfolio';
    return {
      is, nav, watch, tapeItems: tape.concat(tape), aiOpen: s.aiOpen,
      pauseTape: () => { this.tapePaused = true; }, resumeTape: () => { this.tapePaused = false; },
      cmd: s.cmd, cmdRef: this.cmdRef, tapeRef: this.tapeRef, mainRef: this.mainRef, aiRef: this.aiRef,
      onCmd: (e) => this.setState({ cmd: e.target.value }), onCmdKey: (e) => this.onCmdKey(e),
      openAi: () => { this.setState({ aiOpen: true }); this.scrollAi(); }, closeAi: () => this.setState({ aiOpen: false }),
      ai: { msgs, ctx, busy: s.aiBusy, dots: ['●○○', '●●○', '●●●', '○●●'][s.tick % 4], input: s.aiIn, onInput: (e) => this.setState({ aiIn: e.target.value }), onKey: (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.ask(this.state.aiIn); } }, send: () => this.ask(this.state.aiIn) },
      goHome: () => this.go('home'), goOpps: () => this.go('opps'), goSmart: () => this.go('smart'), goNews: () => this.go('news'), goPortfolio: () => this.go('portfolio'), goAlerts: () => this.go('alerts'),
      togglePlay: () => this.togglePlay()
    };
  }

  homeVals() {
    const s = this.state, D = this.D, P = this.pf(), ops = this.setups();
    const ser = P.ser, mn = Math.min.apply(null, ser), mx = Math.max.apply(null, ser), rg = mx - mn || 1;
    const pfLine = ser.map((v, i) => (i ? 'L' : 'M') + (i / (ser.length - 1) * 300).toFixed(1) + ',' + (64 - (v - mn) / rg * 56).toFixed(1)).join('');
    const cv = P.rows.find(r => r.sym === 'CVNA') || {val:0};
    const mm = t => Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
    const odds = [['Fed cuts rates in December', 71, '+9 wk'], ['September CPI prints ≥ 0.3% m/m', 38, '−4'], ['Government shutdown before Nov 21', 18, '+3'], ['US recession declared in 2027', 24, '−2']].map(([q, p, d]) => ({ q, p, d, w: p + '%', dc: d.charAt(0) === '+' ? '#1FD18A' : '#FF7A7A' }));
    return { h: {
      idx: [['S&P 500', '7,152.30', 0.41], ['Nasdaq 100', '25,418.6', 0.72], ['VIX', '16.80', -4.1], ['10-yr yield', '4.02%', -1, '−6 bp']].map(([n, v, c, lab]) => ({ n, v, ch: lab || this.pct(c, 2), c: this.upc(c) })),
      pv: this.money(P.total), pw: (P.wk >= 0 ? '+' : '−') + this.money(Math.abs(P.wk)) + ' (' + this.pct(P.wkPct) + ')', pwC: this.upc(P.wk), alpha: (P.wkPct - 1.1).toFixed(1) + ' pts',
      pfLine, pfArea: pfLine + 'L300,70L0,70Z',
      movers: P.rows.slice().sort((a, b) => Math.abs(b.dayPct) - Math.abs(a.dayPct)).slice(0, 4).map(r => ({ sym: r.sym, chg: this.pct(r.dayPct), c: this.upc(r.dayPct), onClick: () => this.openSym(r.sym) })),
      playLabel: s.playing ? '❚❚ ' + mm(s.playT) + ' / 4:12' : '▶ Listen · 4 min',
      watch: [
        { k: 'CVNA scores 86 — bearish', n: 'You hold ' + this.money(cv.val) + '. Executives sold $27M outside pre-planned programs ahead of Oct 28 earnings.', a: 'See how to hedge it', on: () => this.openSym('CVNA'), c: '#FF5D5D' },
        { k: 'NVDA is ' + P.nvdaLook.toFixed(1) + '% of your money', n: 'Directly, plus through QQQ and SMH. One stock is driving a fifth of your portfolio.', a: 'Open the X-ray', on: () => this.go('portfolio'), c: '#F5B544' },
        { k: '4 holdings report in the next 3 weeks', n: 'JPM Tue · LMT Oct 20 · CVNA Oct 28 · VST Oct 29. Options price moves of ±3% to ±13%.', a: 'See the calendar', on: () => this.go('news'), c: '#7D8796' }
      ],
      top: ops.slice(0, 6).map(o => this.opCard(o)),
      news: D.STORIES.slice(0, 4).map(st => this.storyVals(st)),
      feed: D.TAPE.slice(0, 7).map(([code, sym, text, st, src]) => { const t = D.TK[sym], c = this.chip(code, st === 'neutral' ? 'x' : st); return { code, sym, text, src, cb: c.bg, cf: c.fg, chg: t ? this.pct(t.d) : '', cc: t ? this.upc(t.d) : '#A3ADBB', onClick: () => this.openSym(sym) }; }),
      odds
    } };
  }

  renderVals() {
    return Object.assign({}, this.shellVals(), this.homeVals(), this.oppsVals(), this.tickVals(), this.smVals(), this.newsVals(), this.pfVals(), this.alVals() /*@vals*/);
  }
  oppsVals() {
    const s = this.state, ops = this.setups();
    const dir = s.opDir || 'all', play = s.opPlay || 'best', hz = s.opHz || 'all', min = s.opMin || 0, pre = s.opPre || '', parsed = s.opParsed || [];
    const on = { bg: '#1B222D', fg: '#E8ECF1', sh: 'inset 0 0 0 1px #2A3340' }, off = { bg: 'transparent', fg: '#A3ADBB', sh: 'none' };
    const seg = (list, cur, key) => list.map(([k, l]) => Object.assign({ l, onClick: () => this.setState({ [key]: k }) }, cur === k ? on : off));
    const rec = o => { const cnt = c => o.cf.sg.filter(x => x.code === c && x.st === 'bull').length, fr = o.cf.rows.find(r => r.k === 'O'); return { sym: o.sym, sector: o.t.sec, dir: o.dir, score: o.score, hz: o.hz, ivr: o.t.ivr, insiders: cnt('I'), congress: cnt('C'), funds: cnt('F'), flow: fr ? fr.st : 'none', catalystDays: o.days, cat: o.cat, mcap: o.t.mc, pe: o.t.pe, wk: o.t.wk, hasOptions: o.plays.some(p => p.kind === 'options') }; };
    const PRE = { top: r => r.score >= 80, smart: r => r.insiders > 0 && r.congress > 0, cheap: r => r.ivr != null && r.ivr < 30 && r.hasOptions, earn: r => r.cat === 'Earnings' && r.catalystDays <= 21, bear: r => r.dir === 'bear', vol: r => r.dir === 'vol' };
    const test = (r, f) => { const v = r[f.field], x = f.value; if (v == null) return false; switch (f.op) { case '>=': return v >= x; case '<=': return v <= x; case '>': return v > x; case '<': return v < x; default: return typeof v === 'string' ? v.toLowerCase().indexOf(String(x).toLowerCase()) >= 0 || String(x).toLowerCase().indexOf(v.toLowerCase()) >= 0 : v == x; } };
    const list = ops.filter(o => { const r = rec(o); return (dir === 'all' || o.dir === dir) && (hz === 'all' || o.hz === hz) && o.score >= min && (!pre || PRE[pre](r)) && parsed.every(f => test(r, f)); });
    const rows = list.map(o => {
      const ds = this.dirS(o.dir);
      let p = o.best;
      if (play === 'shares') p = o.plays.find(x => x.t === 'shares') || { name: 'No share setup', line: 'This one is an options-only setup.', popTxt: '' };
      if (play === 'options') p = o.plays.find(x => x.kind === 'options') || { name: 'No options setup', line: 'Shares only for this one.', popTxt: '' };
      const pt = p.popTxt || '', isPct = pt.indexOf('chance') > 0, isRR = pt.indexOf('reward') > 0;
      return { sym: o.sym, name: o.t.n, px: '$' + o.t.px.toFixed(2), chg: this.pct(o.t.d, 2), chgC: this.upc(o.t.d), score: String(o.score), ringC: ds.c, ringP: o.score + '%', dirLab: ds.lab, dirBg: ds.bg, dirFg: ds.fg, hz: o.hz, thesis: o.thesis, chips: o.chips, playName: p.name, playLine: p.line, popBig: isPct ? pt.split('%')[0] + '%' : isRR ? pt.split(' reward')[0] : '—', popSub: isPct ? 'chance of profit' : isRR ? 'reward : risk' : '', cat: o.cat, catD: o.catD + ' · in ' + o.days + ' days', onClick: () => this.openSym(o.sym) };
    });
    const presets = [['top', 'Highest conviction'], ['smart', 'Insiders + Congress buying'], ['cheap', 'Cheap options'], ['earn', 'Earnings plays'], ['bear', 'Bearish & hedges'], ['vol', 'Volatility plays']].map(([k, l]) => ({ l, bg: pre === k ? 'rgba(31,209,138,.14)' : '#10151C', fg: pre === k ? '#3FE0A0' : '#C3CBD6', bc: pre === k ? 'rgba(31,209,138,.5)' : '#1E2631', onClick: () => this.setState({ opPre: pre === k ? '' : k }) }));
    const bulls = list.filter(o => o.dir === 'bull').length, bears = list.filter(o => o.dir === 'bear').length;
    return { op: {
      q: s.opQ || '', onQ: e => this.setState({ opQ: e.target.value }), onQKey: e => { if (e.key === 'Enter') this.runScreen(); }, run: () => this.runScreen(), runLabel: s.opBusy ? 'Reading…' : 'Find setups',
      presets, hasParsed: parsed.length > 0, parsed: parsed.map((f, i) => ({ l: f.label || (f.field + ' ' + f.op + ' ' + f.value), onClick: () => this.setState({ opParsed: parsed.filter((_, j) => j !== i) }) })), clearParsed: () => this.setState({ opParsed: [], opQ: '' }),
      dirs: seg([['all', 'All'], ['bull', 'Bullish'], ['bear', 'Bearish'], ['vol', 'Volatility']], dir, 'opDir'),
      plays: seg([['best', 'Best play'], ['shares', 'Shares'], ['options', 'Options']], play, 'opPlay'),
      hzs: seg([['all', 'Any horizon'], ['Days', 'Days'], ['Weeks', 'Weeks'], ['Months', 'Months']], hz, 'opHz'),
      mins: seg([[0, 'Any score'], [60, '60+'], [75, '75+'], [85, '85+']], min, 'opMin'),
      rows, empty: rows.length === 0, count: rows.length + ' setups · ' + bulls + ' bullish · ' + bears + ' bearish'
    } };
  }
  async runScreen() {
    const q = (this.state.opQ || '').trim(); if (!q || this.state.opBusy) return;
    this.setState({ opBusy: true });
    let filters = null;
    try {
      const sys = 'Convert an investor’s plain-English screen into JSON filters. Fields: sector (Utilities | Aerospace & Defense | Semiconductors | Networking | Software | Banks | Autos | Consumer Discretionary), dir ("bull" | "bear" | "vol" | "mixed"), score (0-100 conviction), hz ("Days" | "Weeks" | "Months"), ivr (IV rank 0-100; cheap options means ivr < 30), insiders (count of insider open-market buys), congress (count of Congress buys), funds (count of fund adds), flow ("bull" | "bear" | "neutral"), catalystDays (days until the catalyst), cat ("Earnings" | "Budget markup" | "Options expiration"), mcap (market cap, $B), pe (forward P/E), wk (1-week % change). Ops: "=", ">=", "<=", ">", "<". Reply with ONLY JSON like {"filters":[{"field":"sector","op":"=","value":"Utilities","label":"Sector: Utilities"}]} using short human labels.';
      const out = await this.complete({ system: sys, max_tokens: 400, messages: [{ role: 'user', content: q }] });
      const mt = String(out).match(/\{[\s\S]*\}/); filters = mt ? JSON.parse(mt[0]).filters : null;
    } catch (e) { filters = null; }
    if (!Array.isArray(filters) || !filters.length) filters = this.kwParse(q);
    this.setState({ opParsed: filters, opBusy: false, opPre: '', opDir: 'all', opHz: 'all', opMin: 0 });
  }
  kwParse(q) {
    const f = [], l = q.toLowerCase();
    if (/defen[cs]e|military|aerospace/.test(l)) f.push({ field: 'sector', op: '=', value: 'Aerospace & Defense', label: 'Sector: Defense' });
    if (/power|utilit|grid|nuclear/.test(l)) f.push({ field: 'sector', op: '=', value: 'Utilities', label: 'Sector: Power & utilities' });
    if (/chip|semi/.test(l)) f.push({ field: 'sector', op: '=', value: 'Semiconductors', label: 'Sector: Semis' });
    if (/cheap|low iv/.test(l)) f.push({ field: 'ivr', op: '<', value: 30, label: 'Cheap options (IV rank < 30)' });
    if (/bear|short|hedge|downside/.test(l)) f.push({ field: 'dir', op: '=', value: 'bear', label: 'Bearish' }); else if (/bull|upside|long/.test(l)) f.push({ field: 'dir', op: '=', value: 'bull', label: 'Bullish' });
    if (/insider/.test(l)) f.push({ field: 'insiders', op: '>=', value: 1, label: 'Insiders buying' });
    if (/congress|senator|politic|lawmaker/.test(l)) f.push({ field: 'congress', op: '>=', value: 1, label: 'Congress buying' });
    if (/earning/.test(l)) f.push({ field: 'cat', op: '=', value: 'Earnings', label: 'Earnings catalyst' });
    return f.length ? f : [{ field: 'score', op: '>=', value: 60, label: 'Score 60+' }];
  }

  tickVals() {
    const s = this.state, D = this.D, sym = D.TK[s.sym] ? s.sym : 'VST', t = D.TK[sym];
    const S = this.series(sym), N = S.length, L = N - 1;
    const n = ({ '1M': 21, '3M': 63, '6M': 126, '1Y': 252 })[s.tf] || 126, st = N - n, vis = S.slice(st);
    const ov = s.ov || { s50: true, s200: false, vol: true };
    const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
    const smaOf = k => { const key = sym + ':sma' + k; if (this._s[key]) return this._s[key]; const a = new Array(N).fill(null); let sum = 0; for (let i = 0; i < N; i++) { sum += S[i]; if (i >= k) sum -= S[i - k]; if (i >= k - 1) a[i] = sum / k; } return (this._s[key] = a); };
    const s50 = smaOf(50), s200 = smaOf(200);
    let mn = Math.min.apply(null, vis), mx = Math.max.apply(null, vis);
    [[ov.s50, s50], [ov.s200, s200]].forEach(([o, a]) => { if (o) for (let i = st; i < N; i++) if (a[i] != null) { mn = Math.min(mn, a[i]); mx = Math.max(mx, a[i]); } });
    const pad = (mx - mn) * 0.06; mn -= pad; mx += pad;
    const X = i => i / (n - 1) * 1000, Y = v => 250 - (v - mn) / (mx - mn) * 238;
    const pth = a => { let d = '', pen = false; for (let i = 0; i < n; i++) { const v = a[st + i]; if (v == null) { pen = false; continue; } d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1); pen = true; } return d; };
    const line = pth(S), sg = this.signals(sym), sigDays = {}; sg.forEach(x => { sigDays[L - x.ago] = 1; });
    if (!this._s[sym + ':vol']) { const vr = this.rng(this.hash(sym + 'v')), a = []; for (let i = 0; i < N; i++) a.push(0.3 + vr() * 0.5 + (sigDays[i] ? 0.55 : 0)); this._s[sym + ':vol'] = a; }
    const VA = this._s[sym + ':vol'], vmax = Math.max.apply(null, VA.slice(st));
    let vol = ''; for (let i = 0; i < n; i++) vol += 'M' + X(i).toFixed(1) + ',300V' + (300 - VA[st + i] / vmax * 44).toFixed(1);
    const raw = (mx - mn) / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(v => v >= raw);
    const yl = []; for (let v = Math.ceil(mn / step) * step; v <= mx; v += step) { const y = Y(v); if (y > 10 && y < 248) yl.push({ v: step < 1 ? v.toFixed(2) : Math.round(v).toLocaleString('en-US'), top: (y / 300 * 100).toFixed(2) + '%', y: y.toFixed(1) }); }
    const xl = [0, 1, 2, 3, 4].map(k => { const i = Math.round(k * (n - 1) / 4), d = D.days[st + i]; return { v: n > 70 ? D.M[d.getMonth()] + ' ’' + String(d.getFullYear()).slice(2) : D.M[d.getMonth()] + ' ' + d.getDate(), left: (i / (n - 1) * 100).toFixed(2) + '%', tx: k === 0 ? 'none' : k === 4 ? 'translateX(-100%)' : 'translateX(-50%)' }; });
    const inWin = sg.filter(x => L - x.ago >= st), pos = ago => (L - ago - st) / (n - 1) * 100;
    const first = inWin.find(x => x.code !== 'E' && x.code !== 'N') || inWin[0], focusId = s.hov || s.sel || (first && first.id);
    const lanes = [['C', 'Congress'], ['I', 'Insiders'], ['F', 'Funds'], ['O', 'Options flow'], ['N', 'News'], ['E', 'Earnings']].map(([code, name]) => {
      const xs = inWin.filter(x => x.code === code);
      return { code, name, count: xs.length ? String(xs.length) : '—',
        spans: code === 'C' ? xs.map(x => { const l = Math.max(0, pos(x.from)), r = pos(x.ago); return { l: l.toFixed(2) + '%', w: Math.max(0, r - l).toFixed(2) + '%', tk: L - x.from >= st }; }) : [],
        marks: xs.map(x => { const f = x.id === focusId, c = this.chip(code, x.st === 'neutral' ? 'x' : x.st); return { code, x: pos(x.ago).toFixed(2) + '%', bg: f ? '#E8ECF1' : c.bg, fg: f ? '#0A0D12' : c.fg, size: f ? '22px' : '18px', border: '1px solid ' + (f ? '#E8ECF1' : x.st === 'bull' ? 'rgba(31,209,138,.45)' : x.st === 'bear' ? 'rgba(255,93,93,.45)' : '#2A3340'), z: f ? 3 : 1, onEnter: () => this.setState({ hov: x.id }), onLeave: () => this.setState({ hov: null }), onClick: () => this.setState({ sel: x.id }) }; }) };
    });
    const dots = inWin.filter(x => (x.st === 'bull' || x.st === 'bear') && x.code !== 'N').map(x => ({ x: pos(x.ago).toFixed(2) + '%', y: (Y(S[L - x.ago]) / 300 * 100).toFixed(2) + '%', c: x.st === 'bull' ? '#1FD18A' : '#FF5D5D' }));
    const fx = sg.find(x => x.id === focusId), fc = fx ? this.chip(fx.code, fx.st === 'neutral' ? 'x' : fx.st) : null;
    const det = fx ? { code: fx.code, title: fx.title, detail: fx.detail, src: fx.src, date: fx.date, since: this.pct(fx.since), sc: this.upc(fx.since), bg: fc.bg, fg: fc.fg } : null;
    const guide = fx && L - fx.ago >= st ? 'calc(88px + (100% - 144px) * ' + (pos(fx.ago) / 100).toFixed(4) + ')' : null;
    let hover = null;
    if (s.hx != null && s.hx < n) { const i = s.hx, v = S[st + i], fl = i > n * 0.62; hover = { x: (i / (n - 1) * 100).toFixed(2) + '%', y: (Y(v) / 300 * 100).toFixed(2) + '%', date: this.fd(L - st - i), px: '$' + v.toFixed(2), chg: this.pct((v / vis[0] - 1) * 100), cc: this.upc(v - vis[0]), tx: fl ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)' }; }
    const rgp = (S[L] / vis[0] - 1) * 100, lc = rgp >= 0 ? '#1FD18A' : '#FF5D5D';
    const su = this.setups().find(o => o.sym === sym);
    let setup = null;
    if (su) {
      const ds = this.dirS(su.dir), pi = Math.min(((s.play || {})[sym]) || 0, su.plays.length - 1), pl = su.plays[pi], tr = !!(s.tracked || {})[sym];
      let pay = null;
      if (pl.f) {
        const lo = t.px * 0.78, hi = t.px * 1.22, K = 90, xs = [], ys = [];
        for (let i = 0; i <= K; i++) { const x = lo + (hi - lo) * i / K; xs.push(x); ys.push(pl.f(x)); }
        const ymax = Math.max.apply(null, ys), ymin = Math.min.apply(null, ys);
        let a = Math.min(ymin, 0), b = Math.max(ymax, 0); const pd = (b - a) * 0.14 || 1; a -= pd; b += pd;
        const PX = x => (x - lo) / (hi - lo) * 1000, PY = y => 150 - (y - a) / (b - a) * 150;
        const ln = xs.map((x, i) => (i ? 'L' : 'M') + PX(x).toFixed(1) + ',' + PY(ys[i]).toFixed(1)).join(''), zy = PY(0);
        pay = { line: ln, area: ln + 'L1000,' + zy.toFixed(1) + 'L0,' + zy.toFixed(1) + 'Z', zy: zy.toFixed(1), spotX: (PX(t.px) / 10).toFixed(2) + '%', spotL: 'Now $' + t.px.toFixed(0), bes: pl.bes.filter(v => v > lo && v < hi).map(v => ({ x: (PX(v) / 10).toFixed(2) + '%', l: 'BE $' + v.toFixed(2) })), top: (ymax >= 0 ? '+' : '') + this.money(ymax), bot: this.money(ymin), lo: '$' + Math.round(lo), hi: '$' + Math.round(hi) };
      }
      setup = { dirLab: ds.lab, dirBg: ds.bg, dirFg: ds.fg, ringC: ds.c, ringP: su.score + '%', score: String(su.score), hz: su.hz + ' horizon', thesis: su.thesis, cat: 'Catalyst: ' + su.catTxt, hasLv: su.target != null,
        lv: su.target != null ? [['Entry', this.m2(t.px), '#E8ECF1'], ['Target', this.m2(su.target) + ' · ' + this.pct((su.target / t.px - 1) * 100), su.dir === 'bear' ? '#FF7A7A' : '#3FE0A0'], ['Stop', this.m2(su.stop) + ' · ' + this.pct((su.stop / t.px - 1) * 100), '#F5B544']].map(([k, v, c]) => ({ k, v, c })) : [],
        tabs: su.plays.map((p, i) => ({ l: p.tab, bg: i === pi ? '#1FD18A' : 'transparent', fg: i === pi ? '#03140C' : '#C3CBD6', bc: i === pi ? '#1FD18A' : '#2A3340', onClick: () => this.setState({ play: Object.assign({}, s.play, { [sym]: i }) }) })),
        play: { name: pl.name, legs: pl.legs, facts: (pl.facts || []).map(([k, v]) => ({ k, v })), hasFacts: (pl.facts || []).length > 0, pop: pl.popTxt }, pay, hasPay: !!pay, risks: su.risks,
        trackLabel: tr ? '✓ Tracking this setup' : 'Track this setup', trackBg: tr ? '#1B222D' : '#1FD18A', trackFg: tr ? '#3FE0A0' : '#03140C', onTrack: () => this.setState({ tracked: Object.assign({}, s.tracked, { [sym]: !tr }) })
      };
    }
    const cf = this.conf(sym), W = { I: 3, O: 3, C: 2, F: 2, N: 1, T: 1 }, lab = { bull: 'BULLISH', bear: 'BEARISH', neutral: 'NEUTRAL' };
    const ev = cf.rows.map(r => { const top = cf.sg.find(x => x.code === r.k), c = this.chip(r.k, r.st === 'neutral' ? 'x' : r.st); return { k: r.k, name: r.name, lab: lab[r.st], bg: c.bg, fg: c.fg, txt: top ? top.title : r.note, sub: top ? top.date + ' · ' + top.src + ' · ' + this.pct(top.since) + ' since public' + (r.n > 1 ? ' · +' + (r.n - 1) + ' more' : '') : 'Price versus its moving averages', bars: [1, 2, 3].map(i => ({ bg: i <= W[r.k] ? c.fg : '#1E2631' })) }; });
    const has = t.mc != null;
    const stats = (has ? [['Market cap', t.mc >= 1000 ? '$' + (t.mc / 1000).toFixed(2) + 'T' : '$' + t.mc.toFixed(1) + 'B'], ['Forward P/E', t.pe.toFixed(1) + '×'], ['Revenue growth', '+' + t.rg + '%'], ['Short interest', t.si.toFixed(1) + '%'], ['IV rank', String(t.ivr)], ['Next earnings', t.er + ' · ±' + t.em + '%']] : [['Type', 'ETF'], ['1-year change', this.pct((S[L] / S[L - 251] - 1) * 100)]]).map(([k, v]) => ({ k, v }));
    const watched = s.watched || { VST: 1, LMT: 1, CEG: 1, NVDA: 1, CVNA: 1, ANET: 1 };
    return { t: {
      sym, name: t.n, ex: t.ex, sec: t.sec, px: '$' + t.px.toFixed(2), dTxt: this.pct(t.d, 2) + ' today · ' + this.pct(t.wk) + ' this week', dColor: this.upc(t.d),
      tfs: ['1M', '3M', '6M', '1Y'].map(k => ({ k, bg: (s.tf || '6M') === k ? '#1B222D' : 'transparent', fg: (s.tf || '6M') === k ? '#E8ECF1' : '#7D8796', onClick: () => this.setState({ tf: k, hx: null }) })),
      ovs: [['s50', '50-day', '#F5B544', 'dashed'], ['s200', '200-day', '#7D8796', 'solid'], ['vol', 'Volume', '#3A4553', 'solid']].map(([k, l, sw, dash]) => ({ l, sw, dash, bc: ov[k] ? '#3A4553' : '#1E2631', fg: ov[k] ? '#E8ECF1' : '#7D8796', onClick: () => this.setState({ ov: Object.assign({}, ov, { [k]: !ov[k] }) }) })),
      rangeTxt: this.pct(rgp) + ' over ' + (s.tf || '6M'), rangeColor: lc, lc,
      line, area: line + 'L1000,300L0,300Z', s50: pth(s50), s200: pth(s200), vol, volW: Math.max(1, Math.min(9, 520 / n)).toFixed(1) + 'px', showS50: ov.s50, showS200: ov.s200, showVol: ov.vol,
      yl, xl, lanes, dots, det, guide, hover,
      onMove: (e) => { const r = e.currentTarget.getBoundingClientRect(), i = Math.round((e.clientX - r.left) / r.width * (n - 1)); this.setState({ hx: Math.max(0, Math.min(n - 1, i)) }); },
      onLeave: () => this.setState({ hx: null }),
      setup, noSetup: !su, ev, evTitle: su ? 'Why Tape scores it ' + su.score : 'What Tape sees', stats,
      watchLabel: watched[sym] ? '✓ On watchlist' : '+ Watchlist',
      toggleWatch: () => this.setState({ watched: Object.assign({}, watched, { [sym]: watched[sym] ? 0 : 1 }) }),
      askAbout: () => this.ask('What is driving ' + sym + ' right now, how would you play it, and what could go wrong?')
    } };
  }
  smVals() {
    const s = this.state, D = this.D, tab = s.smTab || 'congress', ch = s.smCh || 'all', side = s.smSide || 'all', rel = !!s.smRel, fol = s.follow || {}, ff = s.ff || {};
    const on = { bg: '#1B222D', fg: '#E8ECF1', sh: 'inset 0 0 0 1px #2A3340' }, off = { bg: 'transparent', fg: '#A3ADBB', sh: 'none' };
    const seg = (list, cur, key) => list.map(([k, l]) => Object.assign({ l, onClick: () => this.setState({ [key]: k }) }, cur === k ? on : off));
    const sideSt = b => b ? { bg: 'rgba(31,209,138,.14)', fg: '#3FE0A0' } : { bg: 'rgba(255,93,93,.14)', fg: '#FF7A7A' };
    const sus = {}; this.setups().forEach(o => { sus[o.sym] = o; });
    const sup = sym => { const o = sus[sym]; return o ? { hasSu: true, suScore: String(o.score), suC: this.dirS(o.dir).c, onSu: () => this.openSym(sym) } : { hasSu: false }; };
    const flw = who => ({ fl: fol[who] ? 'Following' : 'Follow', flBg: fol[who] ? 'rgba(31,209,138,.14)' : 'transparent', flFg: fol[who] ? '#3FE0A0' : '#E8ECF1', flBc: fol[who] ? 'rgba(31,209,138,.5)' : '#2A3340', onFollow: () => this.setState({ follow: Object.assign({}, fol, { [who]: !fol[who] }) }) });
    const cong = D.CONG.filter(r => (ch === 'all' || r.ch === ch) && (side === 'all' || side === r.side) && (!rel || r.rel)).sort((a, b) => a.f - b.f).map(r => {
      const sn = this.since(r.sym, r.f), lg = this.lag(r), ss = sideSt(r.side === 'Buy');
      return Object.assign({ who: r.who, tag: r.p + '-' + r.st + ' · ' + r.ch, com: r.com, rel: r.rel, sym: r.sym, side: r.side.toUpperCase(), sideBg: ss.bg, sideFg: ss.fg, amt: r.amt, dates: this.fd(r.t) + ' → ' + this.fd(r.f), lag: lg + ' days to disclose', lagC: lg > 40 ? '#FF7A7A' : '#7D8796', since: this.pct(sn), sc: this.upc(sn), onSym: () => this.openSym(r.sym) }, flw(r.who), sup(r.sym));
    });
    const lead = [['Sen. Dana Whitcomb', 'R-TX', 31, 68, 6.2], ['Rep. Lisa Brandt', 'D-MI', 18, 61, 4.9], ['Rep. Joan Pruett', 'R-OH', 24, 58, 3.7], ['Sen. Priya Natarajan', 'D-WA', 12, 58, 2.8], ['Rep. Teresa Okafor', 'D-NY', 44, 52, 1.1]]
      .map(([who, tag, n, hit, ex], i) => Object.assign({ rank: String(i + 1), who, tag, n: n + ' trades', hit: hit + '% beat the index', ex: this.pct(ex), w: (ex / 6.2 * 100).toFixed(0) + '%' }, flw(who)));
    const ins = D.INS.filter(r => s.insPlans || !r.plan).sort((a, b) => a.ago - b.ago).map(r => {
      const sn = this.since(r.sym, r.ago), ss = sideSt(r.side === 'Buy'), cluster = !r.plan && D.INS.filter(x => x.sym === r.sym && !x.plan && x.side === r.side && Math.abs(x.ago - r.ago) <= 5).length >= 2;
      return Object.assign({ sym: r.sym, name: D.TK[r.sym].n, who: r.who, role: r.role, side: r.side.toUpperCase(), sideBg: ss.bg, sideFg: ss.fg, cluster, plan: r.plan, op: r.plan ? 0.55 : 1, sh: r.sh.toLocaleString('en-US'), val: this.usd(r.sh * r.px / 1e6), date: this.fd(r.ago), since: this.pct(sn), sc: this.upc(sn), onSym: () => this.openSym(r.sym) }, sup(r.sym));
    });
    const funds = D.FUND.map(r => { const sn = this.since(r.sym, r.ago), ss = sideSt(r.act === 'New' || r.act === 'Added'); return Object.assign({ fund: r.fund, act: r.act.toUpperCase(), actBg: ss.bg, actFg: ss.fg, sym: r.sym, val: this.usd(r.val), pct: r.pct ? r.pct.toFixed(1) + '%' : '—', chg: r.chg, since: this.pct(sn), sc: this.upc(sn), onSym: () => this.openSym(r.sym) }, sup(r.sym)); });
    const cons = [['Into power & grid', '4 funds buying', '#1FD18A', 'VST, CEG and NRG: two new positions, two adds, no sellers among top-quartile funds.'], ['Into defense', '2 funds buying', '#1FD18A', 'LMT and GD added ahead of the FY27 budget cycle.'], ['Out of megacap chips', '2 funds selling', '#FF5D5D', 'A full exit from NVDA and a 35% trim of AMD.']].map(([k, v, c, n]) => ({ k, v, c, n }));
    const filters = [['sweep', 'Sweeps'], ['ask', 'Bought at the ask'], ['open', 'Opening only'], ['big', '≥ $1M'], ['calls', 'Calls'], ['puts', 'Puts'], ['short', '≤ 30 days']].map(([k, l]) => ({ l, bg: ff[k] ? 'rgba(31,209,138,.14)' : '#10151C', fg: ff[k] ? '#3FE0A0' : '#C3CBD6', bc: ff[k] ? 'rgba(31,209,138,.5)' : '#1E2631', onClick: () => this.setState({ ff: Object.assign({}, ff, { [k]: !ff[k] }) }) }));
    let fr = D.FLOW.filter(r => r.ago === 0);
    if (ff.sweep) fr = fr.filter(r => r.type === 'Sweep'); if (ff.ask) fr = fr.filter(r => r.side === 'Ask'); if (ff.open) fr = fr.filter(r => r.vol > r.oi); if (ff.big) fr = fr.filter(r => r.prem >= 1);
    if (ff.calls && !ff.puts) fr = fr.filter(r => r.cp === 'C'); if (ff.puts && !ff.calls) fr = fr.filter(r => r.cp === 'P'); if (ff.short) fr = fr.filter(r => r.dte <= 30);
    const sel = fr.find(r => r.id === (s.fsel || 'o1')) || fr[0], scol = { bull: '#1FD18A', bear: '#FF5D5D', neutral: '#7D8796' };
    const rows = fr.map(r => ({ tm: r.tm, sym: r.sym, contract: r.exp + ' $' + r.k + ' ' + (r.cp === 'C' ? 'Call' : 'Put'), side: r.side, sideC: r.side === 'Ask' ? '#E8ECF1' : '#7D8796', type: r.type, prem: '$' + r.prem.toFixed(2) + 'M', voi: (r.vol / r.oi).toFixed(1) + '×', voiC: r.vol > r.oi ? '#E8ECF1' : '#7D8796', voiW: r.vol > r.oi ? 700 : 500, read: r.read, sc: scol[r.s], bg: sel && r.id === sel.id ? '#151E1B' : 'transparent', onClick: () => this.setState({ fsel: r.id }) }));
    const w = this.walk('tide-fri', 79, 1).map((v, i) => v - 0.9 * Math.sin(i / 9)), wm = Math.max.apply(null, w.map(Math.abs)) || 1, TY = v => 50 - v / wm * 44;
    const tl = w.map((v, i) => (i ? 'L' : 'M') + (i / 78 * 1000).toFixed(1) + ',' + TY(v).toFixed(1)).join('');
    let d = null;
    if (sel) {
      const t = D.TK[sel.sym], perSh = sel.prem * 1e6 / sel.ct / 100, be = sel.cp === 'C' ? sel.k + perSh : sel.k - perSh, toBe = (be / t.px - 1) * 100;
      const opening = sel.vol > sel.oi, what = sel.ct.toLocaleString('en-US') + ' ' + sel.sym + ' ' + sel.exp + ' $' + sel.k + (sel.cp === 'C' ? ' calls' : ' puts');
      let text = sel.side === 'Bid' ? 'Someone sold ' + what + ' for $' + sel.prem.toFixed(2) + 'M, hitting the bid — usually closing a position or collecting premium, not a fresh bet. '
        : sel.side === 'Mid' ? 'Someone traded ' + what + ' for $' + sel.prem.toFixed(2) + 'M at the midpoint — typical of one leg of a spread or straddle, so direction is unclear. '
        : 'Someone paid $' + sel.prem.toFixed(2) + 'M for ' + what + (sel.type === 'Sweep' ? ', sweeping several exchanges at the ask — a sign of urgency. ' : sel.type === 'Block' ? ' in one negotiated block. ' : ', split across several fills at the ask. ');
      text += opening ? 'Volume is ' + (sel.vol / sel.oi).toFixed(1) + '× open interest, so this is most likely a new position.' : 'Volume is below open interest, so part of this may be closing existing positions.';
      const erD = this.daysTo(t.er), sold = sel.side === 'Bid', stc = this.chip('', sel.s === 'neutral' ? 'x' : sel.s), o = sus[sel.sym];
      d = { sym: sel.sym, contract: sel.exp + ' · $' + sel.k + ' ' + (sel.cp === 'C' ? 'Call' : 'Put') + ' · ' + sel.type, text, crosses: erD != null && erD > 0 && erD <= sel.dte, er: t.er,
        stLab: { bull: 'BULLISH', bear: 'BEARISH', neutral: 'NEUTRAL' }[sel.s], stBg: stc.bg, stFg: stc.fg,
        facts: [['Breakeven', '$' + be.toFixed(2), this.pct(toBe) + ' from spot'], ['Time to expiry', sel.dte + ' days', sel.exp], ['Per contract', '$' + Math.round(perSh * 100).toLocaleString('en-US'), sel.ct.toLocaleString('en-US') + ' contracts'], [sold ? 'Premium collected' : 'Max the buyer can lose', '$' + sel.prem.toFixed(2) + 'M', sold ? 'Kept if it expires worthless' : 'The premium paid']].map(([k, v, n]) => ({ k, v, n })),
        su: o ? { score: String(o.score), c: this.dirS(o.dir).c, name: o.best.name, line: o.best.line, on: () => this.openSym(sel.sym) } : null };
    }
    const READ = {
      congress: 'Armed Services members disclosed four defense buys in 30 days — LMT twice, plus RTX and GD — about three times their usual pace, right before Wednesday’s budget markup. That overlap is why LMT is Tape’s #2 setup.',
      insiders: 'Cluster buying — two or more insiders buying in the same week — has historically been the strongest insider signal. This week it happened at Vistra and NRG. Carvana’s $27M of sales were not part of pre-planned programs.',
      funds: 'Q2 filings show top-quartile funds rotating out of megacap chips and into power and grid names — the same rotation the price action and Congress buying point to.',
      flow: 'Call buyers outspent put buyers $6.2B to $4.0B on Friday. The most urgent bets: VST November calls swept at the ask, and CVNA November puts right after insider selling.'
    };
    return { sm: {
      tabs: [['congress', 'Congress', D.CONG.length], ['insiders', 'Insiders', D.INS.filter(r => !r.plan).length], ['funds', 'Funds', D.FUND.length], ['flow', 'Options flow', 16]].map(([k, l, n]) => Object.assign({ l, n: String(n), onClick: () => this.setState({ smTab: k }) }, tab === k ? on : off)),
      isCong: tab === 'congress', isIns: tab === 'insiders', isFund: tab === 'funds', isFlow: tab === 'flow', read: READ[tab],
      chs: seg([['all', 'All'], ['Senate', 'Senate'], ['House', 'House']], ch, 'smCh'), sides: seg([['all', 'All'], ['Buy', 'Buys'], ['Sell', 'Sells']], side, 'smSide'),
      relBox: rel ? '#1FD18A' : 'transparent', relBc: rel ? '#1FD18A' : '#7D8796', relCheck: rel ? '✓' : '', toggleRel: () => this.setState({ smRel: !rel }),
      planBox: s.insPlans ? '#1FD18A' : 'transparent', planBc: s.insPlans ? '#1FD18A' : '#7D8796', planCheck: s.insPlans ? '✓' : '', togglePlans: () => this.setState({ insPlans: !s.insPlans }),
      cong, congCount: cong.length + ' disclosures · last 90 days', lead, ins, insCount: ins.length + ' filings · last 60 days', funds, cons
    }, fl: {
      filters, rows, empty: rows.length === 0, d, count: rows.length + ' of 16 prints worth reading',
      stats: [['Call premium', '$6.21B', '+18% vs. 20-day avg'], ['Put premium', '$4.03B', '−6% vs. 20-day avg'], ['Put/call, by premium', '0.65', 'Lowest since Aug 22']].map(([k, v, n]) => ({ k, v, n })),
      tideLine: tl, tideArea: tl + 'L1000,' + TY(0).toFixed(1) + 'L0,' + TY(0).toFixed(1) + 'Z', tideZero: TY(0).toFixed(1), tideEnd: '+$2.18B net calls'
    } };
  }

  newsVals() {
    const s = this.state, D = this.D, scope = s.nwScope || 'you', imp = s.nwImp || 'all';
    const on = { bg: '#1B222D', fg: '#E8ECF1', sh: 'inset 0 0 0 1px #2A3340' }, off = { bg: 'transparent', fg: '#A3ADBB', sh: 'none' };
    const seg = (list, cur, key) => list.map(([k, l]) => Object.assign({ l, onClick: () => this.setState({ [key]: k }) }, cur === k ? on : off));
    const mine = {}; D.HOLD.forEach(([k]) => { mine[k] = 1; }); Object.keys(s.watched || { VST: 1, LMT: 1, CEG: 1, NVDA: 1, CVNA: 1, ANET: 1 }).forEach(k => { mine[k] = 1; });
    const list = D.STORIES.filter(st => (scope === 'all' || st.syms.some(k => mine[k])) && (imp === 'all' || st.lvl === 3)).map(st => this.storyVals(st));
    const own = 'rgba(245,181,68,.12)', setup = 'rgba(31,209,138,.12)';
    const cal = [
      ['MON', 'Oct 12', [['All day', 'Columbus Day — bond market closed, stocks open', '', '']]],
      ['TUE', 'Oct 13', [['Pre-market', 'JPMorgan, Wells Fargo, Citi and Goldman report', 'You own JPM · options price ±3.1%', 'own']]],
      ['WED', 'Oct 14', [['8:30 AM', 'September CPI', 'Odds of a hot print (≥0.3%): 38%', ''], ['10:00 AM', 'Senate Armed Services budget markup', 'LMT · GD · RTX setups', 'setup']]],
      ['THU', 'Oct 15', [['Pre-market', 'TSMC earnings — read-through for NVDA', 'You own NVDA', 'own']]],
      ['FRI', 'Oct 16', [['All day', 'Monthly options expiration', '', '']]],
      ['TUE', 'Oct 20', [['Pre-market', 'Lockheed Martin earnings', 'You own LMT · ±4.1%', 'own']]],
      ['WED', 'Oct 28', [['After close', 'Carvana earnings', 'You own CVNA · ±12.5% · bearish setup', 'own']]],
      ['THU', 'Oct 29', [['Pre-market', 'Vistra earnings', 'You own VST · ±7.2% · score 92', 'own']]]
    ].map(([dow, dom, ev]) => ({ dow, dom: dom.split(' ')[1], ev: ev.map(([t, x, tag, k]) => ({ t, x, tag, tb: k === 'own' ? own : k === 'setup' ? setup : '#1B222D', tc: k === 'own' ? '#F5B544' : k === 'setup' ? '#3FE0A0' : '#C3CBD6' })) }));
    return { nw: { scopes: seg([['you', 'For you'], ['all', 'All markets']], scope, 'nwScope'), imps: seg([['all', 'All impact'], ['high', 'High only']], imp, 'nwImp'), list, cal } };
  }
  pfVals() {
    const s = this.state, D = this.D, P = this.pf(), tot = P.total, sus = {}; this.setups().forEach(o => { sus[o.sym] = o; });
    const rows = P.rows.map(r => { const o = sus[r.sym], ds = o ? this.dirS(o.dir) : null, dd = this.daysTo(r.t.er); return { sym: r.sym, sh: String(r.sh), px: this.m2(r.px), val: this.money(r.val), w: (r.val / tot * 100).toFixed(1) + '%', wbar: Math.min(100, r.val / tot * 400).toFixed(0) + '%', day: this.pct(r.dayPct), dayC: this.upc(r.dayPct), tot: (r.tot >= 0 ? '+' : '−') + this.money(Math.abs(r.tot)), totPct: this.pct(r.totPct), totC: this.upc(r.tot), score: o ? String(o.score) : '—', scC: ds ? ds.c : '#7D8796', scLab: ds ? ds.lab : 'NO SETUP', flag: r.t.er && dd != null && dd <= 30 ? 'Earnings ' + r.t.er + ' · ±' + r.t.em + '%' : r.t.n, onClick: () => this.openSym(r.sym) }; });
    const health = P.rows.reduce((a, r) => { const o = sus[r.sym]; const h = !o ? 50 : o.dir === 'bull' ? o.score : o.dir === 'bear' ? 100 - o.score : 50; return a + h * r.val; }, 0) / tot;
    const gain = tot - P.basis;
    const kpis = [['Value', this.money(tot), 'Day ' + (P.day >= 0 ? '+' : '−') + this.money(Math.abs(P.day)), '#E8ECF1'], ['This week', (P.wk >= 0 ? '+' : '−') + this.money(Math.abs(P.wk)), this.pct(P.wkPct) + ' vs. S&P +1.1%', this.upc(P.wk)], ['Total gain', (gain >= 0 ? '+' : '−') + this.money(Math.abs(gain)), this.pct(gain / P.basis * 100) + ' on cost', this.upc(gain)], ['Portfolio score', String(Math.round(health)), Math.round(health) >= 55 ? 'Signals lean in your favor' : 'Signals lean against you', '#1FD18A'], ['Beta', '1.31', 'Moves ~1.3× the market', '#E8ECF1']].map(([k, v, n, c]) => ({ k, v, n, c }));
    const ETF = { QQQ: { NVDA: .095, MSFT: .086, AAPL: .082, AMZN: .055, AVGO: .05 }, SMH: { NVDA: .21, TSM: .12, AVGO: .08, AMD: .05 } }, ex = {};
    P.rows.forEach(r => { if (ETF[r.sym]) { let rest = 1; Object.keys(ETF[r.sym]).forEach(k => { const w = ETF[r.sym][k]; ex[k] = (ex[k] || 0) + r.val * w; rest -= w; }); ex['Rest of ' + r.sym] = (ex['Rest of ' + r.sym] || 0) + r.val * rest; } else ex[r.sym] = (ex[r.sym] || 0) + r.val; });
    const lk = Object.keys(ex).sort((a, b) => ex[b] - ex[a]).slice(0, 8), lmax = ex[lk[0]];
    const look = lk.map(k => ({ k, v: (ex[k] / tot * 100).toFixed(1) + '%', w: (ex[k] / lmax * 100).toFixed(0) + '%', c: k === 'NVDA' ? '#F5B544' : k.indexOf('Rest') === 0 ? '#2A3340' : '#3FE0A0' }));
    const nv = P.rows.find(r => r.sym === 'NVDA') || {px:D.TK.NVDA.px}, trim = Math.max(0, Math.round(((ex.NVDA || 0) - 0.15 * tot) / nv.px));
    const cv = P.rows.find(r => r.sym === 'CVNA') || {val:0,sh:0,tot:0,totPct:0}, vs = P.rows.find(r => r.sym === 'VST') || {val:0,sh:0,tot:0,totPct:0}, lm = sus.LMT, cvs = sus.CVNA;
    const ccPrem = this.bs(D.TK.VST.px, 240, 42 / 365, D.TK.VST.iv, 'C') * 100;
    const ideas = [
      { tag: 'PROTECT', c: '#FF7A7A', bg: 'rgba(255,93,93,.14)', sym: 'CVNA', k: 'Lock in your ' + this.money(cv.tot) + ' gain on Carvana', n: 'Tape scores CVNA ' + cvs.score + ' bearish into Oct 28 earnings. Selling your ' + cv.sh + ' shares locks in ' + this.pct(cv.totPct) + '. Prefer to stay in? ' + cvs.best.name + ' — ' + cvs.best.line.toLowerCase() + '.', v: 'Keep ' + this.pct(cv.totPct), vc: '#1FD18A', a: 'See CVNA setup', on: () => this.openSym('CVNA') },
      { tag: 'INCOME', c: '#3FE0A0', bg: 'rgba(31,209,138,.14)', sym: 'VST', k: 'Earn ' + this.money(ccPrem) + ' on Vistra shares you already own', n: 'Sell 1 Nov 20 $240 call against your ' + vs.sh + ' shares. You keep the premium either way; the trade-off is your upside is capped at $240 (+13%) until Nov 20 — and Tape is bullish.', v: '+' + this.money(ccPrem) + ' · ' + (ccPrem / vs.val * 100).toFixed(1) + '% in 42 days', vc: '#1FD18A', a: 'See VST setup', on: () => this.openSym('VST') },
      { tag: 'CONCENTRATION', c: '#F5B544', bg: 'rgba(245,181,68,.14)', sym: 'NVDA', k: 'NVIDIA is ' + ((ex.NVDA || 0) / tot * 100).toFixed(1) + '% of your money', n: 'You own it directly and again inside QQQ and SMH. Smart money is split on it (score 48, no edge). Selling about ' + trim + ' shares would bring your true exposure to 15%.', v: 'Free up ' + this.money(trim * nv.px), vc: '#F5B544', a: 'See NVDA', on: () => this.openSym('NVDA') },
      { tag: 'ADD', c: '#3FE0A0', bg: 'rgba(31,209,138,.14)', sym: 'LMT', k: 'Your best-scored holding to add to: Lockheed', n: 'LMT scores ' + lm.score + ' into Wednesday’s budget markup. Instead of buying more shares, the ' + lm.best.name.replace('Call spread · ', '') + ' call spread defines your risk: ' + lm.best.line.toLowerCase() + '.', v: lm.best.popTxt, vc: '#1FD18A', a: 'See LMT setup', on: () => this.openSym('LMT') }
    ];
    const F = { m: { NVDA: 1.8, VST: 1.2, CEG: 1.1, LMT: 0.6, QQQ: 1.2, SMH: 1.6, JPM: 1.1, CVNA: 2.2 }, semi: { NVDA: 1, SMH: 1, QQQ: 0.25 }, rate: { NVDA: -4, VST: -3, CEG: -3, LMT: -1, QQQ: -4, SMH: -4, JPM: 2, CVNA: -8 }, oil: { NVDA: -1, VST: 1, CEG: 2, LMT: 0, QQQ: -1, SMH: -1, JPM: 0, CVNA: -3 } };
    const SC = [['S&P 500 −10%', r => -10 * (F.m[r.sym] || 1), 'Beta-weighted: your holdings move ~1.3× the market'], ['Chips −15%', r => -15 * (F.semi[r.sym] || 0), 'Hits NVDA, SMH and the chip slice of QQQ'], ['Rates +0.5%', r => F.rate[r.sym] || 0, 'Utilities and growth fall; banks gain'], ['Oil +20%', r => F.oil[r.sym] || 0, 'Power producers gain; consumers lose']];
    const si = s.pfScen || 0, fn = SC[si][1], imp = P.rows.map(r => ({ k: r.sym, d: r.val * fn(r) / 100 })), sum = imp.reduce((a, x) => a + x.d, 0);
    const scens = SC.map(([l], i) => ({ l, bg: i === si ? '#1B222D' : 'transparent', fg: i === si ? '#E8ECF1' : '#A3ADBB', bc: i === si ? '#3A4553' : '#1E2631', onClick: () => this.setState({ pfScen: i }) }));
    const methods = [['Upload a CSV', 'Export positions from any broker — Fidelity, Schwab, Robinhood, IBKR — and drop the file here.', 'Choose file'], ['Drop a screenshot', 'Take a screenshot of your positions screen. Tape reads the tickers and share counts.', 'Upload image'], ['Type or paste', 'One line is enough: “NVDA 120 @ 118.40, VST 100, LMT 25”.', 'Start typing']].map(([k, n, a]) => ({ k, n, a, onClick: () => { this.setState({ pfBusy: true }); setTimeout(() => this.setState({ pfBusy: false, pfImport: false }), 1300); } }));
    return { pf: {
      rows, kpis, ideas, look, lookNote: 'NVIDIA shows up three times — directly, and inside QQQ and SMH — for ' + ((ex.NVDA || 0) / tot * 100).toFixed(1) + '% of your money.',
      scens, sc: { v: (sum >= 0 ? '+' : '−') + this.money(Math.abs(sum)), p: this.pct(sum / tot * 100), c: this.upc(sum), n: SC[si][2], rows: imp.filter(x => Math.abs(x.d) > 1).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 4).map(x => ({ k: x.k, v: (x.d >= 0 ? '+' : '−') + this.money(Math.abs(x.d)), c: this.upc(x.d) })) },
      importing: !!s.pfImport, importLabel: s.pfImport ? 'Close' : 'Re-import', toggleImport: () => this.setState({ pfImport: !s.pfImport }), methods, importNote: s.pfBusy ? 'Reading your holdings…' : 'Your file never leaves your account'
    } };
  }

  defaultAlerts() {
    return [
      { name: 'Armed Services member buys a defense stock over $50K', src: 'Congress', ch: ['Push', 'Email'], last: 'Fired Sep 30 · LMT', on: true },
      { name: 'Insider cluster buy in anything I own', src: 'Insiders', ch: ['Push'], last: 'Fired Oct 6 · VST', on: true },
      { name: 'Tape Score crosses 85 on my watchlist', src: 'Tape Score', ch: ['Push'], last: 'Fired Fri · VST 92', on: true },
      { name: 'Put sweep over $1M on my holdings', src: 'Options flow', ch: ['Push', 'SMS'], last: 'Fired Fri · CVNA', on: true },
      { name: 'Earnings in 3 days for my holdings', src: 'Calendar', ch: ['Email'], last: 'Daily digest', on: false }
    ];
  }
  alParse(q) {
    const l = q.toLowerCase(), cond = [];
    const source = /congress|senator|house|armed services|politic|lawmaker/.test(l) ? 'A Congress trade is disclosed' : /insider|ceo|director|executive/.test(l) ? 'An insider files a Form 4' : /flow|sweep|calls?\b|puts?\b|option/.test(l) ? 'An unusual options print hits' : /13f|fund/.test(l) ? 'A fund files a 13F' : /score/.test(l) ? 'A Tape Score changes' : /news|headline/.test(l) ? 'High-impact news breaks' : /price|drops|falls|rises|above|below/.test(l) ? 'A price level is hit' : 'Any new signal appears';
    if (/armed services/.test(l)) cond.push('Committee: Armed Services');
    if (/defen[cs]e/.test(l)) cond.push('Sector: Defense');
    if (/power|utilit/.test(l)) cond.push('Sector: Power & utilities');
    if (/\bbuy|bought|purchase/.test(l)) cond.push('Side: Buy'); else if (/\bsell|sold/.test(l)) cond.push('Side: Sell');
    const m = l.match(/\$\s?(\d+(?:\.\d+)?)\s?(k|m|million|thousand)?/); if (m) cond.push('Size ≥ $' + m[1] + (m[2] ? (m[2][0] === 'm' ? 'M' : 'K') : ''));
    if (/(my|i) (own|holdings|portfolio|stocks)/.test(l)) cond.push('Only what I own');
    if (/watchlist/.test(l)) cond.push('Only my watchlist');
    (q.match(/\b[A-Z]{2,5}\b/g) || []).filter(x => this.D.TK[x]).forEach(x => cond.push('Ticker: ' + x));
    if (!cond.length) cond.push('Tape Score ≥ 70');
    return { source, cond, ch: /text|sms/.test(l) ? ['Push', 'SMS'] : ['Push', 'Email'], timing: /daily|digest|morning/.test(l) ? 'Daily digest' : 'Instantly' };
  }
  async buildAlert() {
    const q = (this.state.alText ?? '').trim(); if (!q || this.state.alBusy) return;
    this.setState({ alBusy: true });
    let r = null;
    try {
      const sys = 'Turn an investor’s plain-English alert into JSON: {"source": short phrase like "A Congress trade is disclosed" | "An insider files a Form 4" | "An unusual options print hits" | "A fund files a 13F" | "A Tape Score changes" | "High-impact news breaks" | "A price level is hit", "cond": [2-4 short condition labels like "Committee: Armed Services", "Size ≥ $50K"], "ch": ["Push","Email"|"SMS"], "timing": "Instantly" | "Daily digest"}. Reply with JSON only.';
      const out = await this.complete({ system: sys, max_tokens: 300, messages: [{ role: 'user', content: q }] });
      const mt = String(out).match(/\{[\s\S]*\}/); r = mt ? JSON.parse(mt[0]) : null;
      if (!r || !r.source || !Array.isArray(r.cond)) r = null;
    } catch (e) { r = null; }
    this.setState({ alRule: Object.assign(r || this.alParse(q), { text: q }), alBusy: false, alMade: false });
  }
  alVals() {
    const s = this.state, txt = s.alText ?? 'Tell me when an Armed Services member buys a defense stock over $50K';
    const rule = s.alRule || Object.assign(this.alParse(txt), { text: txt }), list = s.alList || this.defaultAlerts();
    const h = this.hash(rule.text || ''), fires = 3 + h % 9, avg = ((h >> 5) % 60) / 10 - 0.8;
    const fired = [['O', 'CVNA', '$1.44M Nov $260 put sweep at the ask', 'bear', 'Fri 2:58 PM', 'Put sweep over $1M on my holdings'], ['S', 'VST', 'Tape Score rose from 84 to 92', 'bull', 'Fri 4:05 PM', 'Tape Score crosses 85'], ['I', 'VST', 'Two directors bought $4.1M', 'bull', 'Tue 6:12 PM', 'Insider cluster buy'], ['C', 'LMT', 'Sen. Whitcomb (R-TX) bought $50K–$100K', 'bull', 'Sep 30', 'Armed Services member buys defense']].map(([code, sym, text, st, when, r]) => { const c = this.chip(code, st); return { code, sym, text, when, rule: r, cb: c.bg, cf: c.fg, onClick: () => this.openSym(sym) }; });
    return { al: {
      text: txt, onText: e => this.setState({ alText: e.target.value }), onKey: e => { if (e.key === 'Enter') this.buildAlert(); }, build: () => this.buildAlert(), buildLabel: s.alBusy ? 'Reading…' : 'Build alert',
      examples: ['Tell me when insiders buy anything I own', 'Text me if a put sweep over $1M hits CVNA', 'Daily digest of new setups scoring 80+', 'Alert me when a senator buys a power stock'].map(t => ({ t, onClick: () => this.setState({ alText: t }, () => this.buildAlert()) })),
      rule: { source: rule.source, cond: rule.cond, ch: rule.ch || ['Push'], timing: rule.timing || 'Instantly', bt: 'Illustrative rule only. No historical backtest has been run. Save it to your workspace; live notification delivery is not yet connected.' },
      createLabel: s.alMade ? '✓ Alert created' : 'Create alert',
      create: () => { if (s.alMade) return; this.setState({ alMade: true, alList: [{ name: rule.text || txt, src: rule.source, ch: rule.ch || ['Push'], last: 'Saved rule · delivery not connected', on: true }].concat(list) }); },
      list: list.map((a, i) => ({ name: a.name, src: a.src, chs: (a.ch || []).join(' + '), last: a.last, op: a.on ? 1 : 0.55, swBg: a.on ? '#1FD18A' : '#2A3340', kx: a.on ? '18px' : '2px', onToggle: () => this.setState({ alList: list.map((x, j) => j === i ? Object.assign({}, x, { on: !x.on }) : x) }) })),
      activeN: list.filter(a => a.on).length + ' active', fired
    } };
  }
  // @methods
}

}
class DataModel { constructor(props){this.props=props;} }
export default createTapeModel(DataModel);
