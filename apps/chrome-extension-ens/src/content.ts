import { getRawContentHash } from './getRawContentHash';
import { idToBase36 } from './objectIdToSiteId';

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

    // Get raw content hash using the imported function
    const rawContentHash = await getRawContentHash(ensName);

    if (!rawContentHash) {
      console.log("No content hash found for", ensName);
      chrome.runtime.sendMessage({
        type: "ENS_RESOLUTION_ERROR",
        domain: ensName,
        error: "No content hash found",
      });
      return;
    }

    console.log("Raw content hash:", rawContentHash);

    // Convert the content hash to base36 using the imported function
    // Remove '0x' prefix if present before passing to idToBase36
    const cleanHash = rawContentHash.startsWith('0x') ? rawContentHash.slice(2) : rawContentHash;
    const base36Value = idToBase36(cleanHash);
    const targetUrl = `https://${base36Value}.stablerecruit.com/`;

    console.log("Converted to base36:", base36Value);
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
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "ENS_DOMAIN_DETECTED") {
    console.log("Background script detected ENS domain:", message.domain);
    // Re-resolve if needed
    resolveENSName(message.domain);
  }
  sendResponse({ status: "ok" });
});
