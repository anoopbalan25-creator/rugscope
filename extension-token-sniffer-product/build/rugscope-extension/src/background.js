const API_TIMEOUT_MS = 8500;
const SCAN_CACHE_TTL_MS = 2 * 60 * 1000;
const MAX_STORED_TAB_STATES = 30;
const WALLET_POLL_ALARM = "rugscope:wallet-poll";
const WALLET_POLL_PERIOD_MINUTES = 1;
const MAX_TRACKED_WALLETS = 40;
const MAX_WALLET_MATCHES = 80;
const MAX_STORED_WALLET_ALERTS = 300;
const MAX_WALLET_WIDE_SIGNATURES = 24;
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

const CHAIN_ALIASES = {
  sol: "solana",
  solana: "solana",
  eth: "ethereum",
  ether: "ethereum",
  ethereum: "ethereum",
  base: "base",
  bsc: "bsc",
  binance: "bsc",
  polygon: "polygon",
  matic: "polygon",
  arbitrum: "arbitrum",
  arb: "arbitrum",
  optimism: "optimism",
  op: "optimism",
  avalanche: "avalanche",
  avax: "avalanche",
  fantom: "fantom",
  ftm: "fantom",
  sonic: "sonic",
  linea: "linea",
  scroll: "scroll",
  blast: "blast",
  cronos: "cronos",
  pulsechain: "pulsechain"
};

const RISK_META = {
  low: {
    label: "Low",
    badge: "LOW",
    color: "#30f2a2"
  },
  moderate: {
    label: "Moderate",
    badge: "MOD",
    color: "#ffd166"
  },
  high: {
    label: "High",
    badge: "HIGH",
    color: "#ff7a45"
  },
  critical: {
    label: "Critical",
    badge: "RUG?",
    color: "#ff3b70"
  },
  unknown: {
    label: "Unknown",
    badge: "SCAN",
    color: "#b582ff"
  }
};

const GECKO_NETWORKS = {
  ethereum: "eth",
  eth: "eth",
  bsc: "bsc",
  base: "base",
  polygon: "polygon_pos",
  arbitrum: "arbitrum",
  optimism: "optimism",
  avalanche: "avax",
  avax: "avax",
  fantom: "ftm",
  ftm: "ftm",
  solana: "solana",
  linea: "linea",
  scroll: "scroll",
  blast: "blast",
  cronos: "cro",
  pulsechain: "pulsechain",
  mantle: "mantle",
  zksync: "zksync",
  ton: "ton",
  sonic: "sonic"
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) {
    return false;
  }

  if (message.type === "rugscope:candidates") {
    handleCandidatesMessage(message, sender).then(sendResponse).catch((error) => {
      sendResponse({
        ok: false,
        error: error.message || "Scan failed"
      });
    });
    return true;
  }

  if (message.type === "rugscope:get-active-tab-scan") {
    getActiveTabState().then(sendResponse).catch((error) => {
      sendResponse({
        ok: false,
        error: error.message || "Could not read active tab scan"
      });
    });
    return true;
  }

  if (message.type === "rugscope:rescan-active") {
    rescanActiveTab().then(sendResponse).catch((error) => {
      sendResponse({
        ok: false,
        error: error.message || "Could not refresh scan"
      });
    });
    return true;
  }

  if (message.type === "rugscope:get-wallets") {
    getTrackedWallets().then((wallets) => sendResponse({ ok: true, wallets })).catch((error) => {
      sendResponse({
        ok: false,
        error: error.message || "Could not load wallets"
      });
    });
    return true;
  }

  if (message.type === "rugscope:add-wallet") {
    addTrackedWallet(message.wallet || message).then((wallets) => sendResponse({ ok: true, wallets })).catch((error) => {
      sendResponse({
        ok: false,
        error: error.message || "Could not add wallet"
      });
    });
    return true;
  }

  if (message.type === "rugscope:remove-wallet") {
    removeTrackedWallet(message.id || message.address).then((wallets) => sendResponse({ ok: true, wallets })).catch((error) => {
      sendResponse({
        ok: false,
        error: error.message || "Could not remove wallet"
      });
    });
    return true;
  }

  if (message.type === "rugscope:poll-wallets") {
    pollTrackedWallets({ notify: false }).then((result) => sendResponse({ ok: true, ...result })).catch((error) => {
      sendResponse({
        ok: false,
        error: error.message || "Could not refresh wallet tracker"
      });
    });
    return true;
  }

  if (message.type === "rugscope:get-wallet-alerts") {
    getWalletAlerts().then((alerts) => sendResponse({ ok: true, alerts })).catch((error) => {
      sendResponse({
        ok: false,
        error: error.message || "Could not load alerts"
      });
    });
    return true;
  }

  if (message.type === "rugscope:clear-wallet-alerts") {
    clearWalletAlerts().then(() => sendResponse({ ok: true, alerts: [] })).catch((error) => {
      sendResponse({
        ok: false,
        error: error.message || "Could not clear alerts"
      });
    });
    return true;
  }

  if (message.type === "rugscope:open-alerts-page") {
    chrome.tabs.create({ url: chrome.runtime.getURL("alerts/alerts.html") }).then(() => {
      sendResponse({ ok: true });
    }).catch((error) => {
      sendResponse({
        ok: false,
        error: error.message || "Could not open alerts"
      });
    });
    return true;
  }

  return false;
});

chrome.runtime.onInstalled.addListener(() => {
  ensureWalletPollAlarm();
});

chrome.runtime.onStartup?.addListener(() => {
  ensureWalletPollAlarm();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === WALLET_POLL_ALARM) {
    pollTrackedWallets({ notify: true }).catch(() => {});
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const state = await getTabState(tabId);
  if (state?.result) {
    await updateBadge(tabId, state.result.level);
    return;
  }
  requestContentScan(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    requestContentScan(tabId);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { rugscopeTabStates = {} } = await chrome.storage.local.get("rugscopeTabStates");
  delete rugscopeTabStates[String(tabId)];
  await chrome.storage.local.set({ rugscopeTabStates });
});

async function handleCandidatesMessage(message, sender) {
  const tabId = sender?.tab?.id;
  const page = sanitizePage(message.page);
  const candidates = normalizeCandidates(message.candidates || []);

  if (typeof tabId !== "number") {
    return { ok: false, error: "Missing tab context" };
  }

  if (!candidates.length) {
    const emptyState = {
      status: "idle",
      page,
      result: null,
      candidates: [],
      updatedAt: Date.now()
    };
    await saveTabState(tabId, emptyState);
    await updateBadge(tabId, "unknown", "");
    sendScanResultToTab(tabId, emptyState);
    return { ok: true, state: emptyState };
  }

  const state = {
    status: "scanning",
    page,
    candidates,
    result: null,
    updatedAt: Date.now()
  };
  await saveTabState(tabId, state);
  await updateBadge(tabId, "unknown", "...");

  const result = await scanBestCandidate(candidates, page);
  const completedState = {
    status: "complete",
    page,
    candidates,
    result,
    updatedAt: Date.now()
  };

  await saveTabState(tabId, completedState);
  await updateBadge(tabId, result.level);
  sendScanResultToTab(tabId, completedState);

  return { ok: true, state: completedState };
}

async function getActiveTabState() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return { ok: false, error: "No active tab found" };
  }

  const state = await getTabState(tab.id);
  return {
    ok: true,
    tabId: tab.id,
    state: state || {
      status: "idle",
      page: {
        url: tab.url || "",
        title: tab.title || "",
        host: safeHost(tab.url)
      },
      candidates: [],
      result: null,
      updatedAt: Date.now()
    }
  };
}

async function rescanActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return { ok: false, error: "No active tab found" };
  }

  requestContentScan(tab.id, true);
  const state = await getTabState(tab.id);

  if (state?.candidates?.length) {
    const nextResult = await scanBestCandidate(state.candidates, state.page, { force: true });
    const nextState = {
      ...state,
      status: "complete",
      result: nextResult,
      updatedAt: Date.now()
    };
    await saveTabState(tab.id, nextState);
    await updateBadge(tab.id, nextResult.level);
    sendScanResultToTab(tab.id, nextState);
    return { ok: true, state: nextState };
  }

  return {
    ok: true,
    state: state || {
      status: "idle",
      candidates: [],
      result: null,
      updatedAt: Date.now()
    }
  };
}

async function scanBestCandidate(candidates, page, options = {}) {
  const sorted = [...candidates].sort((a, b) => b.score - a.score).slice(0, 4);
  const hints = getPageHints(page);
  const scanned = [];

  for (const candidate of sorted) {
    const result = await scanToken(candidate, page, hints, options);
    scanned.push(result);
    if (result.dex?.pair || result.rugcheck?.ok) {
      return {
        ...result,
        alternates: scanned.concat(sorted.slice(scanned.length).map((item) => ({
          address: item.address,
          chainType: item.chainType,
          confidence: item.score,
          skipped: true
        })))
      };
    }
  }

  const fallback = scanned[0] || buildUnknownResult(sorted[0], page, "No candidate could be scanned.");
  return {
    ...fallback,
    alternates: scanned.slice(1)
  };
}

async function scanToken(candidate, page, hints, options = {}) {
  const address = candidate.address;
  const chainType = candidate.chainType;
  const chainHint = candidate.chainId || hints.chainId || (chainType === "solana" ? "solana" : "");
  const cacheKey = `scan:${chainType}:${chainHint || "any"}:${canonicalAddress(address, chainType)}`;
  const cached = await getCachedScan(cacheKey);

  if (cached && !options.force) {
    const enrichedCached = await enrichResultWithMarketData(cached, {
      notify: false,
      page
    });
    return {
      ...cached,
      ...enrichedCached,
      cached: true
    };
  }

  const [dex, rugcheck] = await Promise.all([
    fetchDexAnalysis(address, chainType, chainHint, page),
    chainType === "solana" ? fetchRugcheck(address) : Promise.resolve({
      ok: false,
      reason: "RugCheck is Solana-only; EVM creator/contract checks are unavailable in this build."
    })
  ]);

  const result = await buildRiskResult(candidate, page, dex, rugcheck);
  const enrichedResult = await enrichResultWithMarketData(result, {
    notify: !options.force,
    page
  });
  await setCachedScan(cacheKey, enrichedResult);
  return enrichedResult;
}

async function fetchDexAnalysis(address, chainType, chainHint, page) {
  const pairCandidates = [];
  const errors = [];

  if (chainHint) {
    try {
      const tokenPairs = await fetchJson(`https://api.dexscreener.com/tokens/v1/${encodeURIComponent(chainHint)}/${encodeURIComponent(address)}`);
      if (Array.isArray(tokenPairs)) {
        pairCandidates.push(...tokenPairs);
      }
    } catch (error) {
      errors.push(`DEX token lookup failed: ${error.message}`);
    }

    if (isDexScreenerPage(page?.host)) {
      try {
        const pairData = await fetchJson(`https://api.dexscreener.com/latest/dex/pairs/${encodeURIComponent(chainHint)}/${encodeURIComponent(address)}`);
        if (Array.isArray(pairData?.pairs)) {
          pairCandidates.push(...pairData.pairs);
        }
      } catch (error) {
        errors.push(`DEX pair lookup failed: ${error.message}`);
      }
    }
  }

  try {
    const search = await fetchJson(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(address)}`);
    if (Array.isArray(search?.pairs)) {
      pairCandidates.push(...search.pairs);
    }
  } catch (error) {
    errors.push(`DEX search failed: ${error.message}`);
  }

  const pairs = dedupePairs(pairCandidates);
  const pair = chooseBestPair(pairs, address, chainType, chainHint);

  return {
    ok: Boolean(pair),
    pair,
    pairs,
    errors,
    source: "DEX Screener"
  };
}

async function fetchRugcheck(mint) {
  try {
    const summary = await fetchJson(`https://api.rugcheck.xyz/v1/tokens/${encodeURIComponent(mint)}/report/summary`);
    return {
      ok: true,
      summary,
      source: "RugCheck"
    };
  } catch (summaryError) {
    try {
      const report = await fetchJson(`https://api.rugcheck.xyz/v1/tokens/${encodeURIComponent(mint)}/report`);
      return {
        ok: true,
        summary: report,
        source: "RugCheck",
        usedFullReport: true
      };
    } catch (reportError) {
      return {
        ok: false,
        reason: `RugCheck unavailable: ${summaryError.message || reportError.message}`,
        source: "RugCheck"
      };
    }
  }
}

async function buildRiskResult(candidate, page, dex, rugcheck) {
  const now = Date.now();
  const pair = dex.pair;
  const flags = [];
  const facts = [];
  let score = 12;
  let creatorWallet = null;

  if (!dex.ok) {
    addFlag(flags, "critical", "No active DEX market found", "No matching liquidity pool was returned for the detected address.");
    score += 38;
  } else {
    const liquidityUsd = numberOrNull(pair?.liquidity?.usd);
    const ageHours = pair?.pairCreatedAt ? (now - pair.pairCreatedAt) / 3600000 : null;
    const priceChangeH1 = numberOrNull(pair?.priceChange?.h1);
    const priceChangeH24 = numberOrNull(pair?.priceChange?.h24);
    const buysH1 = numberOrNull(pair?.txns?.h1?.buys) || 0;
    const sellsH1 = numberOrNull(pair?.txns?.h1?.sells) || 0;
    const fdv = numberOrNull(pair?.fdv || pair?.marketCap);
    const lpSnapshot = await updateLiquiditySnapshot(candidate, pair);

    facts.push({
      label: "Liquidity",
      value: liquidityUsd == null ? "Unknown" : formatCompactUsd(liquidityUsd)
    });
    facts.push({
      label: "Pair age",
      value: ageHours == null ? "Unknown" : formatAge(ageHours)
    });
    facts.push({
      label: "DEX",
      value: pair.dexId || "Unknown"
    });

    if (liquidityUsd == null) {
      addFlag(flags, "moderate", "Liquidity not reported", "DEX Screener did not return a USD liquidity value.");
      score += 12;
    } else if (liquidityUsd < 1000) {
      addFlag(flags, "critical", "Very low liquidity", `${formatCompactUsd(liquidityUsd)} in pool liquidity can be removed or overwhelmed quickly.`);
      score += 28;
    } else if (liquidityUsd < 10000) {
      addFlag(flags, "high", "Thin liquidity", `${formatCompactUsd(liquidityUsd)} liquidity is fragile for active trading.`);
      score += 18;
    } else if (liquidityUsd < 50000) {
      addFlag(flags, "moderate", "Limited liquidity", `${formatCompactUsd(liquidityUsd)} liquidity deserves caution on volatile tokens.`);
      score += 8;
    }

    if (lpSnapshot?.dropPct >= 50 && lpSnapshot.dropUsd >= 500) {
      addFlag(flags, "critical", "Possible liquidity removal", `Liquidity fell ${lpSnapshot.dropPct.toFixed(0)}% since the last Rugscope scan.`);
      score += 34;
    } else if (lpSnapshot?.dropPct >= 25 && lpSnapshot.dropUsd >= 500) {
      addFlag(flags, "high", "Liquidity is dropping", `Liquidity fell ${lpSnapshot.dropPct.toFixed(0)}% since the last Rugscope scan.`);
      score += 20;
    }

    if (ageHours != null && ageHours < 1) {
      addFlag(flags, "high", "Brand-new pool", "The main trading pair is less than one hour old.");
      score += 18;
    } else if (ageHours != null && ageHours < 24) {
      addFlag(flags, "moderate", "New trading pair", "The main trading pair is less than 24 hours old.");
      score += 10;
    }

    if (priceChangeH1 != null && priceChangeH1 <= -25) {
      addFlag(flags, "high", "Sharp 1h price drop", `Price is down ${Math.abs(priceChangeH1).toFixed(1)}% in the last hour.`);
      score += 18;
    } else if (priceChangeH24 != null && priceChangeH24 <= -60) {
      addFlag(flags, "high", "Severe 24h drawdown", `Price is down ${Math.abs(priceChangeH24).toFixed(1)}% over 24 hours.`);
      score += 16;
    } else if (priceChangeH24 != null && priceChangeH24 <= -35) {
      addFlag(flags, "moderate", "Large 24h drawdown", `Price is down ${Math.abs(priceChangeH24).toFixed(1)}% over 24 hours.`);
      score += 9;
    }

    if (sellsH1 > 20 && buysH1 > 0 && sellsH1 >= buysH1 * 2) {
      addFlag(flags, "moderate", "Sell pressure", `${sellsH1} sells vs ${buysH1} buys in the last hour.`);
      score += 10;
    }

    if (liquidityUsd && fdv) {
      const fdvToLp = fdv / liquidityUsd;
      if (fdvToLp > 200) {
        addFlag(flags, "high", "FDV dwarfs liquidity", `FDV/liquidity ratio is about ${fdvToLp.toFixed(0)}x.`);
        score += 16;
      } else if (fdvToLp > 75) {
        addFlag(flags, "moderate", "High FDV/liquidity ratio", `FDV/liquidity ratio is about ${fdvToLp.toFixed(0)}x.`);
        score += 8;
      }
    }
  }

  if (rugcheck.ok) {
    const summary = rugcheck.summary || {};
    const risks = Array.isArray(summary.risks) ? summary.risks : [];
    const normalizedScore = normalizeRugcheckScore(summary);
    const lpLockedPct = numberOrNull(summary.lpLockedPct);
    const topHoldersPct = numberOrNull(summary.topHoldersPct);
    creatorWallet = extractCreatorWallet(summary);

    facts.push({
      label: "Creator check",
      value: creatorSignal(summary, risks)
    });

    if (normalizedScore != null) {
      facts.push({
        label: "RugCheck score",
        value: `${Math.round(normalizedScore)}/100`
      });
      score += Math.min(34, Math.round(normalizedScore * 0.34));
    }

    for (const risk of risks.slice(0, 8)) {
      const level = normalizeRiskLevel(risk.level || risk.severity || risk.type);
      const title = cleanText(risk.name || risk.title || "RugCheck risk");
      const detail = cleanText(risk.description || risk.value || risk.message || "");
      addFlag(flags, level, title, detail);
      score += level === "critical" ? 16 : level === "high" ? 12 : 6;
    }

    if (summary.mintAuthority) {
      addFlag(flags, "high", "Mint authority is active", "The token may be able to mint more supply.");
      score += 16;
    }

    if (summary.freezeAuthority) {
      addFlag(flags, "high", "Freeze authority is active", "The token may be able to freeze holder accounts.");
      score += 16;
    }

    if (lpLockedPct != null) {
      facts.push({
        label: "LP locked",
        value: `${lpLockedPct.toFixed(1)}%`
      });
      if (lpLockedPct < 20) {
        addFlag(flags, "critical", "Liquidity is not locked", `${lpLockedPct.toFixed(1)}% of LP is reported locked.`);
        score += 26;
      } else if (lpLockedPct < 60) {
        addFlag(flags, "moderate", "Partial LP lock", `${lpLockedPct.toFixed(1)}% of LP is reported locked.`);
        score += 10;
      }
    }

    if (topHoldersPct != null) {
      facts.push({
        label: "Top holders",
        value: `${topHoldersPct.toFixed(1)}%`
      });
      if (topHoldersPct > 70) {
        addFlag(flags, "high", "Holder concentration", `Top holders control ${topHoldersPct.toFixed(1)}% of supply.`);
        score += 16;
      } else if (topHoldersPct > 40) {
        addFlag(flags, "moderate", "Concentrated holders", `Top holders control ${topHoldersPct.toFixed(1)}% of supply.`);
        score += 8;
      }
    }
  } else {
    addFlag(flags, "moderate", "Creator scan unavailable", rugcheck.reason || "No creator/authority source was available for this token.");
    score += candidate.chainType === "solana" ? 10 : 4;
    facts.push({
      label: "Creator check",
      value: candidate.chainType === "solana" ? "Unavailable" : "DEX-only"
    });
  }

  const uniqueFlags = dedupeFlags(flags);
  const boundedScore = clamp(score, 0, 100);
  const level = riskLevelFromScore(boundedScore, uniqueFlags);
  const token = tokenSummary(candidate, dex.pair);
  const links = buildLinks(candidate, dex.pair);

  if (!uniqueFlags.length) {
    addFlag(uniqueFlags, "low", "No major red flags found", "Rugscope did not find obvious liquidity, age, holder, or authority warnings from available sources.");
  }

  return {
    address: candidate.address,
    chainType: candidate.chainType,
    chainId: dex.pair?.chainId || candidate.chainId || "",
    confidence: candidate.score,
    detectedFrom: candidate.sources || [],
    page,
    token,
    level,
    score: boundedScore,
    label: RISK_META[level].label,
    flags: uniqueFlags.slice(0, 12),
    facts: dedupeFacts(facts).slice(0, 8),
    dex: {
      ok: dex.ok,
      source: dex.source,
      pair: simplifyPair(dex.pair),
      errors: dex.errors || []
    },
    rugcheck: {
      ok: rugcheck.ok,
      source: rugcheck.source,
      reason: rugcheck.reason || "",
      usedFullReport: Boolean(rugcheck.usedFullReport)
    },
    links,
    creatorWallet,
    chart: null,
    walletMatches: [],
    scannedAt: Date.now()
  };
}

function buildUnknownResult(candidate, page, reason) {
  return {
    address: candidate?.address || "",
    chainType: candidate?.chainType || "unknown",
    confidence: candidate?.score || 0,
    page,
    token: {
      name: "Unknown token",
      symbol: "",
      displayAddress: shortenAddress(candidate?.address || "")
    },
    level: "unknown",
    score: 0,
    label: "Unknown",
    flags: [
      {
        level: "moderate",
        title: "Scan unavailable",
        detail: reason
      }
    ],
    facts: [],
    dex: {
      ok: false,
      errors: [reason]
    },
    rugcheck: {
      ok: false,
      reason
    },
    links: {},
    creatorWallet: null,
    chart: null,
    walletMatches: [],
    scannedAt: Date.now()
  };
}

async function enrichResultWithMarketData(result, options = {}) {
  if (!result?.dex?.pair?.pairAddress) {
    return {
      ...result,
      chart: null,
      walletMatches: result?.walletMatches || []
    };
  }

  const trackedWallets = await getTrackedWallets();
  const market = await fetchWalletTradeData(result, trackedWallets);
  const enriched = {
    ...result,
    chart: null,
    walletMatches: market.walletMatches,
    walletTracker: {
      trackedCount: trackedWallets.filter((wallet) => wallet.enabled !== false).length,
      updatedAt: Date.now(),
      errors: market.errors || []
    }
  };

  if (options.notify) {
    await alertNewWalletMatches(enriched.walletMatches, options.page || result.page);
  }

  return enriched;
}

async function fetchWalletTradeData(result, trackedWallets) {
  const pair = result?.dex?.pair;
  const network = geckoNetworkForChain(pair?.chainId || result.chainId);
  const errors = [];
  const chainType = result.chainType === "solana" ? "solana" : "evm";
  const watched = buildWatchedWallets(result, trackedWallets).filter((wallet) => wallet.chainType === chainType);

  if (!watched.length) {
    return {
      walletMatches: [],
      errors
    };
  }

  if (!network || !pair?.pairAddress) {
    return {
      walletMatches: [],
      errors: ["Wallet trade data is unavailable for this chain or pair."]
    };
  }

  const poolAddress = pair.pairAddress;
  let trades = null;

  try {
    trades = await fetchJson(`https://api.geckoterminal.com/api/v2/networks/${encodeURIComponent(network)}/pools/${encodeURIComponent(poolAddress)}/trades`);
  } catch (error) {
    errors.push(`Trade feed unavailable: ${error.message}`);
  }

  const walletMatches = parseWalletTradeMatches({
    trades,
    result,
    trackedWallets
  });

  return {
    walletMatches,
    errors
  };
}

function tradePriceUsd(attrs = {}) {
  const kind = normalizeTradeKind(attrs.kind);
  return numberOrNull(kind === "sell" ? attrs.price_from_in_usd : attrs.price_to_in_usd)
    ?? numberOrNull(attrs.price_to_in_usd)
    ?? numberOrNull(attrs.price_from_in_usd);
}

function parseWalletTradeMatches({ trades, result, trackedWallets }) {
  const tradeRows = Array.isArray(trades?.data) ? trades.data : [];
  const chainType = result.chainType === "solana" ? "solana" : "evm";
  const watched = buildWatchedWallets(result, trackedWallets).filter((wallet) => wallet.chainType === chainType);
  const watchedMap = new Map(watched.map((wallet) => [wallet.compareKey, wallet]));

  if (!tradeRows.length || !watchedMap.size) {
    return [];
  }

  const matches = [];
  for (const trade of tradeRows) {
    const attrs = trade?.attributes || {};
    const fromAddress = attrs.tx_from_address || "";
    const wallet = watchedMap.get(walletCompareKey(fromAddress, chainType));

    if (!wallet) {
      continue;
    }

    const timestamp = Math.floor(Date.parse(attrs.block_timestamp || "") / 1000);
    if (!Number.isFinite(timestamp)) {
      continue;
    }

    const kind = normalizeTradeKind(attrs.kind);
    const tokenAmount = kind === "sell" ? attrs.from_token_amount : attrs.to_token_amount;
    const priceUsd = tradePriceUsd(attrs);
    const volumeUsd = numberOrNull(attrs.volume_in_usd);
    const txHash = attrs.tx_hash || "";

    matches.push({
      id: `${wallet.id}:${txHash || trade.id}:${timestamp}`,
      walletId: wallet.id,
      walletAddress: wallet.address,
      walletLabel: wallet.label,
      walletCreatedAt: wallet.createdAt,
      isDev: Boolean(wallet.isDev),
      kind,
      timestamp,
      priceUsd,
      volumeUsd,
      amount: cleanAmount(tokenAmount),
      tokenSymbol: result.token?.symbol || "",
      txHash,
      txUrl: buildTxUrl(result.chainId || result.dex?.pair?.chainId, txHash),
      blockNumber: attrs.block_number || null,
      fromTokenAddress: attrs.from_token_address || "",
      toTokenAddress: attrs.to_token_address || "",
      source: "GeckoTerminal"
    });
  }

  return matches
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_WALLET_MATCHES);
}

function buildWatchedWallets(result, trackedWallets) {
  const watched = trackedWallets
    .filter((wallet) => wallet.enabled !== false)
    .map((wallet) => ({
      ...wallet,
      compareKey: walletCompareKey(wallet.address, wallet.chainType)
    }));

  const creator = normalizeWalletAddress(result.creatorWallet || "");
  if (creator) {
    const existing = watched.find((wallet) => wallet.compareKey === walletCompareKey(creator.address, creator.chainType));
    if (existing) {
      existing.isDev = true;
      if (!/dev|creator/i.test(existing.label)) {
        existing.label = `${existing.label} / Dev`;
      }
    } else {
      watched.push({
        id: `dev:${creator.id}`,
        address: creator.address,
        chainType: creator.chainType,
        label: "Creator/Dev",
        enabled: true,
        createdAt: 0,
        isDev: true,
        compareKey: walletCompareKey(creator.address, creator.chainType)
      });
    }
  }

  return watched;
}

async function pollTrackedWallets(options = {}) {
  ensureWalletPollAlarm();
  const wallets = await getTrackedWallets();
  if (!wallets.some((wallet) => wallet.enabled !== false)) {
    return { updated: 0 };
  }

  const walletWideAlerts = await pollWalletWideBuys(wallets, options);

  const { rugscopeTabStates = {} } = await chrome.storage.local.get("rugscopeTabStates");
  const entries = Object.entries(rugscopeTabStates)
    .filter(([, state]) => state?.result?.dex?.pair?.pairAddress)
    .slice(0, 8);
  let updated = 0;

  for (const [tabId, state] of entries) {
    const result = await enrichResultWithMarketData(state.result, {
      notify: options.notify,
      page: state.page
    });
    const nextState = {
      ...state,
      result,
      updatedAt: Date.now()
    };
    rugscopeTabStates[tabId] = nextState;
    updated += 1;
    sendScanResultToTab(Number(tabId), nextState);
  }

  await chrome.storage.local.set({ rugscopeTabStates });
  return {
    updated,
    walletWideAlerts
  };
}

function ensureWalletPollAlarm() {
  chrome.alarms.create(WALLET_POLL_ALARM, {
    periodInMinutes: WALLET_POLL_PERIOD_MINUTES
  });
}

async function getTrackedWallets() {
  const { rugscopeTrackedWallets = [] } = await chrome.storage.local.get("rugscopeTrackedWallets");
  return Array.isArray(rugscopeTrackedWallets)
    ? rugscopeTrackedWallets.filter((wallet) => normalizeWalletAddress(wallet?.address))
    : [];
}

async function addTrackedWallet(input = {}) {
  const normalized = normalizeWalletAddress(input.address || "");
  if (!normalized) {
    throw new Error("Enter a valid EVM or Solana wallet address.");
  }

  const wallets = await getTrackedWallets();
  const label = cleanText(input.label || "").slice(0, 28) || defaultWalletLabel(normalized.address);
  const existingIndex = wallets.findIndex((wallet) => wallet.id === normalized.id);
  const nextWallet = {
    id: normalized.id,
    address: normalized.address,
    chainType: normalized.chainType,
    label,
    enabled: true,
    createdAt: wallets[existingIndex]?.createdAt || Date.now()
  };

  const isNewWallet = existingIndex < 0;

  if (existingIndex >= 0) {
    wallets[existingIndex] = {
      ...wallets[existingIndex],
      ...nextWallet
    };
  } else {
    wallets.unshift(nextWallet);
  }

  const trimmed = wallets.slice(0, MAX_TRACKED_WALLETS);
  await chrome.storage.local.set({ rugscopeTrackedWallets: trimmed });
  if (isNewWallet) {
    await seedWalletWideSeen(nextWallet);
  }
  ensureWalletPollAlarm();
  return trimmed;
}

async function removeTrackedWallet(idOrAddress = "") {
  const wallets = await getTrackedWallets();
  const normalized = normalizeWalletAddress(idOrAddress);
  const key = normalized?.id || String(idOrAddress);
  const filtered = wallets.filter((wallet) => wallet.id !== key && wallet.address !== idOrAddress);
  await chrome.storage.local.set({ rugscopeTrackedWallets: filtered });
  return filtered;
}

async function pollWalletWideBuys(wallets, options = {}) {
  const solanaWallets = wallets.filter((wallet) => wallet.enabled !== false && wallet.chainType === "solana");
  if (!solanaWallets.length) {
    return 0;
  }

  const { rugscopeSeenWalletWideTxs = {} } = await chrome.storage.local.get("rugscopeSeenWalletWideTxs");
  const allAlerts = [];

  for (const wallet of solanaWallets) {
    const alerts = await fetchSolanaWalletBuyAlerts(wallet, rugscopeSeenWalletWideTxs).catch(() => []);
    allAlerts.push(...alerts);
  }

  if (!allAlerts.length) {
    trimRecord(rugscopeSeenWalletWideTxs, 1000);
    await chrome.storage.local.set({ rugscopeSeenWalletWideTxs });
    return 0;
  }

  await storeWalletAlerts(allAlerts, {
    title: "Wallet-wide tracker",
    host: "solana"
  });

  if (options.notify) {
    notifyStoredWalletAlerts(allAlerts);
  }

  trimRecord(rugscopeSeenWalletWideTxs, 1000);
  await chrome.storage.local.set({ rugscopeSeenWalletWideTxs });
  return allAlerts.length;
}

async function fetchSolanaWalletBuyAlerts(wallet, seenRecord) {
  const signatures = await fetchSolanaSignatures(wallet.address);
  const unseen = signatures
    .filter((item) => item?.signature && !seenRecord[walletWideSeenKey(wallet.id, item.signature)])
    .sort((a, b) => (a.blockTime || 0) - (b.blockTime || 0));
  const alerts = [];

  for (const item of unseen) {
    const key = walletWideSeenKey(wallet.id, item.signature);
    seenRecord[key] = { updatedAt: Date.now() };

    const txTime = (item.blockTime || 0) * 1000;
    if (wallet.createdAt && txTime && txTime < wallet.createdAt - 60000) {
      continue;
    }

    const tx = await fetchSolanaTransaction(item.signature).catch(() => null);
    const buys = parseSolanaWalletBuysFromTransaction(tx, wallet);
    for (const buy of buys) {
      const meta = await fetchSolanaTokenMeta(buy.mint).catch(() => null);
      const tokenSymbol = meta?.symbol || buy.mint.slice(0, 6);
      const priceUsd = numberOrNull(meta?.priceUsd);
      const volumeUsd = priceUsd == null ? null : priceUsd * buy.amount;

      alerts.push({
        id: `${wallet.id}:${item.signature}:${buy.mint}`,
        walletId: wallet.id,
        walletLabel: wallet.label || defaultWalletLabel(wallet.address),
        walletAddress: wallet.address,
        isDev: /dev|creator/i.test(wallet.label || ""),
        kind: "buy",
        tokenSymbol,
        tokenAddress: buy.mint,
        amount: cleanAmount(buy.amount),
        volumeUsd,
        priceUsd,
        txHash: item.signature,
        txUrl: buildTxUrl("solana", item.signature),
        timestamp: item.blockTime || Math.floor(Date.now() / 1000),
        tokenTitle: meta?.name || tokenSymbol,
        pageHost: "wallet-wide Solana tracker",
        createdAt: Date.now()
      });
    }
  }

  return alerts;
}

function parseSolanaWalletBuysFromTransaction(tx, wallet) {
  const meta = tx?.meta;
  const message = tx?.transaction?.message;
  if (!meta || !message) {
    return [];
  }

  const tokenDiffs = solanaTokenDiffsForWallet(meta, wallet.address);
  const walletIndex = solanaWalletAccountIndex(message, wallet.address);
  const lamportDiff = walletIndex == null
    ? 0
    : (Number(meta.postBalances?.[walletIndex]) || 0) - (Number(meta.preBalances?.[walletIndex]) || 0);
  const spentToken = tokenDiffs.some((diff) => diff.delta < -tokenDust(diff.decimals));
  const spentSol = lamportDiff < -1000000;
  const likelySwap = spentToken || spentSol;

  if (!likelySwap) {
    return [];
  }

  return tokenDiffs
    .filter((diff) => diff.delta > tokenDust(diff.decimals))
    .map((diff) => ({
      mint: diff.mint,
      amount: diff.delta,
      decimals: diff.decimals
    }));
}

function solanaTokenDiffsForWallet(meta, walletAddress) {
  const balances = new Map();
  const addBalance = (entry, side) => {
    if (!entry?.mint || entry.owner !== walletAddress) {
      return;
    }

    const existing = balances.get(entry.mint) || {
      mint: entry.mint,
      decimals: entry.uiTokenAmount?.decimals || 0,
      pre: 0,
      post: 0
    };
    existing[side] += tokenUiAmount(entry.uiTokenAmount);
    existing.decimals = entry.uiTokenAmount?.decimals ?? existing.decimals;
    balances.set(entry.mint, existing);
  };

  for (const entry of meta.preTokenBalances || []) addBalance(entry, "pre");
  for (const entry of meta.postTokenBalances || []) addBalance(entry, "post");

  return Array.from(balances.values()).map((entry) => ({
    mint: entry.mint,
    decimals: entry.decimals,
    delta: entry.post - entry.pre
  }));
}

function solanaWalletAccountIndex(message, walletAddress) {
  const keys = message.accountKeys || [];
  const index = keys.findIndex((key) => {
    const pubkey = typeof key === "string" ? key : key?.pubkey;
    return pubkey === walletAddress;
  });
  return index >= 0 ? index : null;
}

function tokenUiAmount(uiTokenAmount = {}) {
  const value = Number(uiTokenAmount.uiAmountString ?? uiTokenAmount.uiAmount ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function tokenDust(decimals = 0) {
  return decimals > 0 ? 1 / Math.pow(10, Math.min(decimals, 9)) : 0;
}

async function fetchSolanaSignatures(address) {
  return fetchSolanaRpc("getSignaturesForAddress", [
    address,
    {
      limit: MAX_WALLET_WIDE_SIGNATURES
    }
  ]);
}

async function fetchSolanaTransaction(signature) {
  return fetchSolanaRpc("getTransaction", [
    signature,
    {
      encoding: "jsonParsed",
      maxSupportedTransactionVersion: 0
    }
  ]);
}

async function fetchSolanaRpc(method, params) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `rugscope-${Date.now()}`,
        method,
        params
      })
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`.trim());
    }

    const payload = await response.json();
    if (payload.error) {
      throw new Error(payload.error.message || "Solana RPC error");
    }
    return payload.result;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchSolanaTokenMeta(mint) {
  const pairs = await fetchJson(`https://api.dexscreener.com/tokens/v1/solana/${encodeURIComponent(mint)}`);
  const pair = chooseBestPair(Array.isArray(pairs) ? pairs : [], mint, "solana", "solana");
  const base = pair?.baseToken?.address === mint ? pair.baseToken : pair?.quoteToken?.address === mint ? pair.quoteToken : pair?.baseToken;
  return {
    name: cleanText(base?.name || ""),
    symbol: cleanText(base?.symbol || ""),
    priceUsd: pair?.priceUsd || "",
    url: pair?.url || ""
  };
}

function walletWideSeenKey(walletId, signature) {
  return `wide:${walletId}:${signature}`;
}

async function seedWalletWideSeen(wallet) {
  if (wallet.chainType !== "solana") {
    return;
  }

  const signatures = await fetchSolanaSignatures(wallet.address).catch(() => []);
  if (!signatures.length) {
    return;
  }

  const { rugscopeSeenWalletWideTxs = {} } = await chrome.storage.local.get("rugscopeSeenWalletWideTxs");
  for (const item of signatures) {
    if (item?.signature) {
      rugscopeSeenWalletWideTxs[walletWideSeenKey(wallet.id, item.signature)] = { updatedAt: Date.now() };
    }
  }
  trimRecord(rugscopeSeenWalletWideTxs, 1000);
  await chrome.storage.local.set({ rugscopeSeenWalletWideTxs });
}

async function alertNewWalletMatches(matches, page = {}) {
  if (!Array.isArray(matches) || !matches.length) {
    return;
  }

  const { rugscopeSeenWalletTxs = {} } = await chrome.storage.local.get("rugscopeSeenWalletTxs");
  const now = Date.now();
  const freshMatches = matches.filter((match) => {
    if (!match?.id || rugscopeSeenWalletTxs[match.id]) {
      return false;
    }

    const tradeTime = match.timestamp * 1000;
    const wasTrackedBeforeTrade = !match.walletCreatedAt || tradeTime >= match.walletCreatedAt - 60000;
    const isRecent = now - tradeTime <= 7 * 60 * 1000;
    return wasTrackedBeforeTrade && isRecent;
  });

  if (freshMatches.length) {
    await storeWalletAlerts(freshMatches, page);
  }

  for (const match of freshMatches) {
    rugscopeSeenWalletTxs[match.id] = { updatedAt: now };
  }

  for (const match of freshMatches.slice(0, 5)) {
    const action = match.kind === "sell" ? "sold" : "bought";
    const amount = [match.amount, match.tokenSymbol].filter(Boolean).join(" ");
    const usd = match.volumeUsd == null ? "" : ` (${formatCompactUsd(match.volumeUsd)})`;
    createWalletNotification(`rugscope:${match.id}`, {
      title: `${match.walletLabel} ${action} ${page?.title || "a tracked token"}`,
      message: `${amount || "Trade"}${usd} on ${page?.host || "the current pool"}.`
    });
  }

  trimRecord(rugscopeSeenWalletTxs, 500);
  await chrome.storage.local.set({ rugscopeSeenWalletTxs });
}

async function storeWalletAlerts(matches, page = {}) {
  const { rugscopeWalletAlerts = [] } = await chrome.storage.local.get("rugscopeWalletAlerts");
  const existing = Array.isArray(rugscopeWalletAlerts) ? rugscopeWalletAlerts : [];
  const existingIds = new Set(existing.map((alert) => alert.id));
  const nextAlerts = matches
    .filter((match) => {
      if (!match?.id || existingIds.has(match.id)) {
        return false;
      }
      existingIds.add(match.id);
      return true;
    })
    .map((match) => ({
      id: match.id,
      walletId: match.walletId,
      walletLabel: match.walletLabel || "Tracked wallet",
      walletAddress: match.walletAddress || "",
      isDev: Boolean(match.isDev),
      kind: match.kind || "buy",
      tokenSymbol: match.tokenSymbol || "",
      amount: match.amount || "",
      volumeUsd: match.volumeUsd ?? null,
      priceUsd: match.priceUsd ?? null,
      txHash: match.txHash || "",
      txUrl: match.txUrl || "",
      timestamp: match.timestamp || Math.floor(Date.now() / 1000),
      tokenTitle: match.tokenTitle || page?.title || "",
      pageHost: match.pageHost || page?.host || "",
      createdAt: Date.now()
    }));

  if (!nextAlerts.length) {
    return existing;
  }

  const alerts = nextAlerts.concat(existing)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, MAX_STORED_WALLET_ALERTS);
  await chrome.storage.local.set({ rugscopeWalletAlerts: alerts });
  return alerts;
}

function notifyStoredWalletAlerts(alerts) {
  for (const alert of alerts.slice(0, 5)) {
    const action = alert.kind === "sell" ? "sold" : "bought";
    const amount = [alert.amount, alert.tokenSymbol].filter(Boolean).join(" ");
    const usd = alert.volumeUsd == null ? "" : ` (${formatCompactUsd(alert.volumeUsd)})`;
    createWalletNotification(`rugscope:${alert.id}`, {
      title: `${alert.walletLabel} ${action} ${alert.tokenTitle || alert.tokenSymbol || "a token"}`,
      message: `${amount || "Trade"}${usd} from wallet-wide tracking.`
    });
  }
}

function createWalletNotification(id, options) {
  if (!chrome.notifications?.create) {
    return;
  }

  chrome.notifications.create(id, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("assets/icon128.png"),
    title: options.title || "Rugscope wallet alert",
    message: options.message || "A tracked wallet matched recent activity."
  }).catch(() => {});
}

async function getWalletAlerts() {
  const { rugscopeWalletAlerts = [] } = await chrome.storage.local.get("rugscopeWalletAlerts");
  return Array.isArray(rugscopeWalletAlerts) ? rugscopeWalletAlerts : [];
}

async function clearWalletAlerts() {
  await chrome.storage.local.set({ rugscopeWalletAlerts: [] });
}

function normalizeWalletAddress(address) {
  const value = String(address || "").trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(value)) {
    const lower = value.toLowerCase();
    return {
      id: `evm:${lower}`,
      address: value,
      chainType: "evm"
    };
  }

  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) {
    return {
      id: `solana:${value}`,
      address: value,
      chainType: "solana"
    };
  }

  return null;
}

function walletCompareKey(address, chainType) {
  return chainType === "evm" ? String(address || "").toLowerCase() : String(address || "");
}

function defaultWalletLabel(address) {
  return `Wallet ${shortenAddress(address)}`;
}

function normalizeTradeKind(kind) {
  return String(kind || "").toLowerCase() === "sell" ? "sell" : "buy";
}

function cleanAmount(value) {
  const number = numberOrNull(value);
  if (number == null) {
    return cleanText(value || "");
  }

  if (number >= 1000000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2
    }).format(number);
  }

  if (number >= 1) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 4
    }).format(number);
  }

  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 4
  }).format(number);
}

function geckoNetworkForChain(chainId = "") {
  return GECKO_NETWORKS[String(chainId).toLowerCase()] || "";
}

function buildTxUrl(chainId = "", txHash = "") {
  if (!txHash) {
    return "";
  }

  const chain = String(chainId || "").toLowerCase();
  if (chain === "solana") return `https://solscan.io/tx/${txHash}`;
  if (chain === "bsc") return `https://bscscan.com/tx/${txHash}`;
  if (chain === "base") return `https://basescan.org/tx/${txHash}`;
  if (chain === "polygon") return `https://polygonscan.com/tx/${txHash}`;
  if (chain === "arbitrum") return `https://arbiscan.io/tx/${txHash}`;
  if (chain === "optimism") return `https://optimistic.etherscan.io/tx/${txHash}`;
  if (chain === "avalanche") return `https://snowtrace.io/tx/${txHash}`;
  if (chain === "fantom") return `https://ftmscan.com/tx/${txHash}`;
  if (chain === "linea") return `https://lineascan.build/tx/${txHash}`;
  if (chain === "scroll") return `https://scrollscan.com/tx/${txHash}`;
  return `https://etherscan.io/tx/${txHash}`;
}

function extractCreatorWallet(value, depth = 0) {
  if (!value || depth > 3) {
    return null;
  }

  if (typeof value === "string") {
    return normalizeWalletAddress(value)?.address || null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractCreatorWallet(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (typeof value !== "object") {
    return null;
  }

  const priorityKeys = [
    "creator",
    "creatorAddress",
    "creator_address",
    "tokenCreator",
    "token_creator",
    "deployer",
    "deployerAddress",
    "deployer_address",
    "owner",
    "ownerAddress",
    "owner_address"
  ];

  for (const key of priorityKeys) {
    const found = extractCreatorWallet(value[key], depth + 1);
    if (found) return found;
  }

  for (const [key, child] of Object.entries(value)) {
    if (!/creator|deployer|owner/i.test(key)) {
      continue;
    }
    const found = extractCreatorWallet(child, depth + 1);
    if (found) return found;
  }

  return null;
}

async function updateLiquiditySnapshot(candidate, pair) {
  const liquidityUsd = numberOrNull(pair?.liquidity?.usd);
  if (liquidityUsd == null) {
    return null;
  }

  const key = `${candidate.chainType}:${canonicalAddress(candidate.address, candidate.chainType)}`;
  const { rugscopeLiquiditySnapshots = {} } = await chrome.storage.local.get("rugscopeLiquiditySnapshots");
  const previous = rugscopeLiquiditySnapshots[key];
  const next = {
    liquidityUsd,
    chainId: pair.chainId || candidate.chainId || "",
    pairAddress: pair.pairAddress || "",
    updatedAt: Date.now()
  };

  rugscopeLiquiditySnapshots[key] = next;
  trimRecord(rugscopeLiquiditySnapshots, 200);
  await chrome.storage.local.set({ rugscopeLiquiditySnapshots });

  if (!previous?.liquidityUsd || previous.liquidityUsd <= liquidityUsd) {
    return {
      previousUsd: previous?.liquidityUsd || null,
      currentUsd: liquidityUsd,
      dropPct: 0,
      dropUsd: 0
    };
  }

  const dropUsd = previous.liquidityUsd - liquidityUsd;
  return {
    previousUsd: previous.liquidityUsd,
    currentUsd: liquidityUsd,
    dropUsd,
    dropPct: (dropUsd / previous.liquidityUsd) * 100,
    previousAt: previous.updatedAt
  };
}

async function getCachedScan(cacheKey) {
  const { rugscopeScanCache = {} } = await chrome.storage.local.get("rugscopeScanCache");
  const cached = rugscopeScanCache[cacheKey];
  if (!cached || Date.now() - cached.cachedAt > SCAN_CACHE_TTL_MS) {
    return null;
  }
  return cached.result;
}

async function setCachedScan(cacheKey, result) {
  const { rugscopeScanCache = {} } = await chrome.storage.local.get("rugscopeScanCache");
  rugscopeScanCache[cacheKey] = {
    cachedAt: Date.now(),
    result
  };
  trimRecord(rugscopeScanCache, 80);
  await chrome.storage.local.set({ rugscopeScanCache });
}

function normalizeCandidates(candidates) {
  const map = new Map();
  for (const raw of candidates) {
    if (!raw?.address) {
      continue;
    }
    const chainType = raw.chainType === "evm" ? "evm" : raw.chainType === "solana" ? "solana" : "unknown";
    if (chainType === "unknown") {
      continue;
    }
    const address = raw.address.trim();
    const key = `${chainType}:${canonicalAddress(address, chainType)}`;
    const existing = map.get(key);
    const score = clamp(Number(raw.score) || 0, 0, 100);
    const sources = Array.isArray(raw.sources) ? raw.sources.slice(0, 5) : raw.source ? [String(raw.source)] : [];
    const chainId = raw.chainId ? String(raw.chainId) : "";

    if (!existing || score > existing.score) {
      map.set(key, {
        address,
        chainType,
        chainId,
        score,
        sources
      });
    } else {
      existing.sources = Array.from(new Set(existing.sources.concat(sources))).slice(0, 5);
      existing.score = Math.max(existing.score, score);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.score - a.score).slice(0, 10);
}

function getPageHints(page) {
  const url = `${page?.url || ""}`.toLowerCase();
  const host = `${page?.host || ""}`.toLowerCase();
  const pathParts = safePathParts(page?.url);
  const text = [host, ...pathParts].join(" ");

  for (const [alias, chainId] of Object.entries(CHAIN_ALIASES)) {
    if (text.includes(alias)) {
      return { chainId };
    }
  }

  if (url.includes("pump.fun") || url.includes("axiom.trade")) {
    return { chainId: "solana" };
  }

  return { chainId: "" };
}

function chooseBestPair(pairs, address, chainType, chainHint) {
  if (!pairs.length) {
    return null;
  }

  const canonical = canonicalAddress(address, chainType);
  return pairs
    .map((pair) => {
      const baseMatch = canonicalAddress(pair?.baseToken?.address || "", chainType) === canonical;
      const quoteMatch = canonicalAddress(pair?.quoteToken?.address || "", chainType) === canonical;
      const pairMatch = canonicalAddress(pair?.pairAddress || "", chainType) === canonical;
      const chainMatch = chainHint && pair?.chainId === chainHint;
      const liquidity = numberOrNull(pair?.liquidity?.usd) || 0;
      const volume = numberOrNull(pair?.volume?.h24) || 0;
      let score = liquidity + volume * 0.1;

      if (baseMatch) score += 1000000000;
      if (quoteMatch) score += 100000000;
      if (pairMatch) score += 10000000;
      if (chainMatch) score += 1000000;

      return { pair, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.pair || pairs[0];
}

function dedupePairs(pairs) {
  const map = new Map();
  for (const pair of pairs) {
    if (!pair) continue;
    const key = `${pair.chainId || ""}:${pair.pairAddress || ""}:${pair.baseToken?.address || ""}`;
    if (!map.has(key)) {
      map.set(key, pair);
    }
  }
  return Array.from(map.values());
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`.trim());
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function saveTabState(tabId, state) {
  const { rugscopeTabStates = {} } = await chrome.storage.local.get("rugscopeTabStates");
  rugscopeTabStates[String(tabId)] = state;
  trimRecord(rugscopeTabStates, MAX_STORED_TAB_STATES);
  await chrome.storage.local.set({ rugscopeTabStates });
}

async function getTabState(tabId) {
  const { rugscopeTabStates = {} } = await chrome.storage.local.get("rugscopeTabStates");
  return rugscopeTabStates[String(tabId)] || null;
}

async function updateBadge(tabId, level, explicitText) {
  const meta = RISK_META[level] || RISK_META.unknown;
  await chrome.action.setBadgeBackgroundColor({ tabId, color: meta.color });
  await chrome.action.setBadgeTextColor?.({ tabId, color: "#08050d" });
  await chrome.action.setBadgeText({ tabId, text: explicitText ?? meta.badge });
}

function requestContentScan(tabId, force = false) {
  chrome.tabs.sendMessage(tabId, {
    type: "rugscope:request-scan",
    force
  }).catch(() => {});
}

function sendScanResultToTab(tabId, state) {
  chrome.tabs.sendMessage(tabId, {
    type: "rugscope:scan-result",
    state
  }).catch(() => {});
}

function tokenSummary(candidate, pair) {
  const base = pair?.baseToken;
  const quote = pair?.quoteToken;
  const canonical = canonicalAddress(candidate.address, candidate.chainType);
  const token = canonicalAddress(base?.address || "", candidate.chainType) === canonical ? base : quote || base;
  return {
    name: cleanText(token?.name || "Unknown token"),
    symbol: cleanText(token?.symbol || ""),
    displayAddress: shortenAddress(candidate.address),
    priceUsd: pair?.priceUsd || "",
    liquidityUsd: numberOrNull(pair?.liquidity?.usd),
    pairAddress: pair?.pairAddress || "",
    dexId: pair?.dexId || "",
    chainId: pair?.chainId || candidate.chainId || ""
  };
}

function simplifyPair(pair) {
  if (!pair) {
    return null;
  }
  return {
    chainId: pair.chainId || "",
    dexId: pair.dexId || "",
    url: pair.url || "",
    pairAddress: pair.pairAddress || "",
    baseToken: pair.baseToken || null,
    quoteToken: pair.quoteToken || null,
    priceUsd: pair.priceUsd || "",
    txns: pair.txns || null,
    volume: pair.volume || null,
    priceChange: pair.priceChange || null,
    liquidity: pair.liquidity || null,
    fdv: pair.fdv || null,
    marketCap: pair.marketCap || null,
    pairCreatedAt: pair.pairCreatedAt || null
  };
}

function buildLinks(candidate, pair) {
  const links = {};
  if (pair?.url) {
    links.dex = pair.url;
  } else if (candidate.chainId) {
    links.dex = `https://dexscreener.com/${candidate.chainId}/${candidate.address}`;
  }
  return links;
}

function normalizeRugcheckScore(summary) {
  const normalized = numberOrNull(summary.score_normalised ?? summary.scoreNormalized ?? summary.normalizedScore);
  if (normalized != null) {
    return clamp(normalized, 0, 100);
  }

  const raw = numberOrNull(summary.score);
  if (raw == null) {
    return null;
  }

  if (raw <= 100) {
    return clamp(raw, 0, 100);
  }

  return clamp((raw / 1000) * 100, 0, 100);
}

function creatorSignal(summary, risks) {
  const riskText = risks.map((risk) => `${risk.name || ""} ${risk.description || ""}`.toLowerCase()).join(" ");
  if (summary.mintAuthority || summary.freezeAuthority) {
    return "Authority risk";
  }
  if (riskText.includes("creator") || riskText.includes("insider") || riskText.includes("ownership") || riskText.includes("single holder")) {
    return "Suspicious";
  }
  return "No major flag";
}

function normalizeRiskLevel(level) {
  const value = `${level || ""}`.toLowerCase();
  if (value.includes("danger") || value.includes("critical") || value.includes("high")) {
    return "high";
  }
  if (value.includes("warn") || value.includes("medium") || value.includes("moderate")) {
    return "moderate";
  }
  return "moderate";
}

function riskLevelFromScore(score, flags) {
  if (flags.some((flag) => flag.level === "critical") || score >= 80) {
    return "critical";
  }
  if (flags.some((flag) => flag.level === "high") || score >= 60) {
    return "high";
  }
  if (score >= 35) {
    return "moderate";
  }
  return "low";
}

function addFlag(flags, level, title, detail) {
  flags.push({
    level,
    title: cleanText(title),
    detail: cleanText(detail)
  });
}

function dedupeFlags(flags) {
  const seen = new Set();
  return flags.filter((flag) => {
    const key = `${flag.level}:${flag.title}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeFacts(facts) {
  const seen = new Set();
  return facts.filter((fact) => {
    const key = fact.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return Boolean(fact.value);
  });
}

function formatCompactUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: value < 10000 ? 1 : 0
  }).format(value);
}

function formatAge(hours) {
  if (hours < 1) {
    return `${Math.max(1, Math.round(hours * 60))}m`;
  }
  if (hours < 48) {
    return `${Math.round(hours)}h`;
  }
  return `${Math.round(hours / 24)}d`;
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function canonicalAddress(address, chainType) {
  return chainType === "evm" ? String(address || "").toLowerCase() : String(address || "");
}

function shortenAddress(address) {
  if (!address) return "";
  return address.length > 14 ? `${address.slice(0, 6)}...${address.slice(-6)}` : address;
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 220);
}

function sanitizePage(page = {}) {
  const url = String(page.url || "").slice(0, 1200);
  return {
    url,
    title: cleanText(page.title || ""),
    host: cleanText(page.host || safeHost(url))
  };
}

function safeHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

function safePathParts(url) {
  try {
    return new URL(url).pathname.split("/").filter(Boolean);
  } catch {
    return [];
  }
}

function isDexScreenerPage(host = "") {
  return String(host).toLowerCase().includes("dexscreener.com");
}

function trimRecord(record, maxItems) {
  const entries = Object.entries(record);
  if (entries.length <= maxItems) {
    return;
  }
  entries
    .sort((a, b) => {
      const aTime = a[1]?.updatedAt || a[1]?.cachedAt || 0;
      const bTime = b[1]?.updatedAt || b[1]?.cachedAt || 0;
      return aTime - bTime;
    })
    .slice(0, entries.length - maxItems)
    .forEach(([key]) => delete record[key]);
}
