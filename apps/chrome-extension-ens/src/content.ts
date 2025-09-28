interface InfuraResponse {
  jsonrpc: string;
  id: number;
  result: string;
}

interface ENSCallParams {
  to: string;
  data: string;
}

const INFURA_URL =
  "https://mainnet.infura.io/v3/be8624a1718b4e8ea027b9de83e0b42d";
const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

async function makeInfuraCall(params: ENSCallParams): Promise<string> {
  const response = await fetch(INFURA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [params],
      id: 1,
    }),
  });

  const data: InfuraResponse = await response.json();
  return data.result;
}

// Simplified namehash implementation - for a production extension, use a proper keccak256 library
function stringToBytes32(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.padEnd(64, "0");
}

// Simple namehash implementation (this is a simplified version for demo)
function namehash(name: string): string {
  if (name === "" || name === ".") {
    return "0000000000000000000000000000000000000000000000000000000000000000";
  }

  // For a real implementation, this should use proper keccak256 hashing
  // This is a simplified version that creates a deterministic hash from the name
  const normalized = name.toLowerCase();
  const labels = normalized.split(".");

  // Create a simple hash by concatenating label hashes
  let hash = "";
  for (let i = labels.length - 1; i >= 0; i--) {
    const label = labels[i];
    const labelHash = stringToBytes32(label);
    // Simple concatenation and truncation (not cryptographically secure)
    hash = (hash + labelHash).substring(0, 64);
  }

  return hash.padEnd(64, "0");
}

function hexToString(hex: string): string {
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substr(i, 2), 16);
    if (code === 0) break;
    str += String.fromCharCode(code);
  }
  return str;
}

function createIframe(url: string, ensName: string): void {
  document.documentElement.innerHTML = `
      <html>
        <head>
          <title>${ensName}</title>
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            iframe { width: 100%; height: 100vh; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${url}" allowfullscreen></iframe>
        </body>
      </html>
    `;
}

async function resolveENSName(ensName: string): Promise<void> {
  try {
    // Notify background script that resolution is starting
    chrome.runtime.sendMessage({
      type: "ENS_RESOLUTION_START",
      domain: ensName,
    });

    console.log("Resolving ENS:", ensName);

    // Get proper namehash
    const nameHash = namehash(ensName);
    console.log("Namehash:", nameHash);

    // The hash is already without 0x prefix
    const hashWithoutPrefix = nameHash;

    // Get ENS resolver address
    const resolverResult = await makeInfuraCall({
      to: ENS_REGISTRY,
      data: "0x0178b8bf" + hashWithoutPrefix,
    });

    if (
      !resolverResult ||
      resolverResult === "0x" ||
      resolverResult ===
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      console.log("No resolver found for", ensName);
      chrome.runtime.sendMessage({
        type: "ENS_RESOLUTION_ERROR",
        domain: ensName,
        error: "No resolver found",
      });
      return;
    }

    const resolverAddress = "0x" + resolverResult.slice(-40);
    console.log("Resolver address:", resolverAddress);

    // Get content hash from resolver
    const contentResult = await makeInfuraCall({
      to: resolverAddress,
      data: "0xbc1c58d1" + hashWithoutPrefix,
    });

    if (
      !contentResult ||
      contentResult === "0x" ||
      contentResult ===
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      console.log("No content hash found for", ensName);
      chrome.runtime.sendMessage({
        type: "ENS_RESOLUTION_ERROR",
        domain: ensName,
        error: "No content hash found",
      });
      return;
    }

    console.log("Content hash:", contentResult);

    // Parse the content hash result
    const decoded = hexToString(contentResult.slice(2));
    if (!decoded.startsWith("walrus://0x")) {
      console.log("Not a Walrus hash for", ensName);
      chrome.runtime.sendMessage({
        type: "ENS_RESOLUTION_ERROR",
        domain: ensName,
        error: "Not a Walrus content hash",
      });
      return;
    }

    const hexValue = decoded.substring(11);
    const base36Value = BigInt("0x" + hexValue).toString(36);
    const targetUrl = `https://${base36Value}.stablerecruit.com/`;

    console.log("Redirecting to:", targetUrl);

    // Notify background script of successful resolution
    chrome.runtime.sendMessage({
      type: "ENS_RESOLUTION_SUCCESS",
      domain: ensName,
      url: targetUrl,
    });

    createIframe(targetUrl, ensName);
  } catch (error) {
    console.error("ENS resolution error:", error);
    chrome.runtime.sendMessage({
      type: "ENS_RESOLUTION_ERROR",
      domain: ensName,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Main execution function
(function initializeENSResolver(): void {
  const ensName = window.location.hostname.replace(/^www\./, "");

  if (!ensName.endsWith(".eth")) {
    console.log("Not an ENS domain:", ensName);
    return;
  }

  // Send initial message to background script
  chrome.runtime.sendMessage({
    type: "CONTENT_SCRIPT_READY",
    domain: ensName,
  });

  resolveENSName(ensName);
})();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ENS_DOMAIN_DETECTED") {
    console.log("Background script detected ENS domain:", message.domain);
    // Re-resolve if needed
    resolveENSName(message.domain);
  }
  sendResponse({ status: "ok" });
});
