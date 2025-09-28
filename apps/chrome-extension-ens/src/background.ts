// background.js
console.log("Service worker started");

// Example: listen for install / activate events
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or updated");
});

// Example: listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message from content script:", message);
  sendResponse({ status: "ok" });
});
