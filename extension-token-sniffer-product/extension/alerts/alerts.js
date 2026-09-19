const alertsNode = document.getElementById("alerts");
const emptyState = document.getElementById("emptyState");
const alertCount = document.getElementById("alertCount");
const latestAlert = document.getElementById("latestAlert");
const refreshButton = document.getElementById("refreshButton");
const clearButton = document.getElementById("clearButton");

document.addEventListener("DOMContentLoaded", loadAlerts);
refreshButton.addEventListener("click", loadAlerts);
clearButton.addEventListener("click", clearAlerts);
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.rugscopeWalletAlerts) {
    renderAlerts(changes.rugscopeWalletAlerts.newValue || []);
  }
});
setInterval(loadAlerts, 15000);

async function loadAlerts() {
  const response = await chrome.runtime.sendMessage({ type: "rugscope:get-wallet-alerts" }).catch((error) => ({
    ok: false,
    error: error.message
  }));

  if (!response?.ok) {
    renderAlerts([]);
    return;
  }

  renderAlerts(response.alerts || []);
}

async function clearAlerts() {
  clearButton.disabled = true;
  await chrome.runtime.sendMessage({ type: "rugscope:clear-wallet-alerts" }).catch(() => {});
  clearButton.disabled = false;
  renderAlerts([]);
}

function renderAlerts(alerts) {
  alertCount.textContent = String(alerts.length);
  latestAlert.textContent = alerts[0] ? formatTime(alerts[0].timestamp) : "None";
  alertsNode.innerHTML = "";

  if (!alerts.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  alertsNode.innerHTML = alerts.map((alert) => `
    <article class="alert">
      <span class="badge ${escapeAttribute(alert.kind || "buy")}">${escapeHtml(alert.kind || "buy")}</span>
      <div>
        <h2>${escapeHtml(alert.walletLabel || "Tracked wallet")}${alert.isDev ? " / Dev" : ""}</h2>
        <p>${escapeHtml(alertSummary(alert))}</p>
        <small>${escapeHtml(shortAddress(alert.walletAddress || ""))} - ${escapeHtml(formatTime(alert.timestamp))}${alert.pageHost ? ` - ${escapeHtml(alert.pageHost)}` : ""}</small>
      </div>
      ${alert.txUrl ? `<a href="${escapeAttribute(alert.txUrl)}" target="_blank" rel="noopener">Transaction</a>` : ""}
    </article>
  `).join("");
}

function alertSummary(alert) {
  const side = alert.kind === "sell" ? "Sold" : "Bought";
  const amount = [alert.amount, alert.tokenSymbol].filter(Boolean).join(" ");
  const usd = alert.volumeUsd == null ? "" : ` (${formatUsd(alert.volumeUsd)})`;
  const price = alert.priceUsd == null ? "" : ` at ${formatPrice(alert.priceUsd)}`;
  return `${side} ${amount || "tracked token"}${usd}${price}`;
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
  if (number >= 1) return `$${number.toFixed(4)}`;
  return `$${number.toPrecision(4)}`;
}

function formatTime(timestamp) {
  const number = Number(timestamp);
  if (!Number.isFinite(number)) return "Unknown time";
  return new Date(number * 1000).toLocaleString();
}

function shortAddress(address) {
  const value = String(address || "");
  return value.length > 14 ? `${value.slice(0, 6)}...${value.slice(-6)}` : value;
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
