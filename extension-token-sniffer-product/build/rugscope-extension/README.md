# Rugscope Chrome Extension

Rugscope is a Manifest V3 Chrome extension that scans the active page for crypto token contract or mint addresses, shows risk signals in a page overlay and popup, badges tracked wallet matches on the viewed page, and stores wallet alerts locally.

## Install Locally

1. Download and unzip `rugscope-extension.zip`.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the unzipped `rugscope-extension` folder.

## Data Sources

- DEX Screener public API for pair, liquidity, price-change, transaction, and market data.
- RugCheck public token report endpoints for Solana mint authority, freeze authority, LP lock, holder, and risk flags.

The extension sends only detected token addresses to those public APIs. It does not read wallet keys, cookies, passwords, private keys, seed phrases, or auth tokens.
