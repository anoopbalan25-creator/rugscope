# RugScope AI &mdash; Solana Token & Wallet Risk Intelligence Platform

> **Colosseum Crypto World's Fair Hackathon Entry**  
> AI-Powered on-chain threat detection, 5-pillar mathematical risk scoring, and real-time wallet forensics for Solana traders and builders.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [The Solution](#the-solution)
4. [System Architecture](#system-architecture)
5. [Hackathon Provenance & Feature Audit](#hackathon-provenance--feature-audit)
6. [5-Pillar Risk Methodology](#5-pillar-risk-methodology)
7. [Grounded AI Risk Explainer](#grounded-ai-risk-explainer)
8. [Data Sources & Integrations](#data-sources--integrations)
9. [RPC Fast & Solana RPC Integration](#rpc-fast--solana-rpc-integration)
10. [Local Setup & Low-End PC Optimization](#local-setup--low-end-pc-optimization)
11. [Environment Variables](#environment-variables)
12. [Judge Walkthrough & Demo Instructions](#judge-walkthrough--demo-instructions)
13. [Known Limitations & Ethical Disclaimers](#known-limitations--ethical-disclaimers)

---

## Executive Summary

**RugScope AI** transforms decentralized risk assessment from a basic, opaque pass/fail check into an institutional-grade on-chain intelligence platform. By combining real-time decentralized exchange liquidity diagnostics (DexScreener API), Solana program analysis (SPL Token & Token-2022 authorities), cluster wallet relationship visualization, and a deterministic AI explanation engine, RugScope delivers actionable, verifiable security telemetry before users execute swaps.

---

## Problem Statement

The Solana ecosystem processes over 40 million non-vote transactions daily, with hundreds of new memecoins and tokens initialized every hour via bonding curves (pump.fun) and automated market makers (Raydium, Orca, Meteora). 

Traders and builders face four acute hazards:
1. **Predatory Authorities**: Token creators retaining `freezeAccount` permissions (creating honeypots where buyers cannot sell) or `mintTo` permissions (enabling arbitrary hyper-dilution).
2. **Stealth Liquidity Extraction**: Developers seeding pools with unlocked LP tokens, waiting for public buy volume, and extracting paired SOL within blocks.
3. **Sybil & Cluster Monopolization**: Devs funding multiple secondary burner wallets prior to launch to disguise heavy insider supply concentration (&gt; 70%).
4. **Opaque & Hallucinatory Scanners**: Existing tools frequently output arbitrary black-box scores or rely on generative models that invent non-existent blockchain transactions.

---

## The Solution

RugScope solves these challenges with zero user cost and zero hardware barriers:
- **Transparent 5-Pillar Scoring**: 100-point weighted heuristic matrix with explicit mathematical point allocation and no fake precision.
- **Evidence-Bound Grounded AI**: Converts verified on-chain metrics into plain English summaries strictly citing extracted facts.
- **Interactive Entity Network Canvas**: High-DPI forensic graph mapping connections between the Token Mint, Creator Account, Liquidity Pool, and Top Holders with Solscan links.
- **Real-Time Surveillance Engine**: Live on-chain monitoring using an authenticated RPC Fast gateway or public Solana JSON-RPC.
- **Temporal Snapshot Tracker**: Persists scan history in local browser storage to monitor liquidity drops, authority alterations, and score degradation over time.
- **₹0 Budget & Low-End PC Compatibility**: Pure native Node.js HTTP server (zero external database or cloud requirements) and optimized HTML5 Canvas graphics.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            RUGSCOPE AI PLATFORM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Browser Client (Web Terminal & Chrome Extension)                           │
│  ├── Tri-Mode Theme Engine (Dark / Light / OS System Sync)                  │
│  ├── Dedicated Demo Sandbox (Offline realistic archetypes)                  │
│  ├── 5-Pillar Score Visualizer & Mathematical Calculation Modal             │
│  ├── Top Holders Supply Monopolization Table (Solscan links)                │
│  ├── Grounded AI Risk Narrative Generator                                  │
│  ├── Dynamic Entity Relationship Canvas Graph                               │
│  ├── Real-Time Solana Watch Mode & On-Chain Event Stream                    │
│  └── Local Risk History Snapshot & Delta Engine                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Backend Server (server.js - Lightweight Native Node.js)                    │
│  ├── Zero-dependency static file server                                     │
│  ├── Whitelisted Public API Proxy (/api/proxy)                              │
│  └── Secure Solana JSON-RPC Gateway (/api/rpc)                              │
│      ├── Securely passes RPC_FAST_URL and RPC_FAST_API_KEY                  │
│      ├── Rate-limit resilience & public mainnet fallback                   │
│      └── Zero client-side API key leakage                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  External On-Chain APIs & RPC Providers                                     │
│  ├── DexScreener API: Real-time pool liquidity, price, 1h/24h volume & txns │
│  ├── RugCheck API: Authority status, LP burn %, topHolders array            │
│  └── RPC Fast / Solana JSON-RPC: getSignaturesForAddress, getSlot, supply   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Hackathon Provenance & Feature Audit

In compliance with Colosseum hackathon rules, all pre-existing foundation and new hackathon work are honestly disclosed:

| Component | Pre-Existing Work | Built for Hackathon |
| :--- | :--- | :--- |
| **Backend Gateway** | Basic static HTTP server with `/api/proxy` whitelist. | **Secure Solana RPC Gateway (`/api/rpc`)** supporting RPC Fast credentials, method whitelisting, rate-limit shielding, and `/api/status` telemetry. |
| **Risk Scoring** | Monolithic score accumulator with arbitrary increments. | **Transparent 5-Pillar Weighted Scoring Engine** (Authorities 30%, Liquidity 25%, Holders 20%, Market 15%, Maturity 10%) with explicit formula breakdown modal. |
| **AI Explanation** | 4 static generic tier strings. | **Grounded AI Risk Explainer**: Evidence-bound deterministic natural-language engine explaining verified metrics without hallucinations. |
| **Wallet Graph** | Static decorative canvas with 6 hardcoded mock nodes. | **Dynamic Data-Driven Entity Network**: Parses real scanned token mint, deployer, DEX pool, and actual top holder accounts with percentages and Solscan verification. |
| **Live Surveillance** | Static randomized ticker picking from 6 dummy strings. | **Real-Time Watch Mode**: Active polling on a monitored token or wallet address using `/api/rpc` (`getSignaturesForAddress`), with safe fallback. |
| **Risk History** | None (ephemeral single scan). | **Local Risk History & Snapshot Engine**: Persists scans in local storage, tracks score/liquidity deltas, and displays comparison cards. |
| **Demo Mode** | 4 preset buttons without formal labeling. | **Dedicated Demo Sandbox**: Clear toggle switch (`Live Network` vs `Demo Sandbox`) with 4 realistic Solana risk archetypes and clear sandbox warning banners. |
| **Documentation** | Minimal 34-line extension README. | **Comprehensive Hackathon Documentation**: Architecture guide, RPC Fast setup, threat scoring methodology, hackathon feature delta, judge evaluation guide, and local run instructions. |

---

## 5-Pillar Risk Methodology

RugScope evaluates tokens against a 100-point heuristic penalty matrix across five objective security pillars. A higher score represents greater structural and liquidity hazard:

### 1. Authorities & Permissions (Max 30 pts &bull; 30% Weight)
- **Active Mint Authority (+16 pts)**: Creator can mint arbitrary additional supply, causing immediate hyper-dilution.
- **Active Freeze Authority (+14 pts)**: Creator can freeze token accounts, preventing selling (honeypot pattern).
- **Token-2022 Non-Standard Extensions (+6 pts)**: Permanent delegates or high transfer fee hooks.

### 2. Liquidity Depth & Lock Security (Max 25 pts &bull; 25% Weight)
- **Unlocked / Unburned LP (+12 to +16 pts)**: Less than 20% of LP tokens locked or burned; developer can drain reserves anytime.
- **Fragile Reserve Cushion (+10 to +16 pts)**: Pool liquidity under $1,000 USD (micro-pool) or under $10,000 USD (thin pool).
- **FDV / Liquidity Disparity (+3 to +6 pts)**: FDV exceeding 100x pool liquidity creates massive exit friction.

### 3. Holder Dispersal & Concentration (Max 20 pts &bull; 20% Weight)
- **Top 10 Supply Monopolization (+8 to +14 pts)**: Top 10 wallets holding &gt; 45% (concentrated) or &gt; 70% (severe dump risk).
- **Single Whale Dominance (+6 pts)**: Non-pool wallet holding &gt; 15% of supply.

### 4. Market Dynamics & Volume Pressure (Max 15 pts &bull; 15% Weight)
- **Severe Sell Skew (+4 to +7 pts)**: Sell transactions exceeding buys by &gt; 2.5x in recent blocks.
- **Rapid Drawdown (+6 to +8 pts)**: Price drop &gt; 35% in 1 hour or &gt; 50% in 24 hours.

### 5. Maturity & Program Integrity (Max 10 pts &bull; 10% Weight)
- **Nascent Genesis (+3 to +6 pts)**: Trading pair initialized &lt; 60 minutes or &lt; 24 hours ago.
- **Unverified DEX Route (+8 pts)**: Token without verified Raydium, Orca, or Meteora liquidity pool.

### Score Tiers
- **0–24 Low Risk**: Revoked authorities, verified locked liquidity, broad holder dispersal.
- **25–49 Moderate Risk**: Fair launch meme dynamics, elevated volatility, or nascent pool age.
- **50–74 High Risk**: Thin liquidity, heavy sell-side skew, or concentrated insider clusters.
- **75–100 Critical Threat**: Active freeze or mint keys, unlocked micro-liquidity, imminent capital loss hazard.

---

## Grounded AI Risk Explainer

RugScope avoids generative AI hallucinations by utilizing a deterministic on-chain evidence synthesis pipeline:
1. It ingests verified data structures from the 5-pillar engine.
2. It states exact, verified figures (e.g. *"Top 10 wallets control 78.4% of circulating tokens"*).
3. It explains the functional mechanism of flagged risks (e.g. why an active freeze key creates a honeypot).
4. It appends mandatory ethical disclaimers: heuristics quantify structural vulnerabilities and cannot legally or technically guarantee subjective developer intent.

---

## Data Sources & Integrations

- **DexScreener REST API**: High-frequency price, liquidity USD, base/quote reserves, and 1h/24h transaction volume.
- **RugCheck API**: Solana token mint inspection, LP lock percentages, program authority states, and top holder account arrays.
- **RPC Fast / Solana JSON-RPC**: Raw on-chain verification, slot heights, and transaction signature tracking via `getSignaturesForAddress`.

---

## RPC Fast & Solana RPC Integration

RugScope features native support for **RPC Fast** (and custom Solana RPC endpoints):
- When `RPC_FAST_URL` and `RPC_FAST_API_KEY` are provided in the environment, `server.js` routes all JSON-RPC queries through the accelerated RPC Fast endpoint.
- Headers (`x-api-key`) and URL parameters are managed server-side, preventing API key exposure to the browser.
- If no RPC Fast key is present, the server automatically defaults to the Solana Public Mainnet endpoint (`https://api.mainnet-beta.solana.com`).
- If public RPC encounters rate limits (HTTP 429), the frontend gracefully falls back to simulated telemetry so judges and users experience zero service interruptions.

---

## Local Setup & Low-End PC Optimization

RugScope is designed to run seamlessly on low-end hardware (₹0 budget, no Docker, no external database, no heavyweight build pipeline):

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- A modern web browser (Chrome, Brave, Edge, Firefox)

### Installation & Launch

```powershell
# 1. Clone or navigate to the repository
cd rugscope

# 2. (Optional) Configure environment variables
Copy-Item .env.example .env

# 3. Launch the lightweight server
npm run dev
```

The terminal will report:
```
Rugscope site running at http://localhost:5173
```
Open **`http://localhost:5173`** in your browser.

---

## Environment Variables

Copy `.env.example` to `.env` to customize settings:

```ini
# Server Port (default: 5173)
PORT=5173
HOST=localhost

# RPC Fast Accelerated Solana RPC (Optional)
RPC_FAST_URL=https://solana-mainnet.fast.io
RPC_FAST_API_KEY=your_api_key_here

# Alternative Custom RPC (Optional fallback)
# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## Judge Walkthrough & Demo Instructions

Follow this 3-minute evaluation flow to test all features:

1. **Test Demo Sandbox**:
   - In the top navigation bar, toggle the **`Live Mainnet / Demo Sandbox`** switch to **`Demo Sandbox`**.
   - Notice the amber notification banner confirming simulated telemetry for offline evaluation.
2. **Evaluate Risk Archetypes**:
   - Click **`Bonk (SOL)`**: Inspect a verified low-risk asset (Score: 12/100, revoked keys, $8M+ deep LP).
   - Click **`Honeypot Flagged`**: Inspect a critical threat (Score: 94/100, active freeze key, active mint key, 0% locked LP).
   - Click **`Stealth Drain Candidate`**: Inspect a high-risk liquidity drain (Score: 79/100, 64% liquidity drop, 7:1 sell skew).
3. **Inspect the 5-Pillar Breakdown & Modal**:
   - Under the Risk Ring, click **`Scoring Formula`** to open the mathematical methodology modal.
   - Review the 5-pillar progress bars and the **Top Supply Distribution Table**.
4. **Inspect the Dynamic Wallet Graph**:
   - Scroll down to the **Interactive Wallet Relationship Graph**.
   - Hover over nodes to inspect the real token mint, deployer, liquidity pool, and whale accounts.
5. **Test Watch Mode & Live Surveillance**:
   - In the results panel, click **`Watch Token`**.
   - Watch the surveillance stream automatically calibrate to the target asset and monitor new on-chain swaps.
6. **Test Risk History**:
   - Scroll to the **Risk History & Snapshot Trajectory** section to see saved historical scans and compare risk trajectories.
7. **Test Live Mainnet Mode**:
   - Toggle back to **`Live Mainnet`** and paste any active Solana token mint address to test the live API and RPC pipeline.

---

## Known Limitations & Ethical Disclaimers

1. **Heuristic Scope**: RugScope performs automated on-chain forensics. While indicators like active freeze authorities or unlocked micro-pools strongly correlate with capital loss, heuristics do not constitute legal proof of malicious intent.
2. **Off-Chain Vectors**: RugScope scans public on-chain parameters. It cannot evaluate off-chain social engineering, compromised developer private keys, or Discord/Telegram takeover attacks.
3. **Financial Advice**: RugScope is an informational risk terminal built for traders and security researchers. It is not financial or investment advice. Always practice strict capital management.

---

&copy; 2026 RugScope. Built for the Solana ecosystem.
