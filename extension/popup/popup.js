const stateView = document.getElementById("stateView");
const resultView = document.getElementById("resultView");
const refreshButton = document.getElementById("refreshButton");
const scoreRing = document.getElementById("scoreRing");
const scoreValue = document.getElementById("scoreValue");
const riskLabel = document.getElementById("riskLabel");
const tokenName = document.getElementById("tokenName");
const tokenAddress = document.getElementById("tokenAddress");
const facts = document.getElementById("facts");
const flags = document.getElementById("flags");
const dexButton = document.getElementById("dexButton");
const alertsButton = document.getElementById("alertsButton");
const overlayButton = document.getElementById("overlayButton");
const walletStatus = document.getElementById("walletStatus");
const walletAddress = document.getElementById("walletAddress");
const walletLabel = document.getElementById("walletLabel");
const addWalletButton = document.getElementById("addWalletButton");
const walletList = document.getElementById("walletList");

let currentResult = null;

document.addEventListener("DOMContentLoaded", loadState);
refreshButton.addEventListener("click", refreshScan);
dexButton.addEventListener("click", () => openLink(currentResult?.links?.dex));
if (overlayButton) overlayButton.addEventListener("click", toggleInPageOverlay);
alertsButton.addEventListener("click", openAlerts);
addWalletButton.addEventListener("click", addWallet);

async function loadState() {
  showLoading("Scanning current tab");
  const [response] = await Promise.all([
    sendMessage({ type: "rugscope:get-active-tab-scan" }),
    loadWallets()
  ]);

  if (!response?.ok) {
    showEmpty(response?.error || "Could not read this tab.");
    return;
  }

  renderState(response.state);
}

async function loadWallets() {
  const response = await sendMessage({ type: "rugscope:get-wallets" });
  if (!response?.ok) {
    walletStatus.textContent = "Unavailable";
    return;
  }
  renderWallets(response.wallets || []);
}

async function addWallet() {
  addWalletButton.disabled = true;
  const response = await sendMessage({
    type: "rugscope:add-wallet",
    wallet: {
      address: walletAddress.value,
      label: walletLabel.value
    }
  });

  addWalletButton.disabled = false;
  if (!response?.ok) {
    walletStatus.textContent = response?.error || "Could not add";
    return;
  }

  walletAddress.value = "";
  walletLabel.value = "";
  renderWallets(response.wallets || []);
  await sendMessage({ type: "rugscope:poll-wallets" });
  await refreshScan();
}

async function removeWallet(id) {
  const response = await sendMessage({
    type: "rugscope:remove-wallet",
    id
  });

  if (!response?.ok) {
    walletStatus.textContent = response?.error || "Could not remove";
    return;
  }

  renderWallets(response.wallets || []);
  await sendMessage({ type: "rugscope:poll-wallets" });
  await refreshScan();
}

function renderWallets(wallets) {
  walletStatus.textContent = wallets.length ? `${wallets.length} tracked` : "Add wallet";
  walletList.innerHTML = wallets.slice(0, 6).map((wallet) => `
    <div class="wallet-item">
      <div>
        <strong></strong>
        <span></span>
      </div>
      <button type="button" data-remove-wallet="${escapeAttribute(wallet.id)}" aria-label="Remove wallet">x</button>
    </div>
  `).join("");

  walletList.querySelectorAll(".wallet-item").forEach((item, index) => {
    const wallet = wallets[index];
    item.querySelector("strong").textContent = wallet.label || "Tracked wallet";
    item.querySelector("span").textContent = shortAddress(wallet.address || "");
  });

  walletList.querySelectorAll("[data-remove-wallet]").forEach((button) => {
    button.addEventListener("click", () => removeWallet(button.getAttribute("data-remove-wallet")));
  });
}

async function refreshScan() {
  refreshButton.disabled = true;
  showLoading("Refreshing scan");

  try {
    const response = await sendMessage({ type: "rugscope:rescan-active" });
    if (!response?.ok) {
      showEmpty(response?.error || "Refresh failed.");
      return;
    }
    renderState(response.state);
  } finally {
    refreshButton.disabled = false;
  }
}

function renderState(state) {
  if (state?.status === "scanning") {
    showLoading("Scanning detected token");
    return;
  }

  if (!state?.result) {
    showEmpty("No crypto token address was detected on this tab yet.");
    return;
  }

  currentResult = state.result;
  renderResult(currentResult);
}

function renderResult(result) {
  stateView.classList.add("hidden");
  resultView.classList.remove("hidden");

  const color = colorForLevel(result.level);
  scoreRing.style.setProperty("--risk", color);
  scoreValue.textContent = String(Math.round(result.score || 0));
  riskLabel.textContent = `${result.label || "Unknown"} risk`;
  riskLabel.style.color = color;

  const titleParts = [result.token?.name, result.token?.symbol ? `(${result.token.symbol})` : ""].filter(Boolean);
  tokenName.textContent = titleParts.join(" ") || "Detected token";
  tokenName.title = tokenName.textContent;
  tokenAddress.textContent = result.address || "";

  facts.innerHTML = "";
  for (const fact of result.facts || []) {
    const node = document.createElement("div");
    node.className = "fact";
    node.innerHTML = `<span></span><strong></strong>`;
    node.querySelector("span").textContent = fact.label;
    node.querySelector("strong").textContent = fact.value;
    facts.appendChild(node);
  }

  flags.innerHTML = "";
  for (const flag of result.flags || []) {
    const node = document.createElement("article");
    node.className = "flag";
    node.style.setProperty("--flag-color", colorForLevel(flag.level));
    node.innerHTML = `<i class="flag-dot"></i><div><strong></strong><p></p></div>`;
    node.querySelector("strong").textContent = flag.title || "Risk signal";
    node.querySelector("p").textContent = flag.detail || "";
    flags.appendChild(node);
  }

  dexButton.disabled = !result.links?.dex;
}

function showLoading(message) {
  currentResult = null;
  resultView.classList.add("hidden");
  stateView.classList.remove("hidden");
  stateView.innerHTML = `<div class="loader"></div><p></p>`;
  stateView.querySelector("p").textContent = message;
}

function showEmpty(message) {
  currentResult = null;
  resultView.classList.add("hidden");
  stateView.classList.remove("hidden");
  stateView.innerHTML = `<img src="../assets/icon48.png" alt="" class="logo"><p></p>`;
  stateView.querySelector("p").textContent = message;
}

function sendMessage(message) {
  return chrome.runtime.sendMessage(message).catch((error) => ({
    ok: false,
    error: error.message
  }));
}

function openLink(url) {
  if (!url) {
    return;
  }
  chrome.tabs.create({ url });
}

async function openAlerts() {
  await sendMessage({ type: "rugscope:open-alerts-page" });
}

async function toggleInPageOverlay() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: "rugscope:toggle-overlay" });
    if (res?.ok) {
      window.close();
      return;
    }
  } catch {
    // Content script not present yet; inject on-demand via activeTab if permitted
    try {
      if (chrome.scripting?.executeScript) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["src/content.js"]
        });
        setTimeout(async () => {
          await chrome.tabs.sendMessage(tab.id, { type: "rugscope:show-overlay" }).catch(() => {});
          window.close();
        }, 150);
      }
    } catch {
      // Ignored on restricted pages (e.g. chrome://)
    }
  }
}

function shortAddress(address) {
  const value = String(address || "");
  return value.length > 14 ? `${value.slice(0, 6)}...${value.slice(-6)}` : value;
}

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function colorForLevel(level) {
  if (level === "critical") return "#ff3b70";
  if (level === "high") return "#ff7a45";
  if (level === "moderate") return "#ffd166";
  if (level === "low") return "#30f2a2";
  return "#b582ff";
}
