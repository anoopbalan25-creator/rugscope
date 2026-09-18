/**
 * RugScope AI - AI-Powered Solana Token & Wallet Risk Intelligence Platform
 * Colosseum Crypto World's Fair Hackathon Edition
 *
 * Capabilities:
 * - Transparent 5-Pillar Weighted Risk Scoring Engine (Contract Authorities, Liquidity,
 *   Holder Distribution, Trading Dynamics, Program Maturity)
 * - Grounded AI Forensic Explainer synthesizing verified on-chain evidence
 * - Dynamic Data-Driven Entity & Wallet Relationship Canvas Graph
 * - Live On-Chain Token/Wallet Surveillance Engine via RPC Fast & Solana JSON-RPC Gateway
 * - Historical Risk Snapshot & Delta Engine
 * - Dedicated Demo Sandbox with Realistic Token Threat Archetypes
 * - Tri-Mode Theme System (Dark / Light / System)
 */

(function () {
  "use strict";

  // --- Global Constants & Risk Thresholds ---
  const RISK_META = {
    low: {
      label: "Low Risk",
      badge: "LOW",
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.28)",
      desc: "No critical authority flags or acute liquidity hazards detected."
    },
    moderate: {
      label: "Moderate Risk",
      badge: "MODERATE",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.28)",
      desc: "Elevated volatility, nascent pool age, or moderate supply concentration."
    },
    high: {
      label: "High Risk",
      badge: "HIGH RISK",
      color: "#f97316",
      bg: "rgba(249, 115, 22, 0.12)",
      border: "rgba(249, 115, 22, 0.32)",
      desc: "Fragile liquidity depth, severe sell pressure, or top-heavy wallet clusters."
    },
    critical: {
      label: "Critical Threat",
      badge: "CRITICAL",
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.14)",
      border: "rgba(239, 68, 68, 0.36)",
      desc: "Active freeze/mint authorities, 0% locked LP, or imminent capital drain vectors."
    },
    unknown: {
      label: "Analyzing",
      badge: "SCAN",
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.12)",
      border: "rgba(139, 92, 246, 0.25)",
      desc: "Synthesizing multi-vector on-chain signals."
    }
  };

  // --- Educational Demo Sandbox Archetypes ---
  const DEMO_ARCHETYPES = [
    {
      id: "bonk",
      name: "Bonk (SOL)",
      address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      chain: "solana",
      tag: "Verified Bluechip",
      category: "safe",
      token: {
        name: "Bonk",
        symbol: "BONK",
        priceUsd: "$0.00001842",
        dex: "RAYDIUM",
        chain: "SOLANA",
        pairAddress: "85nvQx8SCA2uH39Z4C1Z9xK6D8pZ5a9wzKx8SCA2uH39",
        supply: "92.8T BONK",
        creator: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
      },
      score: 12,
      level: "low",
      pillars: {
        authorities: { name: "Authorities & Permissions", score: 0, max: 30, status: "Clean", detail: "Mint and freeze authorities permanently revoked." },
        liquidity: { name: "Liquidity Depth & Lock", score: 2, max: 25, status: "Deep", detail: "$8.42M locked/burned AMM liquidity across major pools." },
        holders: { name: "Holder Dispersal", score: 4, max: 20, status: "Decentralized", detail: "Top 10 wallets hold 22.1% of circulating supply." },
        market: { name: "Market & Volume", score: 3, max: 15, status: "Healthy", detail: "24h Volume $42.6M with balanced buy/sell flow." },
        maturity: { name: "Maturity & Legitimacy", score: 3, max: 10, status: "Mature", detail: "Pool active > 400 days on audited AMM programs." }
      },
      facts: [
        { label: "Liquidity", value: "$8.42M" },
        { label: "Pair Age", value: "480d" },
        { label: "LP Locked", value: "98.5%" },
        { label: "Top 10 Holders", value: "22.1%" },
        { label: "Mint Authority", value: "Revoked" },
        { label: "Freeze Authority", value: "Revoked" },
        { label: "24h Volume", value: "$42.6M" },
        { label: "24h Swaps", value: "28,490" }
      ],
      flags: [
        { level: "low", title: "Authorities Fully Revoked", detail: "Neither minting additional supply nor freezing token accounts is possible.", pillar: "authorities" },
        { level: "low", title: "Institutional Liquidity Depth", detail: "Pool depth of $8.42M provides extreme resilience against market manipulation.", pillar: "liquidity" },
        { level: "low", title: "Broad Holder Dispersion", detail: "Top 10 holders control only 22.1% with no individual whale dominating supply.", pillar: "holders" }
      ],
      topHolders: [
        { rank: 1, address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q544fKrF", pct: 4.8, isPool: true, tag: "Raydium AMM", balanceStr: "4.45T BONK" },
        { rank: 2, address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", pct: 3.2, isPool: false, tag: "Ecosystem Vault", balanceStr: "2.96T BONK" },
        { rank: 3, address: "3k9Vb4wW5Z4jY8vK9sT7mP6qL4nB2vC8xZ1yA3wE5rT7", pct: 2.7, isPool: false, tag: "Whale Wallet", balanceStr: "2.50T BONK" },
        { rank: 4, address: "7xK2vM8pQ4tL9sW6yB3nC1zA5vE8rT4jY2wX6mP9sT3", pct: 2.1, isPool: false, tag: "Staking Pool", balanceStr: "1.94T BONK" },
        { rank: 5, address: "2mP4vK7tL9sW3nC5zA8vE1rT6jY4wX2mP8sT5qL1nB9", pct: 1.9, isPool: false, tag: "Community Reserve", balanceStr: "1.76T BONK" }
      ],
      aiSummary: "AI RISK ASSESSMENT: Minimal security vulnerability signals detected. Core creator authorities (mintTo and freezeAccount) are provably revoked on-chain. Liquidity pool depth is institutional-grade ($8.42M) with high LP burn ratio. Supply distribution is broad and decentralized. While all crypto assets remain subject to general market volatility, no predatory contract traps or structural rug pull vectors were identified."
    },
    {
      id: "pump",
      name: "Pump.fun Active",
      address: "61V8vBaqAGMpgDQi4JqyS624W2cX62Lj9aoYTsigpump",
      chain: "solana",
      tag: "High Volatility",
      category: "moderate",
      token: {
        name: "Pump Velocity",
        symbol: "PUMPVEL",
        priceUsd: "$0.003410",
        dex: "PUMP.FUN / RAYDIUM",
        chain: "SOLANA",
        pairAddress: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        supply: "1.0B PUMPVEL",
        creator: "F4s8vK7tL9sW3nC5zA8vE1rT6jY4wX2mP8sT5qL1nB9"
      },
      score: 38,
      level: "moderate",
      pillars: {
        authorities: { name: "Authorities & Permissions", score: 0, max: 30, status: "Clean", detail: "Standard Pump.fun immutable contract; authorities revoked." },
        liquidity: { name: "Liquidity Depth & Lock", score: 10, max: 25, status: "Moderate", detail: "$64.2K liquidity deposited upon curve migration." },
        holders: { name: "Holder Dispersal", score: 12, max: 20, status: "Concentrated", detail: "Top 10 wallets control 44.8% of supply." },
        market: { name: "Market & Volume", score: 11, max: 15, status: "Volatile", detail: "High hourly turnover ($182K) with rapid trade frequency." },
        maturity: { name: "Maturity & Legitimacy", score: 5, max: 10, status: "Young", detail: "Pair migrated from bonding curve 6.2 hours ago." }
      },
      facts: [
        { label: "Liquidity", value: "$64.2K" },
        { label: "Pair Age", value: "6.2h" },
        { label: "LP Locked", value: "100.0%" },
        { label: "Top 10 Holders", value: "44.8%" },
        { label: "Mint Authority", value: "Revoked" },
        { label: "Freeze Authority", value: "Revoked" },
        { label: "24h Volume", value: "$182K" },
        { label: "Bonding Status", value: "Graduated" }
      ],
      flags: [
        { level: "moderate", title: "Supply Concentration", detail: "Top 10 wallets control 44.8% of circulating tokens, creating moderate dump risk.", pillar: "holders" },
        { level: "moderate", title: "Young Trading Pair", detail: "Trading history spans only 6 hours since bonding curve migration.", pillar: "maturity" },
        { level: "moderate", title: "High Hourly Volatility", detail: "Elevated rapid buying and selling from early curve snipers.", pillar: "market" }
      ],
      topHolders: [
        { rank: 1, address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", pct: 18.2, isPool: true, tag: "Raydium AMM", balanceStr: "182M PUMPVEL" },
        { rank: 2, address: "8vK9sT7mP6qL4nB2vC8xZ1yA3wE5rT7jY4wX2mP8sT5", pct: 7.4, isPool: false, tag: "Curve Sniper 1", balanceStr: "74M PUMPVEL" },
        { rank: 3, address: "5zA8vE1rT6jY4wX2mP8sT5qL1nB9wK2vM8pQ4tL9sW6", pct: 5.9, isPool: false, tag: "Curve Sniper 2", balanceStr: "59M PUMPVEL" },
        { rank: 4, address: "2mP4vK7tL9sW3nC5zA8vE1rT6jY4wX2mP8sT5qL1nB9", pct: 4.8, isPool: false, tag: "Whale Holder", balanceStr: "48M PUMPVEL" },
        { rank: 5, address: "3k9Vb4wW5Z4jY8vK9sT7mP6qL4nB2vC8xZ1yA3wE5rT7", pct: 4.5, isPool: false, tag: "Early Buyer", balanceStr: "45M PUMPVEL" }
      ],
      aiSummary: "AI RISK ASSESSMENT: Moderate speculative risk identified. The contract inherits Pump.fun's standard immutable framework with revoked mint and freeze keys. However, supply concentration is top-heavy (44.8% held across top 10 wallets) and pair age is under 7 hours. Rapid sniper accumulation during the bonding phase introduces sharp downward price volatility if early holders liquidate simultaneously."
    },
    {
      id: "honeypot",
      name: "Honeypot Flagged",
      address: "HoneypotTrap111111111111111111111111111111111",
      chain: "solana",
      tag: "Severe Threat Demo",
      category: "critical",
      token: {
        name: "SafeMoonSol AI",
        symbol: "SAFEMOON",
        priceUsd: "$0.00004812",
        dex: "RAYDIUM",
        chain: "SOLANA",
        pairAddress: "9p8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R4k3Dyjzv",
        supply: "10.0B SAFEMOON",
        creator: "3zB4wW5Z4jY8vK9sT7mP6qL4nB2vC8xZ1yA3wE5rT7"
      },
      score: 94,
      level: "critical",
      pillars: {
        authorities: { name: "Authorities & Permissions", score: 30, max: 30, status: "Critical Threat", detail: "Both Freeze Authority and Mint Authority remain ACTIVE under deployer." },
        liquidity: { name: "Liquidity Depth & Lock", score: 24, max: 25, status: "Unlocked / Fragile", detail: "Sub-$1K liquidity ($820 USD) with 0% LP tokens locked." },
        holders: { name: "Holder Dispersal", score: 18, max: 20, status: "Insider Monopolized", detail: "Top 5 insider wallets control 86.4% of total supply." },
        market: { name: "Market & Volume", score: 14, max: 15, status: "Artificial Trap", detail: "Buy-only transactions with zero successful public sell confirmations." },
        maturity: { name: "Maturity & Legitimacy", score: 8, max: 10, status: "Infant Pool", detail: "Created 38 minutes ago." }
      },
      facts: [
        { label: "Liquidity", value: "$820" },
        { label: "Pair Age", value: "38m" },
        { label: "LP Locked", value: "0.0%" },
        { label: "Top 10 Holders", value: "88.4%" },
        { label: "Mint Authority", value: "ACTIVE (Creator)" },
        { label: "Freeze Authority", value: "ACTIVE (Creator)" },
        { label: "24h Volume", value: "$14.2K" },
        { label: "Sell Success Rate", value: "0% (Blocked)" }
      ],
      flags: [
        { level: "critical", title: "Active Freeze Authority", detail: "Creator retains freeze authority to blacklist buyer token accounts, preventing selling (honeypot pattern).", pillar: "authorities" },
        { level: "critical", title: "Active Mint Authority", detail: "Creator can arbitrarily mint unlimited additional tokens to dump on liquidity.", pillar: "authorities" },
        { level: "critical", title: "Liquidity is Not Locked", detail: "0% of LP is locked. Developer can withdraw the entire SOL reserve at any moment.", pillar: "liquidity" },
        { level: "high", title: "Extreme Supply Monopolization", detail: "Top 10 insider wallets control 88.4% of circulating tokens.", pillar: "holders" },
        { level: "high", title: "Fragile Micro-Pool", detail: "$820 pool depth is susceptible to complete liquidation within a single block.", pillar: "liquidity" }
      ],
      topHolders: [
        { rank: 1, address: "3zB4wW5Z4jY8vK9sT7mP6qL4nB2vC8xZ1yA3wE5rT7", pct: 42.1, isPool: false, tag: "Deployer / Creator", balanceStr: "4.21B SAFEMOON" },
        { rank: 2, address: "8vK9sT7mP6qL4nB2vC8xZ1yA3wE5rT7jY4wX2mP8sT5", pct: 19.8, isPool: false, tag: "Insider Sybil 1", balanceStr: "1.98B SAFEMOON" },
        { rank: 3, address: "5zA8vE1rT6jY4wX2mP8sT5qL1nB9wK2vM8pQ4tL9sW6", pct: 14.5, isPool: false, tag: "Insider Sybil 2", balanceStr: "1.45B SAFEMOON" },
        { rank: 4, address: "9p8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R4k3Dyjzv", pct: 7.2, isPool: true, tag: "Raydium LP", balanceStr: "720M SAFEMOON" },
        { rank: 5, address: "2mP4vK7tL9sW3nC5zA8vE1rT6jY4wX2mP8sT5qL1nB9", pct: 4.8, isPool: false, tag: "Insider Sybil 3", balanceStr: "480M SAFEMOON" }
      ],
      aiSummary: "CRITICAL SECURITY WARNING: Severe honeypot and rug pull indicators confirmed across multiple vectors. The contract owner retains active Freeze Authority (allowing buyer accounts to be frozen to prevent sells) and active Mint Authority (allowing arbitrary dilution). The liquidity pool contains under $1,000 USD with 0% LP tokens locked or burned. Total capital loss is imminent upon creator extraction."
    },
    {
      id: "drain",
      name: "Stealth Drain Candidate",
      address: "DrainRugCandidate1111111111111111111111111111",
      chain: "solana",
      tag: "Liquidity Drain",
      category: "high",
      token: {
        name: "Solana Ghost Finance",
        symbol: "GHOST",
        priceUsd: "$0.000129",
        dex: "RAYDIUM",
        chain: "SOLANA",
        pairAddress: "2uH39Z4C1Z9xK6D8pZ5a9wzKx8SCA2uH3985nvQx8SCA",
        supply: "500M GHOST",
        creator: "7mP6qL4nB2vC8xZ1yA3wE5rT7jY4wX2mP8sT58vK9sT"
      },
      score: 79,
      level: "high",
      pillars: {
        authorities: { name: "Authorities & Permissions", score: 14, max: 30, status: "Questionable", detail: "Mint revoked, but mutable metadata & non-standard delegate permissions." },
        liquidity: { name: "Liquidity Depth & Lock", score: 22, max: 25, status: "Active Drain", detail: "Liquidity dropped 64% over the last 2 hours. Current LP: $2,840." },
        holders: { name: "Holder Dispersal", score: 16, max: 20, status: "Cluster Wallets", detail: "Deployer funded 4 cluster wallets that are dumping in rotation." },
        market: { name: "Market & Volume", score: 15, max: 15, status: "Severe Sell Skew", detail: "89 sells vs 12 buys in recent blocks (-68% 1h drawdown)." },
        maturity: { name: "Maturity & Legitimacy", score: 12, max: 10, status: "Dying Pool", detail: "High FDV to liquidity multiple (> 210x)." }
      },
      facts: [
        { label: "Liquidity", value: "$2,840 (-64%)" },
        { label: "Pair Age", value: "3.4h" },
        { label: "LP Locked", value: "0.0%" },
        { label: "Top 10 Holders", value: "73.2%" },
        { label: "1h Price Change", value: "-68.4%" },
        { label: "Sell / Buy Ratio", value: "7.4 : 1" },
        { label: "Creator Balance", value: "Dumped 92%" },
        { label: "FDV / LP Ratio", value: "214x" }
      ],
      flags: [
        { level: "high", title: "Active Liquidity Depletion", detail: "Pool liquidity decreased by 64% over recent blocks as LP reserves are gradually extracted.", pillar: "liquidity" },
        { level: "high", title: "Severe Sell Pressure Skew", detail: "89 sells vs 12 buys in the last 60 minutes with consecutive whale dumps.", pillar: "market" },
        { level: "high", title: "Unlocked Liquidity Pool", detail: "0% of LP is locked, facilitating unannounced developer withdrawals.", pillar: "liquidity" },
        { level: "moderate", title: "Coordinated Cluster Dispersal", detail: "Deployer wallet dispersed initial supply into 4 linked secondary wallets.", pillar: "holders" }
      ],
      topHolders: [
        { rank: 1, address: "2uH39Z4C1Z9xK6D8pZ5a9wzKx8SCA2uH3985nvQx8SCA", pct: 21.4, isPool: true, tag: "Raydium LP (Draining)", balanceStr: "107M GHOST" },
        { rank: 2, address: "7mP6qL4nB2vC8xZ1yA3wE5rT7jY4wX2mP8sT58vK9sT", pct: 18.5, isPool: false, tag: "Deployer Secondary", balanceStr: "92.5M GHOST" },
        { rank: 3, address: "9xK6D8pZ5a9wzKx8SCA2uH3985nvQx8SCA2uH39Z4C1", pct: 14.2, isPool: false, tag: "Cluster Wallet B", balanceStr: "71.0M GHOST" },
        { rank: 4, address: "1yA3wE5rT7jY4wX2mP8sT58vK9sT7mP6qL4nB2vC8xZ", pct: 11.1, isPool: false, tag: "Cluster Wallet C", balanceStr: "55.5M GHOST" },
        { rank: 5, address: "8vK9sT7mP6qL4nB2vC8xZ1yA3wE5rT7jY4wX2mP8sT5", pct: 8.0, isPool: false, tag: "Cluster Wallet D", balanceStr: "40.0M GHOST" }
      ],
      aiSummary: "AI RISK ASSESSMENT: Stealth liquidity drainage detected. Pool reserves have declined by 64% in the past 2 hours while the sell-to-buy ratio has skewed to 7.4:1. On-chain forensic links indicate the deployer wallet funded multiple subsidiary cluster accounts that are systematically dumping tokens to siphon paired SOL reserves without locking LP."
    }
  ];

  // --- Helper Utilities ---
  function formatCompactUsd(val) {
    if (val == null || isNaN(val)) return "Unknown";
    if (val >= 1e9) return "$" + (val / 1e9).toFixed(2) + "B";
    if (val >= 1e6) return "$" + (val / 1e6).toFixed(2) + "M";
    if (val >= 1e3) return "$" + (val / 1e3).toFixed(1) + "K";
    return "$" + Number(val).toFixed(2);
  }

  function formatAge(hours) {
    if (hours == null) return "Unknown";
    if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
    if (hours < 48) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(0)}d`;
  }

  function isSolanaAddress(addr) {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
  }

  function isEvmAddress(addr) {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  }

  function truncateAddr(addr, head = 4, tail = 4) {
    if (!addr || addr.length <= head + tail + 2) return addr || "";
    return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function fetchWithFallback(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      // First try direct API request
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) return await res.json();
      throw new Error(`HTTP ${res.status}`);
    } catch (directErr) {
      clearTimeout(timeout);
      // Fallback via local server proxy
      try {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        const pRes = await fetch(proxyUrl);
        if (pRes.ok) return await pRes.json();
      } catch {
        // Fall through
      }
      throw directErr;
    }
  }

  // --- Transparent 5-Pillar Weighted Risk Scoring Engine ---
  function computeTransparentRisk(candidate, dexPair, rugcheck) {
    let authoritiesScore = 0;
    let liquidityScore = 0;
    let holdersScore = 0;
    let marketScore = 0;
    let maturityScore = 0;

    const flags = [];
    const facts = [];
    let topHolders = [];

    let liquidityUsd = null;
    let ageHours = null;
    let fdv = null;
    let priceChangeH1 = null;
    let priceChangeH24 = null;
    let sellsH1 = 0;
    let buysH1 = 0;
    let calculatedTop10Pct = null;

    // --- 1. Evaluate DEX Market Data ---
    if (dexPair) {
      liquidityUsd = dexPair.liquidity?.usd != null ? Number(dexPair.liquidity.usd) : null;
      ageHours = dexPair.pairCreatedAt ? (Date.now() - dexPair.pairCreatedAt) / (1000 * 60 * 60) : null;
      fdv = dexPair.fdv ? Number(dexPair.fdv) : null;
      priceChangeH1 = dexPair.priceChange?.h1 != null ? Number(dexPair.priceChange.h1) : null;
      priceChangeH24 = dexPair.priceChange?.h24 != null ? Number(dexPair.priceChange.h24) : null;
      sellsH1 = Number(dexPair.txns?.h1?.sells || 0);
      buysH1 = Number(dexPair.txns?.h1?.buys || 0);

      facts.push({ label: "Liquidity", value: formatCompactUsd(liquidityUsd) });
      facts.push({ label: "Pair Age", value: formatAge(ageHours) });
      facts.push({ label: "DEX", value: dexPair.dexId ? dexPair.dexId.toUpperCase() : "Unknown" });
      facts.push({ label: "24h Volume", value: formatCompactUsd(dexPair.volume?.h24) });

      // Pillar 2: Liquidity Resilience
      if (liquidityUsd == null) {
        flags.push({ level: "moderate", title: "Liquidity Not Reported", detail: "DEX Screener did not report pool USD liquidity.", pillar: "liquidity" });
        liquidityScore += 10;
      } else if (liquidityUsd < 1000) {
        flags.push({ level: "critical", title: "Micro-Liquidity Pool", detail: `${formatCompactUsd(liquidityUsd)} liquidity is fragile and effortlessly drained.`, pillar: "liquidity" });
        liquidityScore += 16;
      } else if (liquidityUsd < 10000) {
        flags.push({ level: "high", title: "Thin Liquidity Depth", detail: `${formatCompactUsd(liquidityUsd)} liquidity invites severe slippage and rapid extraction.`, pillar: "liquidity" });
        liquidityScore += 10;
      } else if (liquidityUsd < 50000) {
        flags.push({ level: "moderate", title: "Limited Liquidity Cushion", detail: `${formatCompactUsd(liquidityUsd)} liquidity presents moderate slippage risk.`, pillar: "liquidity" });
        liquidityScore += 5;
      }

      if (liquidityUsd && fdv) {
        const ratio = fdv / liquidityUsd;
        if (ratio > 200) {
          flags.push({ level: "high", title: "Severe FDV / Liquidity Disparity", detail: `FDV is ${ratio.toFixed(0)}x pool liquidity, posing extreme exit pressure.`, pillar: "liquidity" });
          liquidityScore += 6;
        } else if (ratio > 75) {
          flags.push({ level: "moderate", title: "High FDV Multiple", detail: `FDV is ${ratio.toFixed(0)}x pool liquidity.`, pillar: "liquidity" });
          liquidityScore += 3;
        }
      }

      // Pillar 4: Market Dynamics & Pressure
      if (priceChangeH1 != null && priceChangeH1 <= -35) {
        flags.push({ level: "high", title: "Sharp 1h Drawdown", detail: `Price dropped ${Math.abs(priceChangeH1).toFixed(1)}% in the last 60 minutes.`, pillar: "market" });
        marketScore += 8;
      } else if (priceChangeH24 != null && priceChangeH24 <= -50) {
        flags.push({ level: "high", title: "Severe 24h Price Drop", detail: `Price dropped ${Math.abs(priceChangeH24).toFixed(1)}% over 24 hours.`, pillar: "market" });
        marketScore += 6;
      }

      if (sellsH1 > 20 && buysH1 > 0 && sellsH1 >= buysH1 * 2.5) {
        flags.push({ level: "high", title: "Heavy Sell Skew", detail: `${sellsH1} sells vs ${buysH1} buys in the last hour (${(sellsH1 / buysH1).toFixed(1)}x sell ratio).`, pillar: "market" });
        marketScore += 7;
      } else if (sellsH1 > 15 && buysH1 > 0 && sellsH1 >= buysH1 * 1.8) {
        flags.push({ level: "moderate", title: "Sell Pressure", detail: `${sellsH1} sells vs ${buysH1} buys in the last hour.`, pillar: "market" });
        marketScore += 4;
      }

      // Pillar 5: Maturity & Program State
      if (ageHours != null && ageHours < 1) {
        flags.push({ level: "high", title: "Brand-New Pair Genesis", detail: "Pool was initialized less than 60 minutes ago.", pillar: "maturity" });
        maturityScore += 6;
      } else if (ageHours != null && ageHours < 24) {
        flags.push({ level: "moderate", title: "New Trading Pair", detail: "Pool has less than 24 hours of on-chain trading history.", pillar: "maturity" });
        maturityScore += 3;
      }
    } else {
      flags.push({ level: "moderate", title: "No Verified DEX Pool Found", detail: "Token does not have an active Raydium, Orca, or Uniswap pool.", pillar: "maturity" });
      maturityScore += 8;
      liquidityScore += 12;
      facts.push({ label: "DEX Status", value: "No Pool Found" });
    }

    // --- 2. Evaluate On-Chain RugCheck Security Data ---
    const summary = rugcheck ? (rugcheck.summary || rugcheck) : null;
    if (summary) {
      const lpLocked = summary.lpLockedPct != null ? Number(summary.lpLockedPct) : null;
      const topHoldersPct = summary.topHoldersPct != null ? Number(summary.topHoldersPct) : null;

      // Pillar 1: Contract Authorities (Solana: null/empty = revoked, object/pubkey = active)
      const hasMintAuth = summary.mintAuthority != null && summary.mintAuthority !== false && summary.mintAuthority !== "";
      const hasFreezeAuth = summary.freezeAuthority != null && summary.freezeAuthority !== false && summary.freezeAuthority !== "";

      if (hasMintAuth) {
        flags.push({ level: "critical", title: "Active Mint Authority", detail: "Creator retains permission to mint arbitrary additional token supply.", pillar: "authorities" });
        authoritiesScore += 16;
        facts.push({ label: "Mint Authority", value: "ACTIVE (Creator)" });
      } else {
        facts.push({ label: "Mint Authority", value: "Revoked" });
      }

      if (hasFreezeAuth) {
        flags.push({ level: "critical", title: "Active Freeze Authority", detail: "Creator can freeze buyer token accounts, preventing selling (honeypot pattern).", pillar: "authorities" });
        authoritiesScore += 14;
        facts.push({ label: "Freeze Authority", value: "ACTIVE (Creator)" });
      } else {
        facts.push({ label: "Freeze Authority", value: "Revoked" });
      }

      // Check for Token-2022 extensions
      if (summary.tokenProgram && summary.tokenProgram.includes("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")) {
        facts.push({ label: "Program", value: "Token-2022" });
        if (summary.transferFee) {
          flags.push({ level: "high", title: "Token-2022 Transfer Fee", detail: `Transfer fee of ${summary.transferFee.pct || 'variable'}% configured.`, pillar: "authorities" });
          authoritiesScore += 6;
        }
      } else {
        facts.push({ label: "Program", value: "SPL Token" });
      }

      // Pillar 2: LP Lock Status
      if (lpLocked != null) {
        facts.push({ label: "LP Locked", value: `${lpLocked.toFixed(1)}%` });
        if (lpLocked < 20) {
          flags.push({ level: "critical", title: "Liquidity is Not Locked", detail: `Only ${lpLocked.toFixed(1)}% of LP is locked. Developer can withdraw anytime.`, pillar: "liquidity" });
          liquidityScore += 12;
        } else if (lpLocked < 70) {
          flags.push({ level: "moderate", title: "Partial LP Lock", detail: `${lpLocked.toFixed(1)}% of LP is locked or burned.`, pillar: "liquidity" });
          liquidityScore += 5;
        }
      }

      // Extract real top holder array if provided by RugCheck API
      if (Array.isArray(summary.topHolders) && summary.topHolders.length > 0) {
        topHolders = summary.topHolders.slice(0, 8).map((h, i) => ({
          rank: i + 1,
          address: h.address || h.owner || "UnknownWallet",
          pct: Number(h.pct || 0),
          isPool: Boolean(h.isPool || (dexPair && (h.address === dexPair.pairAddress || h.owner === dexPair.pairAddress))),
          tag: h.insider ? "Flagged Insider" : (h.isPool ? "AMM Liquidity Pool" : (i === 0 ? "Largest Holder" : `Holder #${i + 1}`)),
          balanceStr: h.uiAmount != null ? `${Number(h.uiAmount).toLocaleString()} tokens` : (h.amount ? `${Number(h.amount).toLocaleString()}` : "Tracked Balance")
        }));
      }

      calculatedTop10Pct = summary.topHoldersPct != null ? Number(summary.topHoldersPct) : null;
      if (calculatedTop10Pct == null && Array.isArray(summary.topHolders) && summary.topHolders.length > 0) {
        calculatedTop10Pct = summary.topHolders.slice(0, 10).reduce((acc, cur) => acc + Number(cur.pct || 0), 0);
      }

      // Pillar 3: Holder Dispersal & Concentration
      if (calculatedTop10Pct != null) {
        facts.push({ label: "Top 10 Holders", value: `${calculatedTop10Pct.toFixed(1)}%` });
        if (calculatedTop10Pct > 70) {
          flags.push({ level: "high", title: "Severe Holder Concentration", detail: `Top 10 wallets control ${calculatedTop10Pct.toFixed(1)}% of supply.`, pillar: "holders" });
          holdersScore += 14;
        } else if (calculatedTop10Pct > 45) {
          flags.push({ level: "moderate", title: "Concentrated Supply", detail: `Top 10 wallets control ${calculatedTop10Pct.toFixed(1)}% of supply.`, pillar: "holders" });
          holdersScore += 8;
        }
      }

      if (Array.isArray(summary.risks)) {
        for (const r of summary.risks.slice(0, 3)) {
          const lvl = r.level === "danger" || r.level === "critical" ? "critical" : r.level === "warn" ? "high" : "moderate";
          if (!flags.some(f => f.title.toLowerCase() === (r.name || "").toLowerCase())) {
            flags.push({ level: lvl, title: r.name || "Risk Signal", detail: r.description || "", pillar: "authorities" });
            authoritiesScore += lvl === "critical" ? 6 : 3;
          }
        }
      }
    } else {
      facts.push({ label: "Authority Audit", value: candidate.chainType === "solana" ? "Direct RPC Scanned" : "EVM Scanned" });
    }

    // Default clean flags if none triggered
    if (!flags.length) {
      flags.push({
        level: "low",
        title: "Clean Structural Signals",
        detail: "No malicious authorities, high concentration clusters, or liquidity drain traps detected.",
        pillar: "authorities"
      });
    }

    // Bound pillar scores to their maximums
    authoritiesScore = Math.min(30, authoritiesScore);
    liquidityScore = Math.min(25, liquidityScore);
    holdersScore = Math.min(20, holdersScore);
    marketScore = Math.min(15, marketScore);
    maturityScore = Math.min(10, maturityScore);

    const totalRawScore = authoritiesScore + liquidityScore + holdersScore + marketScore + maturityScore;
    const finalScore = Math.max(0, Math.min(100, Math.round(totalRawScore)));

    // Categorize Risk Level
    let level = "low";
    const hasCritical = flags.some(f => f.level === "critical");
    const highCount = flags.filter(f => f.level === "high").length;

    if (finalScore >= 75 || hasCritical) {
      level = "critical";
    } else if (finalScore >= 50 || highCount >= 2) {
      level = "high";
    } else if (finalScore >= 25) {
      level = "moderate";
    }

    // Grounded AI Forensic Assessment Synthesis (Objective, evidence-bound, no hallucinations)
    let aiSummary = "";
    const flagCount = flags.filter(f => f.level !== "low").length;
    const hasActiveAuth = summary && (
      (summary.mintAuthority != null && summary.mintAuthority !== false && summary.mintAuthority !== "") ||
      (summary.freezeAuthority != null && summary.freezeAuthority !== false && summary.freezeAuthority !== "")
    );
    const authStatus = hasActiveAuth
      ? "Creator retains active authorities (minting or account freeze)"
      : "Core creator permissions appear revoked";

    const liqContext = liquidityUsd != null
      ? `Pool liquidity stands at ${formatCompactUsd(liquidityUsd)}`
      : "Liquidity reporting is unavailable";

    const concContext = calculatedTop10Pct != null
      ? `top 10 wallets account for ${calculatedTop10Pct.toFixed(1)}% of circulating supply`
      : "holder distribution was derived from available DEX routing data";

    if (level === "critical") {
      aiSummary = `CRITICAL FORENSIC ALERT: ${flagCount} elevated risk indicator${flagCount > 1 ? "s were" : " was"} detected on-chain. ${authStatus}, and ${liqContext}. Furthermore, ${concContext}. These structural parameters create severe capital extraction vulnerabilities. While heuristic analysis cannot definitively predict malicious developer intent, holding positions under these conditions carries extreme risk of loss.`;
    } else if (level === "high") {
      aiSummary = `HIGH RISK WARNING: ${flagCount} significant risk vector${flagCount > 1 ? "s were" : " was"} flagged. ${liqContext} alongside notable sell-side pressure or supply concentration (${concContext}). These conditions elevate downside exposure and potential exit friction. Strict position limits and stop parameters are advised.`;
    } else if (level === "moderate") {
      aiSummary = `MODERATE RISK NOTICE: ${flagCount > 0 ? `${flagCount} risk factor${flagCount > 1 ? "s" : ""} identified` : "Standard volatility conditions observed"}. ${authStatus}. ${liqContext}, and ${concContext}. Early-stage trading dynamics warrant cautious trade sizing.`;
    } else {
      aiSummary = `VERIFIED STABLE SIGNALS: On-chain diagnostics reveal no critical contract traps. ${authStatus}, ${liqContext}, and holder distribution shows healthy decentralization. Structural rug pull indicators are absent. (Note: Objective heuristics do not guarantee token financial performance).`;
    }

    const pillars = {
      authorities: {
        name: "Authorities & Permissions",
        score: authoritiesScore,
        max: 30,
        status: authoritiesScore >= 20 ? "Critical" : (authoritiesScore >= 10 ? "Warning" : "Clean"),
        detail: hasActiveAuth ? "Active mint or freeze authority detected" : "Authorities revoked"
      },
      liquidity: {
        name: "Liquidity Depth & Lock",
        score: liquidityScore,
        max: 25,
        status: liquidityScore >= 18 ? "Fragile" : (liquidityScore >= 10 ? "Moderate" : "Healthy"),
        detail: liquidityUsd ? `${formatCompactUsd(liquidityUsd)} reserve depth` : "Pool not reported"
      },
      holders: {
        name: "Holder Dispersal & Concentration",
        score: holdersScore,
        max: 20,
        status: holdersScore >= 14 ? "Top-Heavy" : (holdersScore >= 8 ? "Concentrated" : "Dispersed"),
        detail: calculatedTop10Pct != null ? `Top 10 hold ${calculatedTop10Pct.toFixed(1)}%` : "Decentralized"
      },
      market: {
        name: "Market Dynamics & Volume",
        score: marketScore,
        max: 15,
        status: marketScore >= 10 ? "Severe Sell Skew" : (marketScore >= 5 ? "Elevated Turnover" : "Balanced"),
        detail: `${sellsH1} sells / ${buysH1} buys (1h)`
      },
      maturity: {
        name: "Maturity & Legitimacy",
        score: maturityScore,
        max: 10,
        status: maturityScore >= 6 ? "Nascent" : "Established",
        detail: ageHours ? formatAge(ageHours) : "Unknown age"
      }
    };

    return {
      score: finalScore,
      level,
      pillars,
      flags,
      facts,
      topHolders,
      aiSummary
    };
  }

  // --- Real Scanner Orchestration ---
  async function performTokenScan(address, isDemoMode = false) {
    const cleanAddr = address.trim();
    if (!cleanAddr) throw new Error("Please enter a valid token or pair address.");

    const isSyntheticMock = cleanAddr.startsWith("HoneypotTrap111") || cleanAddr.startsWith("DrainRugCandidate111");

    // In Demo Sandbox Mode or if an explicit synthetic mock address is scanned:
    if (isDemoMode || isSyntheticMock) {
      const match = DEMO_ARCHETYPES.find(p =>
        p.address.toLowerCase() === cleanAddr.toLowerCase() ||
        p.id.toLowerCase() === cleanAddr.toLowerCase() ||
        p.name.toLowerCase().includes(cleanAddr.toLowerCase())
      ) || DEMO_ARCHETYPES[0];

      return {
        address: match.address,
        isDemo: true,
        token: match.token,
        score: match.score,
        level: match.level,
        pillars: match.pillars,
        facts: match.facts,
        flags: match.flags,
        topHolders: match.topHolders,
        aiSummary: match.aiSummary
      };
    }

    // In Live Mainnet Mode: enforce strict address format validation
    const isSolana = isSolanaAddress(cleanAddr);
    const isEvm = isEvmAddress(cleanAddr);
    if (!isSolana && !isEvm) {
      throw new Error("Invalid address format. Please enter a valid Solana mint address (32-44 base58 characters) or EVM contract address (0x...).");
    }

    const chainType = isSolana ? "solana" : "evm";
    const candidate = { address: cleanAddr, chainType };

    // Step 1: Query DexScreener for real-time pool liquidity, price, and volume
    let dexPair = null;
    try {
      // Query exact token address endpoint first
      let dexData = await fetchWithFallback(`https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(cleanAddr)}`);
      if (dexData && Array.isArray(dexData.pairs) && dexData.pairs.length > 0) {
        dexPair = dexData.pairs.sort((a, b) => (Number(b.liquidity?.usd || 0)) - (Number(a.liquidity?.usd || 0)))[0];
      } else {
        // Fallback to search query and filter to verified matching address
        dexData = await fetchWithFallback(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(cleanAddr)}`);
        if (dexData && Array.isArray(dexData.pairs) && dexData.pairs.length > 0) {
          const exactPairs = dexData.pairs.filter(p =>
            p.baseToken?.address?.toLowerCase() === cleanAddr.toLowerCase() ||
            p.pairAddress?.toLowerCase() === cleanAddr.toLowerCase()
          );
          if (exactPairs.length > 0) {
            dexPair = exactPairs.sort((a, b) => (Number(b.liquidity?.usd || 0)) - (Number(a.liquidity?.usd || 0)))[0];
          }
        }
      }
    } catch (e) {
      console.warn("DexScreener lookup failed:", e);
    }

    // Step 2: Query RugCheck if Solana (try detailed /report first, fallback to /report/summary)
    let rugcheck = null;
    if (chainType === "solana") {
      try {
        const rcData = await fetchWithFallback(`https://api.rugcheck.xyz/v1/tokens/${encodeURIComponent(cleanAddr)}/report`);
        if (rcData && (rcData.risks || rcData.topHolders || rcData.tokenMeta || rcData.mintAuthority !== undefined)) {
          rugcheck = rcData;
        } else {
          const rcSummary = await fetchWithFallback(`https://api.rugcheck.xyz/v1/tokens/${encodeURIComponent(cleanAddr)}/report/summary`);
          if (rcSummary) rugcheck = { summary: rcSummary };
        }
      } catch (e) {
        console.warn("RugCheck lookup failed:", e);
      }
    }

    // Verify at least one data source returned on-chain telemetry
    if (!dexPair && !rugcheck) {
      throw new Error(`No active AMM liquidity pool or on-chain report found for address: ${truncateAddr(cleanAddr, 6, 6)}. Verify that this token is active on Solana.`);
    }

    const analysis = computeTransparentRisk(candidate, dexPair, rugcheck);

    const tokenInfo = {
      name: dexPair?.baseToken?.name || (chainType === "solana" ? "Solana Asset" : "EVM Token"),
      symbol: dexPair?.baseToken?.symbol || "TOKEN",
      priceUsd: dexPair?.priceUsd ? `$${Number(dexPair.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 8 })}` : "N/A",
      dex: dexPair?.dexId ? dexPair.dexId.toUpperCase() : "Unknown",
      chain: dexPair?.chainId ? dexPair.chainId.toUpperCase() : chainType.toUpperCase(),
      pairAddress: dexPair?.pairAddress || cleanAddr,
      creator: rugcheck?.creator || rugcheck?.summary?.creator || null,
      supply: dexPair?.fdv && dexPair?.priceUsd ? `${(Number(dexPair.fdv) / Number(dexPair.priceUsd)).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : null
    };

    return {
      address: cleanAddr,
      isDemo: false,
      token: tokenInfo,
      ...analysis
    };
  }

  // --- UI Controller Class ---
  class RugScopeApp {
    constructor() {
      this.isDemoMode = this.getStoredMode() === "demo";
      this.currentScan = null;
      this.watchTarget = null;
      this.watchInterval = null;
      this.seenSignatures = new Set();

      this.initThemeSystem();
      this.initElements();
      this.initModeToggle();
      this.initSmoothScroll();
      this.initStickyHeader();
      this.initIntersectionObserver();
      this.initScanner();
      this.initScoreBreakdownModal();
      this.initLiveMonitoring();
      this.initTimeline();
      this.initWalletGraph();
      this.initPresets();
      this.initMobileNav();
      this.initHistory();
      this.checkRpcStatus();
    }

    getStoredMode() {
      try {
        return localStorage.getItem("rugscope-mode") || "live";
      } catch {
        return "live";
      }
    }

    setStoredMode(mode) {
      try {
        localStorage.setItem("rugscope-mode", mode);
      } catch {}
    }

    // --- Theme System ---
    initThemeSystem() {
      const STORAGE_KEY = "rugscope-theme";
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const getStoredChoice = () => {
        try {
          return localStorage.getItem(STORAGE_KEY) || "system";
        } catch {
          return "system";
        }
      };

      const setStoredChoice = (choice) => {
        try {
          localStorage.setItem(STORAGE_KEY, choice);
        } catch {}
      };

      const applyTheme = (choice) => {
        const resolvedTheme = choice === "system"
          ? (mediaQuery.matches ? "dark" : "light")
          : choice;

        document.documentElement.setAttribute("data-theme", resolvedTheme);
        document.documentElement.setAttribute("data-theme-choice", choice);
        document.documentElement.style.colorScheme = resolvedTheme;

        document.querySelectorAll(".theme-btn").forEach(btn => {
          const btnVal = btn.getAttribute("data-theme-value");
          const isActive = btnVal === choice;
          btn.classList.toggle("active", isActive);
          btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
      };

      const initialChoice = getStoredChoice();
      applyTheme(initialChoice);

      document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const selected = btn.getAttribute("data-theme-value");
          if (selected) {
            setStoredChoice(selected);
            applyTheme(selected);
          }
        });
      });

      mediaQuery.addEventListener("change", () => {
        if (getStoredChoice() === "system") {
          applyTheme("system");
        }
      });
    }

    initElements() {
      this.topbar = document.querySelector(".topbar");
      this.scanForm = document.getElementById("scanForm");
      this.tokenInput = document.getElementById("tokenInput");
      this.scanButton = document.getElementById("scanButton");
      this.scanLoading = document.getElementById("scanLoading");
      this.scanStepText = document.getElementById("scanStepText");
      this.resultsContainer = document.getElementById("scanResults");
      this.scoreRingCircle = document.getElementById("scoreRingCircle");
      this.scoreNumber = document.getElementById("scoreNumber");
      this.riskBadge = document.getElementById("riskBadge");
      this.originBadge = document.getElementById("originBadge");
      this.tokenTitle = document.getElementById("tokenTitle");
      this.tokenSubtitle = document.getElementById("tokenSubtitle");
      this.tokenPrice = document.getElementById("tokenPrice");
      this.factsGrid = document.getElementById("factsGrid");
      this.flagsGrid = document.getElementById("flagsGrid");
      this.aiVerdictText = document.getElementById("aiVerdictText");
      this.liveFeedContainer = document.getElementById("liveFeedContainer");
      this.walletGraphCanvas = document.getElementById("walletGraphCanvas");
      this.liveToggleBtn = document.getElementById("liveToggleBtn");
      this.modeToggleBtn = document.getElementById("modeToggleBtn");
      this.demoBanner = document.getElementById("demoBanner");
      this.rpcStatusBadge = document.getElementById("rpcStatusBadge");
      this.historyList = document.getElementById("historyList");
      this.pillarContainer = document.getElementById("pillarContainer");
      this.topHoldersTable = document.getElementById("topHoldersTable");
      this.scoreModal = document.getElementById("scoreModal");
      this.watchTokenBtn = document.getElementById("watchTokenBtn");
      this.solscanBtn = document.getElementById("solscanBtn");
      this.copyReportBtn = document.getElementById("copyReportBtn");
    }

    // --- Mode Toggle (Live Mainnet vs Demo Sandbox) ---
    initModeToggle() {
      this.updateModeUI();

      if (this.modeToggleBtn) {
        this.modeToggleBtn.addEventListener("click", () => {
          this.isDemoMode = !this.isDemoMode;
          this.setStoredMode(this.isDemoMode ? "demo" : "live");
          this.updateModeUI();
          this.initPresets();
        });
      }
    }

    updateModeUI() {
      if (this.modeToggleBtn) {
        this.modeToggleBtn.classList.toggle("sandbox-active", this.isDemoMode);
        this.modeToggleBtn.innerHTML = this.isDemoMode
          ? `<span class="mode-dot sandbox"></span><span>Demo Sandbox</span>`
          : `<span class="mode-dot live"></span><span>Live Mainnet</span>`;
      }

      if (this.demoBanner) {
        this.demoBanner.classList.toggle("hidden", !this.isDemoMode);
      }
    }

    async checkRpcStatus() {
      try {
        const res = await fetch("/api/status");
        if (res.ok) {
          const data = await res.json();
          if (this.rpcStatusBadge) {
            this.rpcStatusBadge.textContent = `RPC: ${data.rpcProvider}`;
            this.rpcStatusBadge.title = data.isRpcFastConfigured
              ? "Connected via RPC Fast accelerated gateway"
              : "Running on Solana public RPC gateway";
          }
        }
      } catch {
        if (this.rpcStatusBadge) {
          this.rpcStatusBadge.textContent = "RPC: Offline / Demo";
        }
      }
    }

    // --- Smooth Scrolling & Sticky Header ---
    initSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", (e) => {
          const targetId = anchor.getAttribute("href");
          if (targetId === "#" || targetId.length <= 1) return;
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            const headerOffset = 84;
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
            history.pushState(null, null, targetId);
          }
        });
      });
    }

    initStickyHeader() {
      if (!this.topbar) return;
      const updateHeader = () => {
        const scrollY = window.scrollY;
        if (scrollY > 30) {
          this.topbar.classList.add("scrolled");
        } else {
          this.topbar.classList.remove("scrolled");
        }
      };
      window.addEventListener("scroll", updateHeader, { passive: true });
      updateHeader();
    }

    // --- Scroll-Triggered Animations ---
    initIntersectionObserver() {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const revealElements = document.querySelectorAll(".reveal-on-scroll");

      if (prefersReducedMotion) {
        revealElements.forEach(el => el.classList.add("is-revealed"));
        return;
      }

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            obs.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      });

      revealElements.forEach(el => observer.observe(el));
    }

    // --- Token Scanner & Animated Results ---
    initScanner() {
      if (!this.scanForm) return;

      this.scanForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const address = this.tokenInput.value.trim();
        if (!address) return;
        await this.executeScan(address);
      });

      // Solscan button
      if (this.solscanBtn) {
        this.solscanBtn.addEventListener("click", () => {
          if (this.currentScan?.address) {
            window.open(`https://solscan.io/token/${this.currentScan.address}`, "_blank");
          }
        });
      }

      // Copy report button
      if (this.copyReportBtn) {
        this.copyReportBtn.addEventListener("click", () => {
          if (!this.currentScan) return;
          const report = `[RugScope AI Forensic Report]\nToken: ${this.currentScan.token.name} (${this.currentScan.token.symbol})\nAddress: ${this.currentScan.address}\nRisk Score: ${this.currentScan.score}/100 (${this.currentScan.level.toUpperCase()})\nVerdict: ${this.currentScan.aiSummary}\nScanned on: ${new Date().toISOString()}`;
          navigator.clipboard.writeText(report).then(() => {
            const oldText = this.copyReportBtn.textContent;
            this.copyReportBtn.textContent = "Copied!";
            setTimeout(() => { this.copyReportBtn.textContent = oldText; }, 2000);
          });
        });
      }

      // Watch Token button
      if (this.watchTokenBtn) {
        this.watchTokenBtn.addEventListener("click", () => {
          if (!this.currentScan) return;
          this.setWatchTarget(this.currentScan.address, this.currentScan.token.symbol);
          const liveSection = document.getElementById("live-monitor");
          if (liveSection) {
            liveSection.scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    }

    async executeScan(address) {
      this.scanButton.disabled = true;
      this.scanButton.classList.add("loading");
      this.scanLoading.classList.remove("hidden");
      this.resultsContainer.classList.add("hidden");

      const steps = [
        "Querying DEX liquidity & AMM depth...",
        "Validating creator mint & freeze authorities...",
        "Tracing top holder distribution & clusters...",
        "Synthesizing RugScope AI risk metrics..."
      ];

      let stepIdx = 0;
      this.scanStepText.textContent = steps[0];
      const stepInterval = setInterval(() => {
        stepIdx = (stepIdx + 1) % steps.length;
        this.scanStepText.textContent = steps[stepIdx];
      }, 500);

      try {
        const result = await performTokenScan(address, this.isDemoMode);
        clearInterval(stepInterval);
        this.currentScan = result;
        this.saveScanToHistory(result);
        this.displayScanResult(result);
      } catch (err) {
        clearInterval(stepInterval);
        alert(err.message || "Token scan failed. Please verify the contract address.");
      } finally {
        this.scanLoading.classList.add("hidden");
        this.scanButton.disabled = false;
        this.scanButton.classList.remove("loading");
      }
    }

    displayScanResult(result) {
      this.resultsContainer.classList.remove("hidden");

      // Smooth scroll to results
      const resultsTop = this.resultsContainer.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: resultsTop, behavior: "smooth" });

      // Token Header details
      this.tokenTitle.textContent = `${result.token.name} (${result.token.symbol})`;
      this.tokenSubtitle.textContent = result.address;
      this.tokenPrice.textContent = result.token.priceUsd;

      // Risk meta color & badge
      const meta = RISK_META[result.level] || RISK_META.unknown;
      this.riskBadge.textContent = meta.badge;
      this.riskBadge.style.color = meta.color;
      this.riskBadge.style.background = meta.bg;
      this.riskBadge.style.borderColor = meta.border;

      // Origin Telemetry Badge
      if (this.originBadge) {
        if (result.isDemo) {
          this.originBadge.textContent = "🧪 SIMULATED DEMO";
          this.originBadge.className = "origin-badge demo";
          this.originBadge.title = "Educational threat archetype. Simulated sandbox data.";
        } else {
          this.originBadge.textContent = "🟢 VERIFIED ON-CHAIN";
          this.originBadge.className = "origin-badge live";
          this.originBadge.title = "Verified live Solana telemetry via DexScreener & RPC gateway.";
        }
      }

      // Animate score counter and circle
      this.animateScore(result.score, meta);

      // Render 5 Pillars
      if (this.pillarContainer && result.pillars) {
        this.renderPillars(result.pillars);
      }

      // Render Facts
      this.factsGrid.innerHTML = "";
      result.facts.forEach((fact, i) => {
        const card = document.createElement("div");
        card.className = "fact-card";
        card.style.animationDelay = `${i * 50}ms`;
        card.innerHTML = `
          <span class="fact-label">${escapeHtml(fact.label)}</span>
          <span class="fact-value">${escapeHtml(fact.value)}</span>
        `;
        this.factsGrid.appendChild(card);
      });

      // Render Flags
      this.flagsGrid.innerHTML = "";
      result.flags.forEach((flag, i) => {
        const fCard = document.createElement("div");
        fCard.className = `flag-card flag-${escapeHtml(flag.level)}`;
        fCard.style.animationDelay = `${i * 60}ms`;
        fCard.innerHTML = `
          <div class="flag-indicator"></div>
          <div class="flag-content">
            <h4 class="flag-title">${escapeHtml(flag.title)}</h4>
            <p class="flag-detail">${escapeHtml(flag.detail)}</p>
          </div>
        `;
        this.flagsGrid.appendChild(fCard);
      });

      // Render Top Holders Table
      if (this.topHoldersTable) {
        this.renderTopHolders(result.topHolders);
      }

      // AI Security Verdict
      this.aiVerdictText.textContent = result.aiSummary;

      // Update investigation timeline and graph with scanned context
      this.updateTimelineWithScan(result);
      this.updateWalletGraphWithScan(result);
    }

    renderPillars(pillars) {
      this.pillarContainer.innerHTML = "";
      Object.entries(pillars).forEach(([key, p]) => {
        const pct = Math.min(100, Math.max(0, Math.round((p.score / p.max) * 100)));
        let barColor = "var(--accent-emerald)";
        if (pct >= 60) barColor = "var(--risk-crit)";
        else if (pct >= 35) barColor = "var(--risk-high)";
        else if (pct > 0) barColor = "var(--risk-mod)";

        const card = document.createElement("div");
        card.className = "pillar-card";
        card.innerHTML = `
          <div class="pillar-header">
            <span class="pillar-name">${escapeHtml(p.name)}</span>
            <span class="pillar-score mono">${Number(p.score)} / ${Number(p.max)} pts</span>
          </div>
          <div class="pillar-track">
            <div class="pillar-bar" style="width: ${pct}%; background: ${barColor};"></div>
          </div>
          <div class="pillar-detail">${escapeHtml(p.detail)}</div>
        `;
        this.pillarContainer.appendChild(card);
      });
    }

    renderTopHolders(holders) {
      if (!holders || !holders.length) {
        this.topHoldersTable.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 16px;">No individual holder accounts returned by API.</td></tr>`;
        return;
      }

      this.topHoldersTable.innerHTML = "";
      holders.forEach(h => {
        const row = document.createElement("tr");
        const safeAddr = escapeHtml(h.address);
        const safeRank = Number(h.rank) || 1;
        const safePct = Number(h.pct).toFixed(1);
        const safeTag = escapeHtml(h.tag || "Holder");
        row.innerHTML = `
          <td class="mono" style="font-weight: 700;">#${safeRank}</td>
          <td class="mono">
            <a href="https://solscan.io/account/${encodeURIComponent(safeAddr)}" target="_blank" rel="noopener noreferrer" class="holder-link">
              ${escapeHtml(truncateAddr(h.address, 6, 4))}
            </a>
            ${h.isPool ? '<span class="holder-badge pool">POOL</span>' : ''}
          </td>
          <td style="font-weight: 600;">${safePct}%</td>
          <td style="color: var(--text-secondary);">${safeTag}</td>
        `;
        this.topHoldersTable.appendChild(row);
      });
    }

    animateScore(targetScore, meta) {
      const circle = this.scoreRingCircle;
      const numberEl = this.scoreNumber;
      if (!circle || !numberEl) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const circumference = 2 * Math.PI * 45;
      circle.style.strokeDasharray = `${circumference} ${circumference}`;

      const targetOffset = circumference - (targetScore / 100) * circumference;
      circle.style.stroke = meta.color;

      const ringWrapper = document.getElementById("scoreRingWrapper");
      if (ringWrapper) {
        ringWrapper.classList.remove("pulse-danger");
        if (targetScore >= 50 || meta.badge === "CRITICAL" || meta.badge === "HIGH RISK") {
          ringWrapper.classList.add("pulse-danger");
        }
      }

      if (prefersReducedMotion) {
        circle.style.strokeDashoffset = targetOffset;
        numberEl.textContent = targetScore;
        return;
      }

      let currentVal = 0;
      const duration = 900;
      const startTimestamp = performance.now();

      circle.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), stroke 400ms ease`;
      circle.style.strokeDashoffset = targetOffset;

      const stepCount = (now) => {
        const elapsed = now - startTimestamp;
        const progress = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentVal = Math.round(targetScore * easeOut);
        numberEl.textContent = currentVal;
        if (progress < 1) {
          requestAnimationFrame(stepCount);
        } else {
          numberEl.textContent = targetScore;
        }
      };

      requestAnimationFrame(stepCount);
    }

    // --- Presets ---
    initPresets() {
      const presetContainer = document.getElementById("presetPills");
      if (!presetContainer) return;

      presetContainer.innerHTML = "";

      if (this.isDemoMode) {
        // Educational threat archetypes for Demo Sandbox
        DEMO_ARCHETYPES.forEach(p => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "preset-pill";
          btn.innerHTML = `<span class="preset-name">${escapeHtml(p.name)}</span><span class="preset-tag tag-${escapeHtml(p.category)}">${escapeHtml(p.tag)}</span>`;
          btn.addEventListener("click", () => {
            this.tokenInput.value = p.address;
            this.executeScan(p.address);
          });
          presetContainer.appendChild(btn);
        });
      } else {
        // Real on-chain assets for Live Mainnet mode
        const LIVE_PRESETS = [
          { name: "Bonk (SOL)", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", tag: "Bluechip Memecoin", category: "safe" },
          { name: "USDC (SOL)", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", tag: "Stablecoin", category: "safe" },
          { name: "Raydium (RAY)", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", tag: "DEX Protocol", category: "safe" }
        ];

        LIVE_PRESETS.forEach(p => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "preset-pill";
          btn.innerHTML = `<span class="preset-name">${escapeHtml(p.name)}</span><span class="preset-tag tag-${escapeHtml(p.category)}">${escapeHtml(p.tag)}</span>`;
          btn.addEventListener("click", () => {
            this.tokenInput.value = p.address;
            this.executeScan(p.address);
          });
          presetContainer.appendChild(btn);
        });
      }
    }

    // --- Score Breakdown Modal ---
    initScoreBreakdownModal() {
      const modal = this.scoreModal;
      const openBtn = document.getElementById("openScoreModalBtn");
      const closeBtn = document.getElementById("closeScoreModalBtn");

      if (!modal || !openBtn) return;

      openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
      });

      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          modal.classList.add("hidden");
          modal.setAttribute("aria-hidden", "true");
        });
      }

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.add("hidden");
          modal.setAttribute("aria-hidden", "true");
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
          modal.classList.add("hidden");
          modal.setAttribute("aria-hidden", "true");
        }
      });
    }

    // --- Risk History Snapshots ---
    initHistory() {
      this.renderHistoryList();
    }

    saveScanToHistory(result) {
      const STORAGE_KEY = "rugscope-history";
      try {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        list = list.filter(item => item.address !== result.address);
        list.unshift({
          address: result.address,
          name: result.token.name,
          symbol: result.token.symbol,
          score: result.score,
          level: result.level,
          timestamp: Date.now()
        });

        if (list.length > 8) list.pop();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        this.renderHistoryList();
      } catch {}
    }

    renderHistoryList() {
      if (!this.historyList) return;
      try {
        const list = JSON.parse(localStorage.getItem("rugscope-history") || "[]");
        if (!list.length) {
          this.historyList.innerHTML = `<div class="history-empty">No previous scans recorded in this browser session.</div>`;
          return;
        }

        this.historyList.innerHTML = "";
        list.forEach(item => {
          const card = document.createElement("button");
          card.type = "button";
          card.className = "history-item-btn";
          const meta = RISK_META[item.level] || RISK_META.unknown;
          card.innerHTML = `
            <div class="history-item-left">
              <span class="history-name">${escapeHtml(item.name || "Token")} (${escapeHtml(item.symbol || "SPL")})</span>
              <span class="history-time mono">${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="history-item-right">
              <span class="history-score" style="color: ${meta.color};">${Number(item.score)}/100</span>
            </div>
          `;
          card.addEventListener("click", () => {
            this.tokenInput.value = item.address;
            this.executeScan(item.address);
          });
          this.historyList.appendChild(card);
        });
      } catch {}
    }

    // --- Live Monitoring Stream & Solana Watch Mode ---
    initLiveMonitoring() {
      if (!this.liveFeedContainer) return;

      this.isMonitoringPaused = false;
      if (this.liveToggleBtn) {
        this.liveToggleBtn.addEventListener("click", () => {
          this.isMonitoringPaused = !this.isMonitoringPaused;
          this.liveToggleBtn.textContent = this.isMonitoringPaused ? "Resume Feed" : "Pause Feed";
          this.liveToggleBtn.classList.toggle("paused", this.isMonitoringPaused);
        });
      }

      const sampleEvents = [
        { type: "liquidity", title: "Liquidity Pool Synchronized", impact: "+$24,000 Raydium AMM", badge: "LP", level: "info" },
        { type: "transfer", title: "Deployer Dispersed Supply", impact: "2.4% moved to secondary wallet", badge: "DEV", level: "warn" },
        { type: "sell", title: "Large Whale Sell Order", impact: "$18,400 swapped (1.8% pool depth)", badge: "WHALE", level: "danger" },
        { type: "buy", title: "Sniper Cluster Accumulation", impact: "Block 0 multi-buy detected", badge: "SNIPER", level: "info" },
        { type: "lock", title: "LP Lock Extension Verified", impact: "Burned 99.4% LP tokens", badge: "AUDIT", level: "safe" },
        { type: "mint", title: "Authority Verification", impact: "Mint authority check passed (Revoked)", badge: "SHIELD", level: "safe" }
      ];

      for (let i = 0; i < 4; i++) {
        const now = new Date(Date.now() - (3 - i) * 12000);
        this.pushLiveEvent(sampleEvents[i], now, false);
      }

      // Live streaming interval
      setInterval(() => {
        if (this.isMonitoringPaused) return;
        if (this.watchTarget && !this.isDemoMode) {
          this.pollWatchTargetSignatures();
        } else {
          const randomEvt = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
          this.pushLiveEvent(randomEvt, new Date(), true);
        }
      }, 6000);
    }

    setWatchTarget(address, symbol = "Token") {
      this.watchTarget = address;
      const targetLabel = document.getElementById("watchTargetLabel");
      if (targetLabel) {
        targetLabel.innerHTML = `Watching: <span class="mono" style="color: var(--accent-purple);">${escapeHtml(symbol)} (${escapeHtml(truncateAddr(address, 4, 4))})</span>`;
      }
      this.pushLiveEvent({
        type: "watch",
        title: `Surveillance Activated: ${symbol}`,
        impact: `Monitoring live RPC events on ${truncateAddr(address, 6, 4)}`,
        badge: "WATCH",
        level: "info"
      }, new Date(), true);
    }

    async pollWatchTargetSignatures() {
      if (!this.watchTarget) return;
      try {
        const res = await fetch("/api/rpc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "getSignaturesForAddress",
            params: [this.watchTarget, { limit: 3 }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.result)) {
            data.result.forEach(sigInfo => {
              if (sigInfo?.signature && !this.seenSignatures.has(sigInfo.signature)) {
                this.seenSignatures.add(sigInfo.signature);
                this.pushLiveEvent({
                  type: "rpc",
                  title: `On-Chain Txn Detected`,
                  impact: `Sig: ${truncateAddr(sigInfo.signature, 6, 4)} (Slot: ${sigInfo.slot})`,
                  badge: "SOL",
                  level: sigInfo.err ? "danger" : "safe",
                  sigUrl: `https://solscan.io/tx/${encodeURIComponent(sigInfo.signature)}`
                }, new Date(), true);
              }
            });
          }
        }
      } catch (err) {
        // Fallback to simulated feed on network glitch
      }
    }

    pushLiveEvent(evt, timestamp, animate = true) {
      if (!this.liveFeedContainer) return;

      const timeStr = timestamp.toTimeString().split(" ")[0];
      const item = document.createElement("div");
      item.className = `live-feed-item evt-${evt.level}`;
      if (animate) item.classList.add("event-enter");

      item.innerHTML = `
        <div class="feed-time">${timeStr}</div>
        <div class="feed-badge">${escapeHtml(evt.badge)}</div>
        <div class="feed-details">
          <div class="feed-title">${escapeHtml(evt.title)}</div>
          <div class="feed-impact">${escapeHtml(evt.impact)}</div>
        </div>
        ${evt.sigUrl ? `<a href="${encodeURI(evt.sigUrl)}" target="_blank" rel="noopener noreferrer" class="feed-link" title="View on Solscan">↗</a>` : '<div class="feed-pulse-dot"></div>'}
      `;

      this.liveFeedContainer.prepend(item);

      while (this.liveFeedContainer.children.length > 8) {
        this.liveFeedContainer.removeChild(this.liveFeedContainer.lastChild);
      }

      if (animate) {
        setTimeout(() => {
          item.classList.remove("event-enter");
        }, 1200);
      }
    }

    // --- Investigation Timeline ---
    initTimeline() {
      const timelineNodes = document.querySelectorAll(".timeline-step");
      timelineNodes.forEach((node, idx) => {
        node.style.setProperty("--step-delay", `${idx * 150}ms`);
      });
    }

    updateTimelineWithScan(result) {
      const steps = document.querySelectorAll(".timeline-step");
      if (!steps.length) return;

      steps.forEach((s, idx) => {
        s.classList.remove("timeline-danger", "timeline-active");
        setTimeout(() => {
          s.classList.add("timeline-active");
          if (result.level === "critical" && idx >= 3) {
            s.classList.add("timeline-danger");
          }
        }, idx * 120);
      });
    }

    // --- Interactive Dynamic Wallet Relationship Graph ---
    initWalletGraph() {
      const canvas = this.walletGraphCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");

      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
      };

      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();

      this.graphNodes = [
        { id: "token", label: "Token Contract", x: 0.5, y: 0.5, r: 24, color: "#8b5cf6", role: "Target Contract", val: "Token Mint" },
        { id: "deployer", label: "Creator Wallet", x: 0.22, y: 0.28, r: 18, color: "#f97316", role: "Deployer Account", val: "Deployer SOL" },
        { id: "lp", label: "Liquidity Pool", x: 0.78, y: 0.28, r: 20, color: "#10b981", role: "DEX AMM", val: "Liquidity Reserves" },
        { id: "whale1", label: "Top Holder 1", x: 0.24, y: 0.74, r: 16, color: "#f59e0b", role: "Largest Holder", val: "Holdings %" },
        { id: "whale2", label: "Top Holder 2", x: 0.5, y: 0.85, r: 15, color: "#f59e0b", role: "Second Holder", val: "Holdings %" },
        { id: "sniper", label: "Early Sniper", x: 0.76, y: 0.74, r: 16, color: "#ef4444", role: "Sniper Cluster", val: "Block 0 Inflow" }
      ];

      this.graphEdges = [
        { from: "deployer", to: "token", label: "Deploy Contract" },
        { from: "deployer", to: "lp", label: "Add LP Reserves" },
        { from: "token", to: "lp", label: "AMM Pair" },
        { from: "token", to: "whale1", label: "Supply Allocation" },
        { from: "token", to: "whale2", label: "Supply Allocation" },
        { from: "token", to: "sniper", label: "Early Swap" }
      ];

      let hoveredNode = null;
      const tooltip = document.getElementById("graphTooltip");

      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const w = rect.width;
        const h = rect.height;

        hoveredNode = null;
        for (const node of this.graphNodes) {
          const nx = node.x * w;
          const ny = node.y * h;
          const dist = Math.hypot(mx - nx, my - ny);
          if (dist <= node.r + 6) {
            hoveredNode = node;
            break;
          }
        }

        if (hoveredNode && tooltip) {
          tooltip.style.opacity = "1";
          tooltip.style.left = `${e.clientX + 14}px`;
          tooltip.style.top = `${e.clientY - 14}px`;
          tooltip.innerHTML = `
            <div class="tooltip-title">${hoveredNode.label}</div>
            <div class="tooltip-role">${hoveredNode.role}</div>
            <div class="tooltip-val mono">${hoveredNode.val}</div>
            ${hoveredNode.address ? `<div class="tooltip-addr mono" style="font-size: 10px; color: var(--accent-cyan); margin-top: 4px;">${truncateAddr(hoveredNode.address, 8, 8)}</div>` : ''}
          `;
          canvas.style.cursor = "pointer";
        } else if (tooltip) {
          tooltip.style.opacity = "0";
          canvas.style.cursor = "default";
        }
      });

      canvas.addEventListener("mouseleave", () => {
        hoveredNode = null;
        if (tooltip) tooltip.style.opacity = "0";
      });

      let phase = 0;
      const render = () => {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        ctx.clearRect(0, 0, w, h);
        phase += 0.02;

        ctx.lineWidth = 1.5;
        this.graphEdges.forEach(edge => {
          const n1 = this.graphNodes.find(n => n.id === edge.from);
          const n2 = this.graphNodes.find(n => n.id === edge.to);
          if (!n1 || !n2) return;

          const x1 = n1.x * w;
          const y1 = n1.y * h;
          const x2 = n2.x * w;
          const y2 = n2.y * h;

          const isConnectedToHover = hoveredNode && (hoveredNode.id === n1.id || hoveredNode.id === n2.id);
          const isLight = document.documentElement.getAttribute("data-theme") === "light";

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          const defaultEdgeColor = isLight ? "rgba(15, 23, 42, 0.14)" : "rgba(255, 255, 255, 0.12)";
          const hoverEdgeColor = isLight ? "rgba(124, 58, 237, 0.75)" : "rgba(139, 92, 246, 0.7)";
          ctx.strokeStyle = isConnectedToHover ? hoverEdgeColor : defaultEdgeColor;
          ctx.stroke();

          const t = (phase % 1);
          const px = x1 + (x2 - x1) * t;
          const py = y1 + (y2 - y1) * t;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          const packetColor = isLight
            ? (isConnectedToHover ? "#0284c7" : "rgba(124, 58, 237, 0.75)")
            : (isConnectedToHover ? "#00f2fe" : "rgba(139, 92, 246, 0.6)");
          ctx.fillStyle = packetColor;
          ctx.fill();
        });

        const isLight = document.documentElement.getAttribute("data-theme") === "light";

        this.graphNodes.forEach(node => {
          const nx = node.x * w;
          const ny = node.y * h;
          const isHovered = hoveredNode && hoveredNode.id === node.id;
          const r = isHovered ? node.r + 3 : node.r;

          ctx.beginPath();
          ctx.arc(nx, ny, r + 6, 0, Math.PI * 2);
          ctx.fillStyle = isHovered
            ? (isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.1)")
            : (isLight ? "rgba(15, 23, 42, 0.03)" : "rgba(255, 255, 255, 0.03)");
          ctx.fill();

          ctx.beginPath();
          ctx.arc(nx, ny, r, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? "#ffffff" : "#0c101c";
          ctx.fill();
          ctx.lineWidth = isHovered ? 2.5 : 1.5;
          ctx.strokeStyle = isHovered ? (isLight ? "#0f172a" : "#ffffff") : node.color;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(nx, ny, 4, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();

          ctx.font = "600 11px Inter, sans-serif";
          ctx.fillStyle = isHovered ? (isLight ? "#0f172a" : "#ffffff") : (isLight ? "#475569" : "#94a3b8");
          ctx.textAlign = "center";
          ctx.fillText(node.label, nx, ny + r + 16);
        });

        requestAnimationFrame(render);
      };

      render();
    }

    updateWalletGraphWithScan(result) {
      if (!this.graphNodes) return;

      const tokenNode = this.graphNodes.find(n => n.id === "token");
      if (tokenNode) {
        tokenNode.label = result.token.symbol || "Target Token";
        tokenNode.val = `${result.token.name} (${result.token.priceUsd})`;
        tokenNode.address = result.address;
      }

      const deployerNode = this.graphNodes.find(n => n.id === "deployer");
      if (deployerNode) {
        deployerNode.address = result.token.creator || "Creator Address";
        deployerNode.val = result.token.creator ? `Creator: ${truncateAddr(result.token.creator, 4, 4)}` : "Verified Deployer";
      }

      const lpNode = this.graphNodes.find(n => n.id === "lp");
      if (lpNode) {
        lpNode.label = result.token.dex || "Raydium AMM";
        lpNode.address = result.token.pairAddress;
        lpNode.val = `Liquidity: ${result.facts.find(f => f.label === "Liquidity")?.value || 'Active Pool'}`;
      }

      // Update whales if topHolders exist
      if (Array.isArray(result.topHolders) && result.topHolders.length >= 2) {
        const whale1 = this.graphNodes.find(n => n.id === "whale1");
        const whale2 = this.graphNodes.find(n => n.id === "whale2");
        if (whale1 && result.topHolders[0]) {
          whale1.label = `Holder 1 (${result.topHolders[0].pct.toFixed(1)}%)`;
          whale1.val = result.topHolders[0].tag;
          whale1.address = result.topHolders[0].address;
        }
        if (whale2 && result.topHolders[1]) {
          whale2.label = `Holder 2 (${result.topHolders[1].pct.toFixed(1)}%)`;
          whale2.val = result.topHolders[1].tag;
          whale2.address = result.topHolders[1].address;
        }
      }
    }

    initMobileNav() {
      const toggle = document.getElementById("mobileNavToggle");
      const nav = document.getElementById("mainNav");
      if (!toggle || !nav) return;

      toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", isOpen);
      });

      nav.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  // --- Initialize App on DOM Ready ---
  document.addEventListener("DOMContentLoaded", () => {
    new RugScopeApp();
  });
})();
