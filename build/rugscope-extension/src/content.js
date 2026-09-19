(() => {
  const EVM_RE = /\b0x[a-fA-F0-9]{40}\b/g;
  const SOL_RE = /(^|[^A-Za-z0-9])([1-9A-HJ-NP-Za-km-z]{32,44})(?=$|[^A-Za-z0-9])/g;
  const MAX_TEXT_CHARS = 45000;
  const MAX_LINKS = 90;
  const SCAN_DELAY_MS = 450;
  const KNOWN_TOKEN_HOSTS = [
    "pump.fun",
    "axiom.trade",
    "dexscreener.com",
    "birdeye.so",
    "gmgn.ai",
    "geckoterminal.com",
    "photon-sol.tinyastro.io",
    "bullx.io",
    "defined.fi",
    "dexview.com",
    "dextools.io",
    "ape.pro",
    "jup.ag",
    "raydium.io",
    "solscan.io",
    "solana.fm"
  ];

  function isSupportedTokenHost(host) {
    if (!host) return false;
    const clean = String(host).toLowerCase().split(":")[0];
    return KNOWN_TOKEN_HOSTS.some((item) => clean === item || clean.endsWith("." + item));
  }

  // If not running on a supported crypto token host, do nothing.
  if (typeof window === "undefined" || !document || !location || location.protocol === "chrome:" || !isSupportedTokenHost(location.host)) {
    return;
  }

  let userDismissed = false;
  let overlayVisible = false;
  let scanTimer = 0;
  let lastSignature = "";
  let observer = null;
  let overlayHost = null;
  let overlayExpanded = true;
  let overlayBounds = null;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "rugscope:ping") {
      sendResponse({ ok: true, host: location.host });
      return;
    }

    if (message?.type === "rugscope:toggle-overlay") {
      overlayVisible = !overlayVisible;
      if (overlayVisible) {
        userDismissed = false;
        renderOverlay({ force: true, showOverlay: true });
      } else {
        removeOverlay();
      }
      sendResponse({ ok: true, visible: overlayVisible });
      return;
    }

    if (message?.type === "rugscope:show-overlay") {
      overlayVisible = true;
      userDismissed = false;
      renderOverlay({ force: true, showOverlay: true });
      sendResponse({ ok: true, visible: true });
      return;
    }

    if (message?.type === "rugscope:request-scan") {
      if (message.showOverlay) overlayVisible = true;
      scheduleScan(message.force ? "manual" : "background", Boolean(message.force));
    }

    if (message?.type === "rugscope:scan-result") {
      if (overlayVisible) {
        renderOverlay(message.state);
      }
    }
  });

  installNavigationHooks();
  scheduleScan("load", true);
  startObserver();

  function scheduleScan(reason, force = false) {
    window.clearTimeout(scanTimer);
    scanTimer = window.setTimeout(() => runScan(reason, force), SCAN_DELAY_MS);
  }

  function runScan(reason, force = false) {
    if (!document || !location || location.protocol === "chrome:") {
      return;
    }

    const page = {
      url: location.href,
      title: document.title || "",
      host: location.host
    };
    const candidates = collectCandidates(page);
    const signature = JSON.stringify({
      url: page.url,
      candidates: candidates.map((candidate) => `${candidate.chainType}:${candidate.address}:${candidate.score}`).slice(0, 8)
    });

    if (!force && signature === lastSignature) {
      return;
    }

    lastSignature = signature;
    chrome.runtime.sendMessage({
      type: "rugscope:candidates",
      page,
      candidates,
      reason,
      scannedAt: Date.now()
    }).catch(() => {});
  }

  function collectCandidates(page) {
    const candidateMap = new Map();
    const urlText = decodeSafe(location.href);
    const titleText = document.title || "";
    const metaText = getMetaText();
    const linkText = getLinkText();
    const bodyText = getBodyText();
    const hostBoost = KNOWN_TOKEN_HOSTS.some((host) => location.host.includes(host)) ? 12 : 0;

    addCandidates(candidateMap, urlText, {
      source: "url",
      baseScore: 54 + hostBoost,
      page
    });
    addCandidates(candidateMap, titleText, {
      source: "title",
      baseScore: 32 + hostBoost,
      page
    });
    addCandidates(candidateMap, metaText, {
      source: "metadata",
      baseScore: 28 + hostBoost,
      page
    });
    addCandidates(candidateMap, linkText, {
      source: "links",
      baseScore: 24 + hostBoost,
      page
    });
    addCandidates(candidateMap, bodyText, {
      source: "visible text",
      baseScore: 14 + hostBoost,
      page
    });

    return Array.from(candidateMap.values())
      .filter((candidate) => candidate.score >= 18)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  function addCandidates(map, text, options) {
    if (!text) {
      return;
    }

    for (const match of text.matchAll(EVM_RE)) {
      const address = match[0];
      if (isNoiseAddress(address, "evm")) {
        continue;
      }
      upsertCandidate(map, {
        address,
        chainType: "evm",
        chainId: chainHintFromText(`${location.href} ${options.page.title}`),
        score: scoreCandidate(text, address, options.baseScore),
        source: options.source
      });
    }

    SOL_RE.lastIndex = 0;
    let solMatch;
    while ((solMatch = SOL_RE.exec(text)) !== null) {
      const address = solMatch[2];
      if (isNoiseAddress(address, "solana")) {
        continue;
      }
      upsertCandidate(map, {
        address,
        chainType: "solana",
        chainId: "solana",
        score: scoreCandidate(text, address, options.baseScore),
        source: options.source
      });
    }
  }

  function upsertCandidate(map, candidate) {
    const key = `${candidate.chainType}:${candidate.chainType === "evm" ? candidate.address.toLowerCase() : candidate.address}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        address: candidate.address,
        chainType: candidate.chainType,
        chainId: candidate.chainId || "",
        score: Math.min(100, candidate.score),
        sources: [candidate.source]
      });
      return;
    }

    existing.score = Math.min(100, Math.max(existing.score, candidate.score) + 4);
    existing.sources = Array.from(new Set(existing.sources.concat(candidate.source))).slice(0, 5);
    if (!existing.chainId && candidate.chainId) {
      existing.chainId = candidate.chainId;
    }
  }

  function scoreCandidate(text, address, baseScore) {
    const lower = text.toLowerCase();
    let score = baseScore;
    const addressIndex = lower.indexOf(address.toLowerCase());
    const context = addressIndex >= 0 ? lower.slice(Math.max(0, addressIndex - 80), addressIndex + address.length + 80) : lower.slice(0, 180);

    if (/token|contract|mint|ca[:\s]|pair|coin|pool|address|rug|dex|chart/.test(context)) {
      score += 14;
    }
    if (/pump\.fun|axiom|dexscreener|birdeye|gmgn|geckoterminal|bullx|dextools/.test(lower)) {
      score += 10;
    }
    if (location.pathname.includes(address)) {
      score += 16;
    }
    if (location.search.includes(address)) {
      score += 12;
    }
    return Math.min(100, score);
  }

  function getMetaText() {
    const parts = [];
    const selectors = [
      "meta[name='description']",
      "meta[property='og:title']",
      "meta[property='og:description']",
      "meta[property='twitter:title']",
      "meta[property='twitter:description']",
      "link[rel='canonical']"
    ];

    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (!node) continue;
      parts.push(node.content || node.href || "");
    }

    return parts.join(" ");
  }

  function getLinkText() {
    return Array.from(document.querySelectorAll("a[href]"))
      .slice(0, MAX_LINKS)
      .map((link) => `${link.href || ""} ${link.textContent || ""}`)
      .join(" ");
  }

  function getBodyText() {
    const body = document.body;
    if (!body) {
      return "";
    }

    const text = body.innerText || body.textContent || "";
    return text.slice(0, MAX_TEXT_CHARS);
  }

  function isNoiseAddress(address, chainType) {
    if (chainType === "evm") {
      const lower = address.toLowerCase();
      return lower === "0x0000000000000000000000000000000000000000" || /^0x0+$/.test(lower);
    }

    if (/11111111111111111111111111111111/.test(address)) {
      return true;
    }

    const uniqueChars = new Set(address).size;
    return uniqueChars < 8;
  }

  function chainHintFromText(text) {
    const lower = text.toLowerCase();
    const hints = [
      ["solana", "solana"],
      ["base", "base"],
      ["ethereum", "ethereum"],
      ["eth", "ethereum"],
      ["bsc", "bsc"],
      ["binance", "bsc"],
      ["polygon", "polygon"],
      ["arbitrum", "arbitrum"],
      ["optimism", "optimism"],
      ["avalanche", "avalanche"],
      ["linea", "linea"],
      ["scroll", "scroll"],
      ["blast", "blast"]
    ];

    for (const [needle, chain] of hints) {
      if (lower.includes(needle)) {
        return chain;
      }
    }

    return "";
  }

  function installNavigationHooks() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function pushState(...args) {
      userDismissed = false;
      overlayVisible = false;
      removeOverlay();
      const result = originalPushState.apply(this, args);
      scheduleScan("pushState", true);
      return result;
    };

    history.replaceState = function replaceState(...args) {
      userDismissed = false;
      overlayVisible = false;
      removeOverlay();
      const result = originalReplaceState.apply(this, args);
      scheduleScan("replaceState", true);
      return result;
    };

    window.addEventListener("popstate", () => {
      userDismissed = false;
      overlayVisible = false;
      removeOverlay();
      scheduleScan("popstate", true);
    });
    window.addEventListener("hashchange", () => {
      userDismissed = false;
      overlayVisible = false;
      removeOverlay();
      scheduleScan("hashchange", true);
    });
  }

  function startObserver() {
    if (!document.body || observer) {
      return;
    }

    observer = new MutationObserver((mutations) => {
      const meaningful = mutations.some((mutation) => {
        if (mutation.type !== "childList") return false;
        return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
      });

      if (meaningful) {
        scheduleScan("mutation");
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function renderOverlay(state) {
    const result = state?.result;
    if (!result?.address) {
      removeOverlay();
      return;
    }

    // Do NOT inject in-page overlay unless explicitly activated by user (click-to-activate)
    if (!overlayVisible && !state?.showOverlay) {
      return;
    }

    // Only display in-page overlay if a valid token with DEX pair or RugCheck report was verified,
    // or if the user explicitly triggered a manual scan.
    const isVerifiedToken = Boolean(
      result.dex?.pair ||
      result.rugcheck?.ok ||
      (result.level && result.level !== "unknown")
    );
    const isManual = Boolean(state?.force || state?.reason === "manual");

    if (!isVerifiedToken && !isManual && !state?.showOverlay) {
      removeOverlay();
      return;
    }

    if (userDismissed && !isManual && !state?.showOverlay) {
      return;
    }

    const root = ensureOverlay();
    root.querySelector(".rugscope")?.dispatchEvent(new Event("rugscope:destroy-chart"));
    const level = result.level || "unknown";
    const tokenTitle = result.token?.symbol || result.token?.name || "Token";
    const riskText = result.label ? `${result.label} risk` : "Unknown risk";
    const flags = Array.isArray(result.flags) ? result.flags.slice(0, overlayExpanded ? 8 : 1) : [];
    const facts = Array.isArray(result.facts) ? result.facts.slice(0, overlayExpanded ? 6 : 0) : [];
    const chartHtml = overlayExpanded ? renderChart(result) : "";
    const matchListHtml = overlayExpanded ? renderWalletMatches(result.walletMatches || []) : "";
    const trackerHtml = overlayExpanded ? renderWalletTrackerShell(result) : "";

    root.innerHTML = `
      <style>
        :host {
          all: initial;
          --rs-bg: #08050d;
          --rs-panel: #120b1f;
          --rs-line: rgba(202, 126, 255, 0.32);
          --rs-text: #f8efff;
          --rs-muted: #b9a5cf;
          --rs-purple: #a829ff;
          --rs-pink: #ff4fd8;
          --rs-risk: ${colorForLevel(level)};
          color: var(--rs-text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .rugscope {
          position: fixed;
          right: 18px;
          bottom: 18px;
          width: 540px;
          min-width: 340px;
          min-height: 360px;
          max-width: calc(100vw - 28px);
          max-height: calc(100vh - 36px);
          z-index: 2147483647;
          color: var(--rs-text);
          background: linear-gradient(145deg, rgba(8, 5, 13, 0.98), rgba(23, 10, 36, 0.98));
          border: 1px solid var(--rs-line);
          border-radius: 8px;
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.45), 0 0 24px rgba(168, 41, 255, 0.24);
          overflow: hidden;
        }
        .rugscope.collapsed {
          width: 286px;
          min-width: 286px;
          min-height: auto;
        }
        .top {
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 13px 14px;
          border-bottom: 1px solid rgba(202, 126, 255, 0.18);
          cursor: move;
          user-select: none;
        }
        .collapsed .top {
          grid-template-columns: 34px minmax(0, 1fr) auto;
          gap: 10px;
          padding: 10px 12px;
        }
        .logo {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          box-shadow: 0 0 18px rgba(168, 41, 255, 0.36);
        }
        .collapsed .logo {
          width: 34px;
          height: 34px;
        }
        .brand {
          display: block;
          font-size: 11px;
          line-height: 1;
          color: var(--rs-muted);
          letter-spacing: 0;
        }
        .token {
          display: block;
          margin-top: 3px;
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 16px;
          font-weight: 700;
          color: var(--rs-text);
        }
        .collapsed .token {
          max-width: 142px;
          font-size: 13px;
        }
        .risk-line {
          display: block;
          margin-top: 4px;
          color: var(--rs-risk);
          font-size: 12px;
          font-weight: 800;
        }
        .collapsed .risk-line {
          display: none;
        }
        .score {
          display: grid;
          min-width: 64px;
          min-height: 52px;
          place-items: center;
          padding: 5px 8px;
          border-radius: 7px;
          color: #07040b;
          background: var(--rs-risk);
          font-weight: 800;
          text-align: center;
        }
        .score strong {
          display: block;
          font-size: 20px;
          line-height: 1;
        }
        .score span {
          display: block;
          margin-top: 3px;
          font-size: 10px;
          line-height: 1;
          text-transform: uppercase;
        }
        .collapsed .score {
          min-width: 54px;
          min-height: auto;
          padding: 6px 7px;
        }
        .collapsed .score strong {
          font-size: 14px;
        }
        .collapsed .score span {
          display: none;
        }
        .body {
          max-height: calc(100vh - 116px);
          overflow: auto;
          padding: 12px 14px 14px;
        }
        .rugscope.custom-height .body {
          max-height: none;
          height: calc(100% - 78px);
        }
        .body.compact {
          padding: 10px 12px 12px;
        }
        .address {
          margin-bottom: 10px;
          color: var(--rs-muted);
          font-size: 11px;
          line-height: 1.4;
          word-break: break-all;
        }
        .facts {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 10px;
        }
        .fact {
          min-height: 52px;
          padding: 9px;
          border: 1px solid rgba(202, 126, 255, 0.18);
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.045);
        }
        .fact span {
          display: block;
          color: var(--rs-muted);
          font-size: 10px;
          font-weight: 800;
          line-height: 1;
          text-transform: uppercase;
        }
        .fact strong {
          display: block;
          margin-top: 6px;
          overflow: hidden;
          color: var(--rs-text);
          font-size: 13px;
          line-height: 1.15;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .chart-card,
        .tracker-card,
        .matches-card {
          margin-bottom: 10px;
          padding: 10px;
          border: 1px solid rgba(202, 126, 255, 0.18);
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.04);
        }
        .card-head {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .card-head strong {
          color: var(--rs-text);
          font-size: 12px;
        }
        .card-head span {
          color: var(--rs-muted);
          font-size: 11px;
        }
        .chart-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.24);
        }
        .tv-chart {
          display: block;
          width: 100%;
          height: 238px;
        }
        .tv-marker-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .tv-logo-marker {
          position: absolute;
          display: grid;
          width: 25px;
          height: 25px;
          min-height: 25px;
          place-items: center;
          padding: 0;
          border: 2px solid rgba(248, 239, 255, 0.9);
          border-radius: 50%;
          background: #30f2a2;
          box-shadow: 0 0 14px rgba(168, 41, 255, 0.42);
          pointer-events: auto;
          transform: translate(-50%, -50%);
        }
        .tv-logo-marker.sell {
          background: #ff3b70;
        }
        .tv-logo-marker.dev {
          border-color: var(--rs-pink);
          box-shadow: 0 0 0 3px rgba(255, 79, 216, 0.24), 0 0 18px rgba(255, 79, 216, 0.42);
        }
        .tv-logo-marker img {
          width: 17px;
          height: 17px;
          border-radius: 50%;
          object-fit: cover;
        }
        .chart-empty {
          display: grid;
          min-height: 132px;
          place-items: center;
          color: var(--rs-muted);
          font-size: 12px;
          text-align: center;
        }
        .tracker-row {
          display: grid;
          grid-template-columns: 1fr 92px 74px;
          gap: 7px;
        }
        .tracker-row input {
          min-width: 0;
          height: 34px;
          border: 1px solid rgba(202, 126, 255, 0.22);
          border-radius: 7px;
          color: var(--rs-text);
          background: rgba(0, 0, 0, 0.22);
          font: inherit;
          font-size: 12px;
          padding: 0 9px;
          outline: none;
        }
        .tracker-row input:focus {
          border-color: rgba(255, 79, 216, 0.62);
        }
        .wallet-list {
          display: grid;
          gap: 6px;
          margin-top: 8px;
        }
        .wallet-item {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: center;
          min-height: 31px;
          padding: 6px 7px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.045);
        }
        .wallet-item strong,
        .match strong {
          display: block;
          overflow: hidden;
          color: var(--rs-text);
          font-size: 12px;
          line-height: 1.2;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wallet-item span,
        .match span {
          display: block;
          margin-top: 2px;
          overflow: hidden;
          color: var(--rs-muted);
          font-size: 11px;
          line-height: 1.25;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wallet-item button {
          width: 28px;
          min-width: 28px;
          min-height: 28px;
          padding: 0;
        }
        .matches {
          display: grid;
          gap: 7px;
        }
        .match {
          display: grid;
          grid-template-columns: 22px 1fr auto;
          gap: 8px;
          align-items: center;
          min-height: 42px;
          padding: 7px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.045);
        }
        .match-logo {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 0 10px rgba(168, 41, 255, 0.42);
        }
        .match-badge {
          min-width: 42px;
          padding: 5px 7px;
          border-radius: 6px;
          color: #07040b;
          font-size: 10px;
          font-weight: 900;
          text-align: center;
          text-transform: uppercase;
        }
        .match-badge.buy {
          background: #30f2a2;
        }
        .match-badge.sell {
          background: #ff3b70;
        }
        .match a {
          display: inline;
          min-height: auto;
          padding: 0;
          border: 0;
          border-radius: 0;
          color: var(--rs-pink);
          background: transparent;
          font-size: 11px;
          font-weight: 800;
        }
        .match a:hover {
          border: 0;
          background: transparent;
          color: var(--rs-text);
        }
        .flags {
          display: grid;
          gap: 8px;
        }
        .flag {
          display: grid;
          grid-template-columns: 10px 1fr;
          gap: 9px;
          align-items: start;
          padding: 9px;
          border: 1px solid rgba(202, 126, 255, 0.16);
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.035);
          color: var(--rs-text);
          font-size: 12px;
          line-height: 1.35;
        }
        .compact .flag {
          padding: 0;
          border: 0;
          background: transparent;
        }
        .dot {
          width: 10px;
          height: 10px;
          margin-top: 5px;
          border-radius: 50%;
          background: var(--rs-risk);
        }
        .flag strong {
          display: block;
          font-size: 13px;
          color: var(--rs-text);
        }
        .flag span {
          display: block;
          margin-top: 3px;
          color: var(--rs-muted);
        }
        .compact .flag span {
          display: none;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        button, a {
          appearance: none;
          border: 1px solid rgba(202, 126, 255, 0.28);
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.06);
          color: var(--rs-text);
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          min-height: 34px;
          padding: 8px 10px;
          text-decoration: none;
        }
        button:hover, a:hover {
          border-color: rgba(255, 79, 216, 0.58);
          background: rgba(168, 41, 255, 0.22);
        }
        .close {
          width: 34px;
          min-width: 34px;
          padding-left: 0;
          padding-right: 0;
        }
        .resize-handle {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 20px;
          height: 20px;
          border: 0;
          border-radius: 0;
          background:
            linear-gradient(135deg, transparent 0 45%, rgba(202, 126, 255, 0.62) 46% 55%, transparent 56%),
            linear-gradient(135deg, transparent 0 63%, rgba(202, 126, 255, 0.36) 64% 73%, transparent 74%);
          cursor: nwse-resize;
          min-height: 20px;
          padding: 0;
        }
        .collapsed .resize-handle {
          display: none;
        }
        @media (max-width: 420px) {
          .rugscope {
            right: 10px;
            bottom: 10px;
            width: calc(100vw - 20px);
          }
          .tracker-row {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <section class="rugscope ${overlayExpanded ? "expanded" : "collapsed"} ${overlayExpanded && overlayBounds?.height ? "custom-height" : ""}" style="${escapeAttribute(overlayInlineStyle())}" aria-label="Rugscope token risk scan">
        <div class="top">
          <img class="logo" src="${chrome.runtime.getURL("assets/icon48.png")}" alt="">
          <div>
            <span class="brand">Rugscope</span>
            <span class="token" title="${escapeHtml(tokenTitle)}">${escapeHtml(tokenTitle)}</span>
            <span class="risk-line">${escapeHtml(riskText)}</span>
          </div>
          <div class="score">
            <strong>${escapeHtml(String(Math.round(result.score || 0)))}</strong>
            <span>score</span>
          </div>
        </div>
        <div class="body ${overlayExpanded ? "" : "compact"}">
          <div class="address">${escapeHtml(result.token?.displayAddress || result.address)}</div>
          ${facts.length ? `
            <div class="facts">
              ${facts.map((fact) => `
                <div class="fact">
                  <span>${escapeHtml(fact.label || "")}</span>
                  <strong title="${escapeAttribute(fact.value || "")}">${escapeHtml(fact.value || "")}</strong>
                </div>
              `).join("")}
            </div>
          ` : ""}
          ${chartHtml}
          ${matchListHtml}
          ${trackerHtml}
          <div class="flags">
            ${flags.map((flag) => `
              <div class="flag">
                <i class="dot"></i>
                <div>
                  <strong>${escapeHtml(flag.title || "Risk signal")}</strong>
                  ${flag.detail ? `<span>${escapeHtml(flag.detail)}</span>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
          <div class="actions">
            <button type="button" data-action="toggle">${overlayExpanded ? "Collapse" : "Expand"}</button>
            <button type="button" data-action="refresh">Refresh</button>
            ${result.links?.dex ? `<a href="${escapeAttribute(result.links.dex)}" target="_blank" rel="noopener">DEX</a>` : ""}
            <button type="button" class="close" data-action="close" aria-label="Close">x</button>
          </div>
        </div>
        <button type="button" class="resize-handle" data-action="resize" aria-label="Resize Rugscope panel"></button>
      </section>
    `;

    root.querySelector("[data-action='toggle']")?.addEventListener("click", () => {
      overlayExpanded = !overlayExpanded;
      renderOverlay(state);
    });

    root.querySelector("[data-action='refresh']")?.addEventListener("click", () => {
      scheduleScan("overlay-refresh", true);
    });

    root.querySelector("[data-action='close']")?.addEventListener("click", () => {
      overlayVisible = false;
      userDismissed = true;
      removeOverlay();
    });

    root.querySelector("[data-action='add-wallet']")?.addEventListener("click", async () => {
      const addressInput = root.querySelector("[data-wallet-address]");
      const labelInput = root.querySelector("[data-wallet-label]");
      const address = addressInput?.value || "";
      const label = labelInput?.value || "";
      const response = await chrome.runtime.sendMessage({
        type: "rugscope:add-wallet",
        wallet: { address, label }
      }).catch((error) => ({ ok: false, error: error.message }));

      if (response?.ok) {
        if (addressInput) addressInput.value = "";
        if (labelInput) labelInput.value = "";
        populateWalletList(root, response.wallets || []);
        scheduleScan("wallet-add", true);
      } else {
        setTrackerStatus(root, response?.error || "Could not add wallet.");
      }
    });

    root.querySelectorAll("[data-remove-wallet]").forEach((button) => {
      button.addEventListener("click", async () => {
        const response = await chrome.runtime.sendMessage({
          type: "rugscope:remove-wallet",
          id: button.getAttribute("data-remove-wallet")
        }).catch((error) => ({ ok: false, error: error.message }));

        if (response?.ok) {
          populateWalletList(root, response.wallets || []);
          scheduleScan("wallet-remove", true);
        } else {
          setTrackerStatus(root, response?.error || "Could not remove wallet.");
        }
      });
    });

    if (overlayExpanded) {
      initTradingViewChart(root, result);
      loadWalletTracker(root);
    }
    attachOverlayInteractions(root);
  }

  function renderChart(result) {
    const chart = result.chart;
    const candles = Array.isArray(chart?.candles) ? chart.candles : [];

    if (!chart?.ok || candles.length < 2) {
      const message = chart?.errors?.[0] || "Chart is loading or unavailable for this pool.";
      return `
        <div class="chart-card">
          <div class="card-head">
            <strong>Token chart</strong>
            <span>${escapeHtml(chart?.source || "Market data")}</span>
          </div>
          <div class="chart-empty">${escapeHtml(message)}</div>
        </div>
      `;
    }

    return `
      <div class="chart-card">
        <div class="card-head">
          <strong>Token chart</strong>
          <span>TradingView Lightweight Charts - ${escapeHtml(chart.timeframe || "5m")}</span>
        </div>
        <div class="chart-wrap">
          <div class="tv-chart" data-tv-chart></div>
          <div class="tv-marker-layer" data-tv-marker-layer></div>
        </div>
      </div>
    `;
  }

  function initTradingViewChart(root, result) {
    const chartHost = root.querySelector("[data-tv-chart]");
    const markerLayer = root.querySelector("[data-tv-marker-layer]");
    const chartData = result?.chart;
    const candles = Array.isArray(chartData?.candles) ? chartData.candles : [];
    const markers = Array.isArray(chartData?.markers) ? chartData.markers : [];
    const library = window.LightweightCharts;

    if (!chartHost || !markerLayer || !library || candles.length < 2) {
      return;
    }

    const candleData = candles.map((candle) => ({
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    }));
    const candleByTime = new Map(candleData.map((candle) => [String(candle.time), candle]));
    const chart = library.createChart(chartHost, {
      autoSize: true,
      layout: {
        background: { color: "rgba(0, 0, 0, 0)" },
        textColor: "#b9a5cf",
        attributionLogo: true
      },
      grid: {
        vertLines: { color: "rgba(202, 126, 255, 0.10)" },
        horzLines: { color: "rgba(202, 126, 255, 0.10)" }
      },
      rightPriceScale: {
        borderColor: "rgba(202, 126, 255, 0.18)",
        scaleMargins: {
          top: 0.18,
          bottom: 0.16
        }
      },
      timeScale: {
        borderColor: "rgba(202, 126, 255, 0.18)",
        timeVisible: true,
        secondsVisible: false
      },
      crosshair: {
        mode: library.CrosshairMode?.Magnet ?? 1,
        vertLine: { color: "rgba(255, 79, 216, 0.35)" },
        horzLine: { color: "rgba(255, 79, 216, 0.35)" }
      }
    });
    const candleSeries = chart.addSeries(library.CandlestickSeries, {
      upColor: "#30f2a2",
      downColor: "#ff3b70",
      borderUpColor: "#30f2a2",
      borderDownColor: "#ff3b70",
      wickUpColor: "#30f2a2",
      wickDownColor: "#ff3b70",
      priceFormat: {
        type: "price",
        precision: 8,
        minMove: 0.00000001
      }
    });

    candleSeries.setData(candleData);
    if (library.createSeriesMarkers && markers.length) {
      library.createSeriesMarkers(candleSeries, markers.slice(0, 40).map((marker) => ({
        time: marker.candleTime || marker.timestamp,
        position: marker.kind === "sell" ? "aboveBar" : "belowBar",
        color: marker.kind === "sell" ? "#ff3b70" : "#30f2a2",
        shape: marker.kind === "sell" ? "arrowDown" : "arrowUp",
        text: marker.isDev ? "DEV" : shortAddress(marker.walletLabel || "Wallet"),
        size: marker.isDev ? 1.25 : 1
      })));
    }

    chart.timeScale().fitContent();

    const drawLogoMarkers = () => {
      markerLayer.innerHTML = markers.slice(0, 24).map((marker) => {
        const time = marker.candleTime || marker.timestamp;
        const candle = candleByTime.get(String(time)) || candleData.find((item) => item.time >= time) || candleData[candleData.length - 1];
        const x = chart.timeScale().timeToCoordinate(candle.time);
        const price = Number(marker.priceUsd) || candle.close;
        const y = candleSeries.priceToCoordinate(price);

        if (x == null || y == null) {
          return "";
        }

        const side = marker.kind === "sell" ? "sell" : "buy";
        const title = `${marker.walletLabel || "Tracked wallet"} ${side} ${marker.amount || ""} ${marker.tokenSymbol || ""} ${marker.volumeUsd ? formatUsd(marker.volumeUsd) : ""}`;
        return `
          <button class="tv-logo-marker ${escapeAttribute(side)} ${marker.isDev ? "dev" : ""}" type="button" title="${escapeAttribute(title)}" style="left:${x.toFixed(2)}px; top:${y.toFixed(2)}px;">
            <img src="${escapeAttribute(chrome.runtime.getURL("assets/icon48.png"))}" alt="">
          </button>
        `;
      }).join("");
    };

    drawLogoMarkers();
    chart.timeScale().subscribeVisibleTimeRangeChange(drawLogoMarkers);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize(chartHost.clientWidth, chartHost.clientHeight);
      drawLogoMarkers();
    });
    resizeObserver.observe(chartHost);

    const panel = root.querySelector(".rugscope");
    const cleanup = () => {
      resizeObserver.disconnect();
      chart.remove();
    };
    panel?.addEventListener("rugscope:destroy-chart", cleanup, { once: true });
  }

  function renderWalletMatches(matches) {
    const rows = matches.slice(0, 5);
    if (!rows.length) {
      return "";
    }

    const logoUrl = chrome.runtime.getURL("assets/icon48.png");
    return `
      <div class="matches-card">
        <div class="card-head">
          <strong>Tracked wallet trades</strong>
          <span>${rows.length} shown</span>
        </div>
        <div class="matches">
          ${rows.map((match) => `
            <div class="match">
              <img class="match-logo" src="${escapeAttribute(logoUrl)}" alt="">
              <div>
                <strong title="${escapeAttribute(match.walletAddress || "")}">${escapeHtml(match.walletLabel || "Tracked wallet")}${match.isDev ? " - Dev" : ""}</strong>
                <span>${escapeHtml(formatMatchDetail(match))}</span>
                ${match.txUrl ? `<span><a href="${escapeAttribute(match.txUrl)}" target="_blank" rel="noopener">Transaction</a></span>` : ""}
              </div>
              <span class="match-badge ${escapeAttribute(match.kind || "buy")}">${escapeHtml(match.kind || "buy")}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderWalletTrackerShell(result) {
    const count = result.walletTracker?.trackedCount || 0;
    return `
      <div class="tracker-card">
        <div class="card-head">
          <strong>Wallet tracker</strong>
          <span data-tracker-status>${count ? `${count} tracked` : "Add wallet"}</span>
        </div>
        <div class="tracker-row">
          <input data-wallet-address type="text" spellcheck="false" placeholder="Wallet address">
          <input data-wallet-label type="text" spellcheck="false" placeholder="Label">
          <button type="button" data-action="add-wallet">Track</button>
        </div>
        <div class="wallet-list" data-wallet-list></div>
      </div>
    `;
  }

  async function loadWalletTracker(root) {
    const response = await chrome.runtime.sendMessage({ type: "rugscope:get-wallets" }).catch((error) => ({
      ok: false,
      error: error.message
    }));

    if (response?.ok) {
      populateWalletList(root, response.wallets || []);
    } else {
      setTrackerStatus(root, response?.error || "Could not load wallets.");
    }
  }

  function populateWalletList(root, wallets) {
    const list = root.querySelector("[data-wallet-list]");
    if (!list) {
      return;
    }

    const rows = wallets.slice(0, 5);
    list.innerHTML = rows.length ? rows.map((wallet) => `
      <div class="wallet-item">
        <div>
          <strong>${escapeHtml(wallet.label || "Tracked wallet")}</strong>
          <span>${escapeHtml(shortAddress(wallet.address || ""))}</span>
        </div>
        <button type="button" data-remove-wallet="${escapeAttribute(wallet.id)}" aria-label="Remove wallet">x</button>
      </div>
    `).join("") : "";

    setTrackerStatus(root, wallets.length ? `${wallets.length} tracked` : "Add wallet");
    list.querySelectorAll("[data-remove-wallet]").forEach((button) => {
      button.addEventListener("click", async () => {
        const response = await chrome.runtime.sendMessage({
          type: "rugscope:remove-wallet",
          id: button.getAttribute("data-remove-wallet")
        }).catch((error) => ({ ok: false, error: error.message }));

        if (response?.ok) {
          populateWalletList(root, response.wallets || []);
          scheduleScan("wallet-remove", true);
        } else {
          setTrackerStatus(root, response?.error || "Could not remove wallet.");
        }
      });
    });
  }

  function setTrackerStatus(root, message) {
    const node = root.querySelector("[data-tracker-status]");
    if (node) {
      node.textContent = message;
    }
  }

  function formatMatchDetail(match) {
    const side = match.kind === "sell" ? "Sold" : "Bought";
    const amount = [match.amount, match.tokenSymbol].filter(Boolean).join(" ");
    const usd = match.volumeUsd == null ? "" : ` - ${formatUsd(match.volumeUsd)}`;
    const time = formatChartTime(match.timestamp);
    return `${side} ${amount || "token"}${usd} at ${time}`;
  }

  function formatUsd(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: number >= 10000 ? "compact" : "standard",
      maximumFractionDigits: number >= 10000 ? 1 : 2
    }).format(number);
  }

  function formatPrice(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "";
    if (number >= 1000) return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(number);
    if (number >= 1) return number.toFixed(2);
    return number.toPrecision(3);
  }

  function formatChartTime(timestamp) {
    const number = Number(timestamp);
    if (!Number.isFinite(number)) return "";
    return new Date(number * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function shortAddress(address) {
    const value = String(address || "");
    return value.length > 14 ? `${value.slice(0, 6)}...${value.slice(-6)}` : value;
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function attachOverlayInteractions(root) {
    const panel = root.querySelector(".rugscope");
    const header = root.querySelector(".top");
    const handle = root.querySelector("[data-action='resize']");

    if (!panel) {
      return;
    }

    applyOverlayBounds(panel);

    header?.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target?.closest?.("button, a, input")) {
        return;
      }
      startOverlayDrag(event, panel);
    });

    handle?.addEventListener("pointerdown", (event) => {
      if (!overlayExpanded) {
        return;
      }
      startOverlayResize(event, panel);
    });
  }

  function startOverlayDrag(event, panel) {
    event.preventDefault();
    const rect = panel.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = rect.left;
    const startTop = rect.top;
    const startBounds = overlayBounds || {
      width: rect.width,
      height: rect.height
    };

    const move = (moveEvent) => {
      const left = clampNumber(startLeft + moveEvent.clientX - startX, 8, Math.max(8, window.innerWidth - rect.width - 8));
      const top = clampNumber(startTop + moveEvent.clientY - startY, 8, Math.max(8, window.innerHeight - rect.height - 8));
      overlayBounds = {
        ...startBounds,
        left,
        top,
        width: startBounds.width || rect.width,
        height: startBounds.height || (overlayExpanded ? rect.height : null)
      };
      applyOverlayBounds(panel);
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      saveOverlayBounds();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  }

  function startOverlayResize(event, panel) {
    event.preventDefault();
    event.stopPropagation();
    const rect = panel.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = rect.width;
    const startHeight = rect.height;
    const left = rect.left;
    const top = rect.top;

    const move = (moveEvent) => {
      const width = clampNumber(startWidth + moveEvent.clientX - startX, 340, Math.max(340, window.innerWidth - left - 8));
      const height = clampNumber(startHeight + moveEvent.clientY - startY, 360, Math.max(360, window.innerHeight - top - 8));
      overlayBounds = { left, top, width, height };
      panel.classList.add("custom-height");
      applyOverlayBounds(panel);
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      saveOverlayBounds();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  }

  function overlayInlineStyle() {
    const bounds = normalizeOverlayBounds(overlayBounds);
    if (!bounds) {
      return "";
    }

    const pieces = [
      `left:${bounds.left}px`,
      `top:${bounds.top}px`,
      "right:auto",
      "bottom:auto"
    ];

    if (overlayExpanded) {
      pieces.push(`width:${bounds.width}px`);
      if (bounds.height) {
        pieces.push(`height:${bounds.height}px`);
      }
    }

    return pieces.join(";");
  }

  function applyOverlayBounds(panel) {
    const bounds = normalizeOverlayBounds(overlayBounds);
    if (!panel || !bounds) {
      return;
    }

    panel.style.left = `${bounds.left}px`;
    panel.style.top = `${bounds.top}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";

    if (overlayExpanded) {
      panel.style.width = `${bounds.width}px`;
      if (bounds.height) {
        panel.style.height = `${bounds.height}px`;
        panel.classList.add("custom-height");
      }
    }
  }

  function normalizeOverlayBounds(bounds) {
    if (!bounds) {
      return null;
    }

    const width = clampNumber(Number(bounds.width) || 540, 340, Math.max(340, window.innerWidth - 16));
    const height = bounds.height ? clampNumber(Number(bounds.height), 360, Math.max(360, window.innerHeight - 16)) : null;
    const panelHeight = height || 420;
    const left = clampNumber(Number(bounds.left) || window.innerWidth - width - 18, 8, Math.max(8, window.innerWidth - width - 8));
    const top = clampNumber(Number(bounds.top) || window.innerHeight - panelHeight - 18, 8, Math.max(8, window.innerHeight - panelHeight - 8));

    return {
      left: Math.round(left),
      top: Math.round(top),
      width: Math.round(width),
      height: height ? Math.round(height) : null
    };
  }

  function saveOverlayBounds() {
    if (!overlayBounds) {
      return;
    }

    chrome.storage.local.set({
      rugscopeOverlayBounds: normalizeOverlayBounds(overlayBounds)
    }).catch(() => {});
  }

  function loadOverlayBounds(root) {
    chrome.storage.local.get("rugscopeOverlayBounds").then(({ rugscopeOverlayBounds }) => {
      overlayBounds = normalizeOverlayBounds(rugscopeOverlayBounds);
      const panel = root.querySelector(".rugscope");
      if (panel) {
        applyOverlayBounds(panel);
      }
    }).catch(() => {});
  }

  function ensureOverlay() {
    if (overlayHost?.isConnected) {
      return overlayHost.shadowRoot;
    }

    overlayHost = document.createElement("rugscope-scan");
    overlayHost.style.position = "relative";
    overlayHost.style.zIndex = "2147483647";
    const root = overlayHost.attachShadow({ mode: "open" });
    document.documentElement.appendChild(overlayHost);
    loadOverlayBounds(root);
    return root;
  }

  function removeOverlay() {
    if (overlayHost?.parentNode) {
      overlayHost.parentNode.removeChild(overlayHost);
    }
    overlayHost = null;
  }

  function colorForLevel(level) {
    if (level === "critical") return "#ff3b70";
    if (level === "high") return "#ff7a45";
    if (level === "moderate") return "#ffd166";
    if (level === "low") return "#30f2a2";
    return "#b582ff";
  }

  function decodeSafe(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
})();
