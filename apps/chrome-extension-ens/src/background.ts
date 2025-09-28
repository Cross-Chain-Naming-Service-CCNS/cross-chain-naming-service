// Background service worker for ENS domain detection
console.log("ENS Walrus Resolver service worker started");

// Listen for extension installation/updates
chrome.runtime.onInstalled.addListener(() => {
  console.log("ENS Walrus Resolver extension installed or updated");
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url);
    const hostname = url.hostname.toLowerCase();

    // Check if this is an ENS domain
    if (hostname.endsWith(".eth")) {
      console.log(`Detected ENS domain: ${hostname}`);

      // Wait a moment for content script to be ready, then send message
      setTimeout(() => {
        chrome.tabs
          .sendMessage(tabId, {
            type: "ENS_DOMAIN_DETECTED",
            domain: hostname,
          })
          .catch((error) => {
            console.log(`Could not send message to tab ${tabId}:`, error);
            // Content script will handle ENS resolution automatically
          });
      }, 100);
    }
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("Received message from content script:", message);

  if (message.type === "ENS_RESOLUTION_START") {
    console.log(`Starting ENS resolution for: ${message.domain}`);
  } else if (message.type === "ENS_RESOLUTION_SUCCESS") {
    console.log(
      `Successfully resolved ENS domain: ${message.domain} -> ${message.url}`
    );
  } else if (message.type === "ENS_RESOLUTION_ERROR") {
    console.error(
      `Failed to resolve ENS domain: ${message.domain}`,
      message.error
    );
  }

  sendResponse({ status: "ok" });
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log("ENS Walrus Resolver extension started");
});
