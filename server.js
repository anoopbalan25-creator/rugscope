const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const preferredPort = Number(process.env.PORT) || 5173;
const host = process.env.HOST || "localhost";
let currentPort = preferredPort;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".zip": "application/zip",
  ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || `${host}:${currentPort}`}`);
  let safePath = "";
  try {
    safePath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  } catch {
    send(response, 400, "text/plain; charset=utf-8", "Bad request");
    return;
  }

  const requestedPath = safePath || "index.html";

  // Endpoint: /api/status
  if (url.pathname === "/api/status") {
    const hasRpcFast = Boolean(process.env.RPC_FAST_URL || process.env.RPC_FAST_API_KEY);
    const rpcProvider = hasRpcFast ? "RPC Fast" : (process.env.SOLANA_RPC_URL ? "Custom RPC" : "Solana Public Mainnet");
    send(response, 200, "application/json; charset=utf-8", JSON.stringify({
      ok: true,
      service: "RugScope AI Security Gateway",
      version: "2.0.0-hackathon",
      rpcProvider,
      isRpcFastConfigured: hasRpcFast,
      port: currentPort
    }));
    return;
  }

  // Endpoint: /api/rpc (Solana JSON-RPC Gateway with RPC Fast support)
  if (url.pathname === "/api/rpc") {
    if (request.method !== "POST") {
      send(response, 405, "application/json; charset=utf-8", JSON.stringify({ error: "Method not allowed. Use POST." }));
      return;
    }

    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        request.destroy();
      }
    });

    request.on("end", () => {
      let rpcReq = null;
      try {
        rpcReq = JSON.parse(body);
      } catch (err) {
        send(response, 400, "application/json; charset=utf-8", JSON.stringify({ error: "Invalid JSON-RPC payload" }));
        return;
      }

      const method = rpcReq.method;
      const allowedMethods = [
        "getSignaturesForAddress",
        "getTransaction",
        "getAccountInfo",
        "getTokenLargestAccounts",
        "getMultipleAccounts",
        "getTokenSupply",
        "getSlot",
        "getBlockHeight"
      ];

      if (!allowedMethods.includes(method)) {
        send(response, 403, "application/json; charset=utf-8", JSON.stringify({
          jsonrpc: "2.0",
          id: rpcReq.id || 1,
          error: { code: -32601, message: `Method '${method}' not permitted through gateway` }
        }));
        return;
      }

      // Determine target Solana RPC endpoint
      let rpcTarget = process.env.RPC_FAST_URL || process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
      const apiKey = process.env.RPC_FAST_API_KEY;
      if (apiKey && process.env.RPC_FAST_URL && !rpcTarget.includes("api-key")) {
        const joiner = rpcTarget.includes("?") ? "&" : "?";
        rpcTarget = `${rpcTarget}${joiner}api-key=${encodeURIComponent(apiKey)}`;
      }

      try {
        const targetParsed = new URL(rpcTarget);
        const https = require("https");
        const httpLib = targetParsed.protocol === "http:" ? require("http") : https;

        const proxyPayload = JSON.stringify({
          jsonrpc: "2.0",
          id: rpcReq.id || `rugscope-${Date.now()}`,
          method: rpcReq.method,
          params: rpcReq.params || []
        });

        const reqHeaders = {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(proxyPayload),
          "User-Agent": "RugScope-AI/2.0"
        };
        if (apiKey) {
          reqHeaders["x-api-key"] = apiKey;
        }

        const rpcClientReq = httpLib.request(targetParsed, {
          method: "POST",
          headers: reqHeaders,
          timeout: 7000
        }, (rpcRes) => {
          let rpcBody = "";
          rpcRes.on("data", (d) => { rpcBody += d; });
          rpcRes.on("end", () => {
            send(response, rpcRes.statusCode || 200, "application/json; charset=utf-8", rpcBody);
          });
        });

        rpcClientReq.on("timeout", () => {
          rpcClientReq.destroy();
          send(response, 504, "application/json; charset=utf-8", JSON.stringify({
            jsonrpc: "2.0",
            id: rpcReq.id || 1,
            error: { code: -32000, message: "Solana RPC request timed out" }
          }));
        });

        rpcClientReq.on("error", (err) => {
          send(response, 502, "application/json; charset=utf-8", JSON.stringify({
            jsonrpc: "2.0",
            id: rpcReq.id || 1,
            error: { code: -32000, message: redactSecret(`RPC gateway error: ${err.message}`) }
          }));
        });

        rpcClientReq.write(proxyPayload);
        rpcClientReq.end();
      } catch (err) {
        send(response, 500, "application/json; charset=utf-8", JSON.stringify({
          jsonrpc: "2.0",
          id: rpcReq.id || 1,
          error: { code: -32000, message: redactSecret(`Internal gateway error: ${err.message}`) }
        }));
      }
    });
    return;
  }

  // Endpoint: /api/proxy
  if (url.pathname === "/api/proxy") {
    const targetUrl = url.searchParams.get("url");
    if (!targetUrl || !/^https:\/\/(api\.dexscreener\.com|api\.rugcheck\.xyz|api\.geckoterminal\.com|api\.mainnet-beta\.solana\.com)\//.test(targetUrl)) {
      send(response, 400, "application/json; charset=utf-8", JSON.stringify({ error: "Invalid proxy target" }));
      return;
    }
    const https = require("https");
    https.get(targetUrl, { headers: { "User-Agent": "RugScope/2.0" } }, (proxyRes) => {
      response.writeHead(proxyRes.statusCode || 200, {
        "Content-Type": proxyRes.headers["content-type"] || "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      });
      proxyRes.pipe(response);
    }).on("error", (err) => {
      send(response, 502, "application/json; charset=utf-8", JSON.stringify({ error: err.message }));
    });
    return;
  }
  const resolvedPath = path.resolve(root, requestedPath);
  const relativePath = path.relative(root, resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    send(response, 403, "text/plain; charset=utf-8", "Forbidden");
    return;
  }

  fs.stat(resolvedPath, (statError, stats) => {
    if (statError) {
      send(response, 404, "text/plain; charset=utf-8", "Not found");
      return;
    }

    const filePath = stats.isDirectory() ? path.join(resolvedPath, "index.html") : resolvedPath;
    fs.readFile(filePath, (readError, content) => {
      if (readError) {
        send(response, 404, "text/plain; charset=utf-8", "Not found");
        return;
      }

      const type = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      send(response, 200, type, content);
    });
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && currentPort < preferredPort + 20) {
    currentPort += 1;
    server.listen(currentPort, host);
    return;
  }

  throw error;
});

server.listen(currentPort, host, () => {
  console.log(`Rugscope site running at http://${host}:${currentPort}`);
});

function send(response, statusCode, contentType, content) {
  response.writeHead(statusCode, {
    "Content-Type": contentType
  });
  response.end(content);
}

function redactSecret(str) {
  if (!str || typeof str !== "string") return str;
  const apiKey = process.env.RPC_FAST_API_KEY;
  if (apiKey && apiKey.length > 3) {
    str = str.split(apiKey).join("[REDACTED]");
  }
  return str.replace(/api-?key=[^&\s"'`]+/gi, "api-key=[REDACTED]");
}
